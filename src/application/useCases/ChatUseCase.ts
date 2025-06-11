import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import { IChatRepository } from '../../application/Interfaces/IChatRepository';
import { INotificationRepository } from '../../application/Interfaces/INotificationRepository';
import Chatlist from '../../domain/entities/Chatlist';
import Message from '../../domain/entities/Message';

export class ChatUseCase {
  constructor(
    private chatRepository: IChatRepository,
    private notificationRepository: INotificationRepository,
    private io: Server
  ) {}
  

  async initiateChat(teacherId: string, studentId: string): Promise<string> {
    console.log('ChatUseCase - initiateChat:', { teacherId, studentId });

    if (!mongoose.Types.ObjectId.isValid(teacherId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      throw new Error('Invalid teacherId or studentId format');
    }

    try {
      const chatId = await this.chatRepository.initiateChat(teacherId, studentId);
      
      // Emit events to both users
      this.io.to(teacherId).emit('newChat', { 
        chatId, 
        contact: studentId, 
        contactModel: 'Student',
        timestamp: new Date()
      });
      
      this.io.to(studentId).emit('newChat', { 
        chatId, 
        contact: teacherId, 
        contactModel: 'Teacher',
        timestamp: new Date()
      });

      return chatId;
    } catch (error) {
      console.error('Error in initiateChat:', error);
      throw new Error('Failed to initiate chat');
    }
  }

  async saveMessage(
    chatId: string,
    sender: string,
    senderModel: 'Teacher' | 'Student',
    receiver: string,
    receiverModel: 'Teacher' | 'Student',
    message: string,
    mediaUrl?: string,
    mediaType?: string,
    replyTo?: string
  ): Promise<Message> {
    try {
      if (!chatId || !sender || !senderModel || !receiver || !receiverModel) {
        throw new Error('Missing required fields');
      }

      if (!message && !mediaUrl) {
        throw new Error('Message or media required');
      }

      const messageData = {
        chatId,
        sender: new mongoose.Types.ObjectId(sender),
        senderModel,
        receiver: new mongoose.Types.ObjectId(receiver),
        receiverModel,
        message,
        mediaUrl,
        mediaType,
        replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : undefined,
        timestamp: new Date(),
      };

      console.log('ChatUseCase - saveMessage:', messageData);

      const savedMessage = await this.chatRepository.saveMessage(messageData);

      // Create notification for the receiver
      await this.notificationRepository.createNotification({
        userId: new mongoose.Types.ObjectId(receiver),
        userModel: receiverModel,
        type: mediaUrl ? 'media' : 'message',
        title: `New message from ${senderModel}`,
        message: message || (mediaUrl ? 'Media message' : 'New message'),
        sender: sender,
        senderModel: senderModel,
        role: receiverModel,
        data: {
          chatId,
          messageId: savedMessage.id,
          sender,
          senderModel
        }
      });

      // Emit the message to both sender and receiver
      this.io.to(sender).emit('receiveMessage', savedMessage);
      this.io.to(receiver).emit('receiveMessage', savedMessage);

      // Increment unread count for receiver
      await this.chatRepository.incrementUnreadCount(receiver, chatId);

      // Emit typing status reset
      this.io.to(chatId).emit('typing', { userId: sender, isTyping: false });

      return savedMessage;
    } catch (error) {
      console.error('Error in saveMessage:', error);
      throw new Error('Failed to save message');
    }
  }

  async getMessages(chatId: string, userId: string): Promise<Message[]> {
    try {
      if (!chatId) {
        throw new Error('Chat ID is missing');
      }
      const messages = await this.chatRepository.getMessages(chatId);
      
      // Reset unread count when messages are fetched
      await this.chatRepository.resetUnreadCount(userId, chatId);
      
      return messages;
    } catch (error) {
      console.error('Error in getMessages:', error);
      throw new Error('Failed to get messages');
    }
  }

  async getChatList(userId: string): Promise<Chatlist | null> {
    try {
      if (!userId) {
        throw new Error('User ID is missing');
      }
      return await this.chatRepository.getChatList(userId);
    } catch (error) {
      console.error('Error in getChatList:', error);
      throw new Error('Failed to get chat list');
    }
  }

  async addReaction(messageId: string, userId: string, reaction: string): Promise<Message> {
    try {
      const updatedMessage = await this.chatRepository.addReaction(messageId, userId, reaction);
      
      // Emit reaction to all users in the chat
      this.io.to(updatedMessage.sender.toString()).emit('messageReaction', {
        messageId: updatedMessage.id,
        reaction,
        userId
      });
      
      this.io.to(updatedMessage.receiver.toString()).emit('messageReaction', {
        messageId: updatedMessage.id,
        reaction,
        userId
      });
      
      return updatedMessage;
    } catch (error) {
      console.error('Error in addReaction:', error);
      throw new Error('Failed to add reaction');
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<Message> {
    try {
      const deletedMessage = await this.chatRepository.deleteMessage(messageId, userId);
      
      // Emit deletion to all users in the chat
      this.io.to(deletedMessage.sender.toString()).emit('messageDeleted', {
        messageId: deletedMessage.id
      });
      
      this.io.to(deletedMessage.receiver.toString()).emit('messageDeleted', {
        messageId: deletedMessage.id
      });
      
      return deletedMessage;
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      throw new Error('Failed to delete message');
    }
  }

  handleUserConnection(socket: Socket, userId: string, userModel: 'Teacher' | 'Student'): void {
    console.log(`User connected: ${userId} (${userModel})`);
    socket.join(userId);
    
    // Join all existing chats for this user
    this.chatRepository.getChatList(userId).then(chatList => {
      if (chatList) {
        chatList.chats.forEach(chat => {
          socket.join(chat.chatId);
        });
      }
    }).catch(error => {
      console.error('Error joining existing chats:', error);
    });
  }

  handleUserDisconnection(userId: string, userModel: 'Teacher' | 'Student'): void {
    console.log(`User disconnected: ${userId} (${userModel})`);
  }

  handleTyping(socket: Socket, chatId: string, userId: string, isTyping: boolean): void {
    socket.to(chatId).emit('typing', { userId, isTyping });
  }

  handleSeen(socket: Socket, chatId: string, userId: string): void {
    socket.to(chatId).emit('messageSeen', { userId, chatId });
  }
}