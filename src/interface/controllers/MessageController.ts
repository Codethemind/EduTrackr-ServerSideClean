import { Request, Response } from 'express';
import { MessageUseCase } from '../../application/useCases/MessageUseCase';
import { IMessage } from '../../application/Interfaces/IMessage';
import { Server, Socket } from 'socket.io';

export class MessageController {
  constructor(
    private messageUseCase: MessageUseCase,
    private io: Server
  ) {}

  initializeSocketEvents(socket: Socket) {
    socket.on('joinChat', (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined their chat room`);
    });

    socket.on('sendMessage', async (data: IMessage) => {
      try {
        const message = await this.messageUseCase.sendMessage({
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
        });

        // Emit message to both sender and receiver
        this.io.to(data.senderId).emit('receiveMessage', message);
        this.io.to(data.receiverId).emit('receiveMessage', message);
      } catch (err: any) {
        socket.emit('error', { message: 'Failed to send message', error: err.message });
      }
    });

    socket.on('markAsRead', async ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
      try {
        await this.messageUseCase.markAsRead(senderId, receiverId);
        this.io.to(receiverId).emit('messagesRead', { senderId });
      } catch (err: any) {
        socket.emit('error', { message: 'Failed to mark messages as read', error: err.message });
      }
    });
  }

  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const { senderId, receiverId } = req.params;
      const messages = await this.messageUseCase.getConversation(senderId, receiverId);
      res.status(200).json({ success: true, data: messages });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch conversation', error: err.message });
    }
  }

  async getChatUsers(req: Request, res: Response): Promise<void> {
    try {
      const { userId, role } = req.query;
      if (!userId || !role || (role !== 'Student' && role !== 'Teacher')) {
        res.status(400).json({ success: false, message: 'Invalid userId or role' });
        return;
      }
      const users = await this.messageUseCase.getChatUsers(userId as string, role as 'Student' | 'Teacher');
      res.status(200).json({ success: true, data: users });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch chat users', error: err.message });
    }
  }
}