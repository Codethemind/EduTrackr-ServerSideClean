import { Chatlist } from '../../domain/entities/Chatlist';
import MessageEntity from '../../domain/entities/Message';
import mongoose from 'mongoose';

export interface IChatRepository {
  initiateChat(teacherId: string, studentId: string): Promise<string>;
  saveMessage(message: Partial<MessageEntity>): Promise<MessageEntity>;
  getMessages(chatId: string): Promise<MessageEntity[]>;
  getChatList(userId: string): Promise<Chatlist | null>;
  updateChatList(message: {
    user: mongoose.Types.ObjectId;
    userModel: 'Teacher' | 'Student';
    contact: mongoose.Types.ObjectId;
    contactModel: 'Teacher' | 'Student';
    chatId: string;
    lastMessage: string;
    timestamp: Date;
    teacherId?: mongoose.Types.ObjectId;
    studentId?: mongoose.Types.ObjectId;
  }): Promise<void>;
  addReaction(messageId: string, userId: string, reaction: string): Promise<MessageEntity>;
  deleteMessage(messageId: string, userId: string): Promise<MessageEntity>;
}