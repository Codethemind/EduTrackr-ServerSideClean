import { Chatlist } from '../../domain/entities/Chatlist';
import MessageEntity from '../../domain/entities/Message';
import mongoose from 'mongoose';

export interface IChatRepository {
  initiateChat(teacherId: string, studentId: string): Promise<string>;
  saveMessage(message: Partial<MessageEntity>): Promise<MessageEntity>;
  getMessages(chatId: string): Promise<MessageEntity[]>;
  getChatList(userId: string): Promise<Chatlist | null>;
  addReaction(messageId: string, userId: string, reaction: string): Promise<MessageEntity>;
  deleteMessage(messageId: string, userId: string): Promise<MessageEntity>;
  incrementUnreadCount(userId: string, chatId: string): Promise<void>;
  resetUnreadCount(userId: string, chatId: string): Promise<void>;
}