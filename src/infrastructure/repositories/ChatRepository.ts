import mongoose from 'mongoose';
import { IChatRepository } from '../../application/Interfaces/IChatRepository';
import { IChatList, IMessage, Message, ChatList } from '../../infrastructure/models/chat.models';
import Chatlist from '../../domain/entities/Chatlist';
import MessageEntity from '../../domain/entities/Message';

export class ChatRepository implements IChatRepository {
  async initiateChat(teacherId: string, studentId: string): Promise<string> {
    try {
      const chatId = new mongoose.Types.ObjectId().toString();
      const teacherObjectId = new mongoose.Types.ObjectId(teacherId);
      const studentObjectId = new mongoose.Types.ObjectId(studentId);

      // Check if chat already exists
      const existingChat = await ChatList.findOne({
        teacherId: teacherObjectId,
        studentId: studentObjectId
      });

      if (existingChat) {
        return existingChat.chats[0].chatId;
      }

      // Create chat list for teacher
      await ChatList.create({
        user: teacherObjectId,
        userModel: 'Teacher',
        teacherId: teacherObjectId,
        studentId: studentObjectId,
        chats: [{
          chatId,
          contact: studentObjectId,
          contactModel: 'Student',
          lastMessage: '',
          timestamp: new Date(),
          unreadCount: 0
        }]
      });

      // Create chat list for student
      await ChatList.create({
        user: studentObjectId,
        userModel: 'Student',
        teacherId: teacherObjectId,
        studentId: studentObjectId,
        chats: [{
          chatId,
          contact: teacherObjectId,
          contactModel: 'Teacher',
          lastMessage: '',
          timestamp: new Date(),
          unreadCount: 0
        }]
      });

      return chatId;
    } catch (error) {
      console.error('Error in initiateChat:', error);
      throw new Error('Failed to initiate chat');
    }
  }

  async saveMessage(message: Partial<MessageEntity>): Promise<MessageEntity> {
    try {
      const senderObjectId = message.sender
        ? new mongoose.Types.ObjectId(message.sender.toString())
        : undefined;
      const receiverObjectId = message.receiver
        ? new mongoose.Types.ObjectId(message.receiver.toString())
        : undefined;
      const replyToObjectId = message.replyTo
        ? new mongoose.Types.ObjectId(message.replyTo.toString())
        : undefined;

      if (!senderObjectId || !receiverObjectId) {
        throw new Error('Sender and receiver IDs are required');
      }

      console.log('Saving message with data:', {
        chatId: message.chatId,
        sender: senderObjectId,
        senderModel: message.senderModel,
        receiver: receiverObjectId,
        receiverModel: message.receiverModel,
        message: message.message,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        replyTo: replyToObjectId
      });

      const savedMessage = await Message.create({
        chatId: message.chatId,
        sender: senderObjectId,
        senderModel: message.senderModel,
        receiver: receiverObjectId,
        receiverModel: message.receiverModel,
        message: message.message || undefined,
        mediaUrl: message.mediaUrl || undefined,
        mediaType: message.mediaType || undefined,
        replyTo: replyToObjectId,
        timestamp: message.timestamp || new Date(),
        isDeleted: false,
      });

      // Update chat lists using the new method
      const chatData = {
        chatId: message.chatId!,
        contact: message.senderModel === 'Teacher' ? receiverObjectId : senderObjectId,
        contactModel: message.senderModel === 'Teacher' ? 'Student' : 'Teacher',
        lastMessage: message.message || (message.mediaUrl ? 'Media sent' : ''),
        timestamp: savedMessage.timestamp
      };

      // Update sender's chat list
      const senderChatList = await ChatList.findOne({
        user: senderObjectId,
        userModel: message.senderModel
      });
      if (senderChatList) {
        await senderChatList.updateChat(chatData);
      }

      // Update receiver's chat list
      const receiverChatList = await ChatList.findOne({
        user: receiverObjectId,
        userModel: message.receiverModel
      });
      if (receiverChatList) {
        await receiverChatList.updateChat(chatData);
      }

      return new MessageEntity({
        id: savedMessage._id.toString(),
        chatId: savedMessage.chatId,
        sender: savedMessage.sender,
        senderModel: savedMessage.senderModel,
        receiver: savedMessage.receiver,
        receiverModel: savedMessage.receiverModel,
        message: savedMessage.message,
        mediaUrl: savedMessage.mediaUrl,
        mediaType: savedMessage.mediaType,
        replyTo: savedMessage.replyTo,
        reactions: savedMessage.reactions,
        timestamp: savedMessage.timestamp,
        isDeleted: savedMessage.isDeleted,
      });
    } catch (error) {
      console.error('Error in saveMessage:', error);
      throw new Error('Failed to save message');
    }
  }

  async getMessages(chatId: string): Promise<MessageEntity[]> {
    try {
      const messages = await Message.find({ chatId, isDeleted: false })
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .populate('replyTo')
        .sort({ timestamp: 1 });

      return messages.map(msg => new MessageEntity({
        id: msg._id.toString(),
        chatId: msg.chatId,
        sender: msg.sender,
        senderModel: msg.senderModel,
        receiver: msg.receiver,
        receiverModel: msg.receiverModel,
        message: msg.message,
        mediaUrl: msg.mediaUrl,
        mediaType: msg.mediaType,
        replyTo: msg.replyTo,
        reactions: msg.reactions,
        timestamp: msg.timestamp,
        isDeleted: msg.isDeleted,
      }));
    } catch (error) {
      console.error('Error in getMessages:', error);
      throw new Error('Failed to get messages');
    }
  }

  async getChatList(userId: string): Promise<Chatlist | null> {
    try {
      const chatlist = await ChatList.findOne({ user: new mongoose.Types.ObjectId(userId) })
        .populate('teacherId', 'name email')
        .populate('studentId', 'name email')
        .populate('chats.contact', 'name email');

      if (!chatlist) return null;

      return new Chatlist({
        id: chatlist._id.toString(),
        user: chatlist.user,
        userModel: chatlist.userModel,
        teacherId: chatlist.teacherId,
        studentId: chatlist.studentId,
        chats: chatlist.chats.map(chat => ({
          chatId: chat.chatId,
          contact: chat.contact,
          contactModel: chat.contactModel,
          lastMessage: chat.lastMessage,
          timestamp: chat.timestamp,
          unreadCount: chat.unreadCount
        }))
      });
    } catch (error) {
      console.error('Error in getChatList:', error);
      throw new Error('Failed to get chat list');
    }
  }

  async addReaction(messageId: string, userId: string, reaction: string): Promise<MessageEntity> {
    try {
      const message = await Message.findById(messageId);
      if (!message || message.isDeleted) {
        throw new Error('Message not found or deleted');
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);
      const existingReactionIndex = message.reactions.findIndex(
        r => r.user.toString() === userId
      );

      if (existingReactionIndex !== -1) {
        message.reactions[existingReactionIndex].reaction = reaction;
      } else {
        message.reactions.push({ user: userObjectId, reaction });
      }

      await message.save();
      return new MessageEntity({
        id: message._id.toString(),
        chatId: message.chatId,
        sender: message.sender,
        senderModel: message.senderModel,
        receiver: message.receiver,
        receiverModel: message.receiverModel,
        message: message.message,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        replyTo: message.replyTo,
        reactions: message.reactions,
        timestamp: message.timestamp,
        isDeleted: message.isDeleted,
      });
    } catch (error) {
      console.error('Error in addReaction:', error);
      throw new Error('Failed to add reaction');
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<MessageEntity> {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }
      if (message.sender.toString() !== userId) {
        throw new Error('Unauthorized to delete this message');
      }

      message.isDeleted = true;
      await message.save();

      return new MessageEntity({
        id: message._id.toString(),
        chatId: message.chatId,
        sender: message.sender,
        senderModel: message.senderModel,
        receiver: message.receiver,
        receiverModel: message.receiverModel,
        message: message.message,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        replyTo: message.replyTo,
        reactions: message.reactions,
        timestamp: message.timestamp,
        isDeleted: message.isDeleted,
      });
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      throw new Error('Failed to delete message');
    }
  }

  async incrementUnreadCount(userId: string, chatId: string): Promise<void> {
    try {
      const chatList = await ChatList.findOne({
        user: new mongoose.Types.ObjectId(userId)
      });

      if (chatList) {
        await chatList.incrementUnreadCount(chatId);
      }
    } catch (error) {
      console.error('Error in incrementUnreadCount:', error);
      throw new Error('Failed to increment unread count');
    }
  }

  async resetUnreadCount(userId: string, chatId: string): Promise<void> {
    try {
      const chatList = await ChatList.findOne({
        user: new mongoose.Types.ObjectId(userId)
      });

      if (chatList) {
        const chatIndex = chatList.chats.findIndex(
          chat => chat.chatId === chatId
        );

        if (chatIndex !== -1) {
          chatList.chats[chatIndex].unreadCount = 0;
          await chatList.save();
        }
      }
    } catch (error) {
      console.error('Error in resetUnreadCount:', error);
      throw new Error('Failed to reset unread count');
    }
  }
}