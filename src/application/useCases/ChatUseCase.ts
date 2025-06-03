import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import { IChatRepository } from '../../application/Interfaces/IChatRepository';
import Chatlist from '../../domain/entities/Chatlist';
import Message from '../../domain/entities/Message';

export class ChatUseCase {
  constructor(private chatRepository: IChatRepository, private io: Server) {}

  async initiateChat(teacherId: string, studentId: string): Promise<string> {
    console.log('ChatUseCase - initiateChat:', { teacherId, studentId });

    if (!mongoose.Types.ObjectId.isValid(teacherId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      throw new Error('Invalid teacherId or studentId format');
    }

    const chatId = await this.chatRepository.initiateChat(teacherId, studentId);
    this.io.to(teacherId).emit('newChat', { chatId, contact: studentId, contactModel: 'Student' });
    this.io.to(studentId).emit('newChat', { chatId, contact: teacherId, contactModel: 'Teacher' });
    return chatId;
  }

  async saveMessage(
    chatId: string,
    sender: string,
    senderModel: 'Teacher' | 'Student',
    receiver: string,
    receiverModel: 'Teacher' | 'Student',
    message: string,
    mediaUrl?: string,
    replyTo?: string
  ): Promise<Message> {
    if (!chatId || !sender || !senderModel || !receiver || !receiverModel) {
      throw new Error('Missing required fields');
    }

    const messageData = {
      chatId,
      sender: new mongoose.Types.ObjectId(sender),
      senderModel,
      receiver: new mongoose.Types.ObjectId(receiver),
      receiverModel,
      message,
      mediaUrl,
      replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : undefined,
      timestamp: new Date(),
    };

    console.log('ChatUseCase - saveMessage:', messageData);

    const savedMessage = await this.chatRepository.saveMessage(messageData);

    this.io.to(sender).emit('receiveMessage', savedMessage);
    this.io.to(receiver).emit('receiveMessage', savedMessage);

    return savedMessage;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    if (!chatId) {
      throw new Error('Chat ID is missing');
    }
    return await this.chatRepository.getMessages(chatId);
  }

  async getChatList(userId: string): Promise<Chatlist | null> {
    if (!userId) {
      throw new Error('User ID is missing');
    }
    return await this.chatRepository.getChatList(userId);
  }

  async addReaction(messageId: string, userId: string, reaction: string): Promise<Message> {
    const updatedMessage = await this.chatRepository.addReaction(messageId, userId, reaction);
    this.io.to(updatedMessage.sender.toString()).emit('messageReaction', updatedMessage);
    this.io.to(updatedMessage.receiver.toString()).emit('messageReaction', updatedMessage);
    return updatedMessage;
  }

  async deleteMessage(messageId: string, userId: string): Promise<Message> {
    const deletedMessage = await this.chatRepository.deleteMessage(messageId, userId);
    this.io.to(deletedMessage.sender.toString()).emit('messageDeleted', deletedMessage);
    this.io.to(deletedMessage.receiver.toString()).emit('messageDeleted', deletedMessage);
    return deletedMessage;
  }

  handleUserConnection(socket: Socket, userId: string, userModel: 'Teacher' | 'Student'): void {
    console.log(`User connected: ${userId} (${userModel})`);
    socket.join(userId);
  }

  handleUserDisconnection(userId: string, userModel: 'Teacher' | 'Student'): void {
    console.log(`User disconnected: ${userId} (${userModel})`);
  }
}