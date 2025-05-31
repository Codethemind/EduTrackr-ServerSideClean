import { MessageRepository } from '../../infrastructure/repositories/MessageRepository';
import { IMessage } from '../Interfaces/IMessage';

export class MessageUseCase {
  constructor(private messageRepository: MessageRepository) {}

  async sendMessage(message: IMessage): Promise<IMessage> {
    return await this.messageRepository.saveMessage(message);
  }

  async getConversation(senderId: string, receiverId: string): Promise<IMessage[]> {
    return await this.messageRepository.getMessagesBetweenUsers(senderId, receiverId);
  }

  async markAsRead(senderId: string, receiverId: string): Promise<void> {
    await this.messageRepository.markMessagesAsRead(senderId, receiverId);
  }

  async getChatUsers(userId: string, role: 'Student' | 'Teacher'): Promise<any[]> {
    return await this.messageRepository.getChatUsers(userId, role);
  }
}