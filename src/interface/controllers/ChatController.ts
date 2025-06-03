import { Request, Response } from 'express';
import { ChatUseCase } from '../../application/useCases/ChatUseCase';

export class ChatController {
  constructor(private chatUseCase: ChatUseCase) {}

  async initiateChat(req: Request, res: Response): Promise<void> {
    console.log('Initiate chat request:', req.body);
    try {
      const { teacherId, studentId, initiatorId, receiverId, initiatorType } = req.body;
      let finalTeacherId: string;
      let finalStudentId: string;

      if (teacherId && studentId) {
        finalTeacherId = teacherId;
        finalStudentId = studentId;
      } else if (initiatorId && receiverId && initiatorType) {
        if (initiatorType === 'Student') {
          finalStudentId = initiatorId;
          finalTeacherId = receiverId;
        } else if (initiatorType === 'Teacher') {
          finalTeacherId = initiatorId;
          finalStudentId = receiverId;
        } else {
          console.log('Invalid initiatorType:', initiatorType);
          res.status(400).json({ message: 'Invalid initiatorType', success: false });
          return;
        }
      } else {
        console.log('Missing fields:', { teacherId, studentId, initiatorId, receiverId, initiatorType });
        res.status(400).json({ message: 'Required fields missing', success: false });
        return;
      }

      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(finalTeacherId) || !mongoose.Types.ObjectId.isValid(finalStudentId)) {
        console.log('Invalid ID format:', { finalTeacherId, finalStudentId });
        res.status(400).json({ message: 'Invalid ID format', success: false });
        return;
      }

      const chatId = await this.chatUseCase.initiateChat(finalTeacherId, finalStudentId);
      console.log('Chat initiated successfully:', { chatId });
      res.status(200).json({ message: 'Chat initiated successfully', data: { chatId }, success: true });
    } catch (error: any) {
      console.error('Error in initiateChat:', error.message, error.stack);
      res.status(500).json({ message: 'Error initiating chat', error: error.message, success: false });
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId, sender, senderModel, receiver, receiverModel, message, replyTo } = req.body;
      const mediaUrl = req.file ? req.file.path : undefined;

      if (!chatId || !sender || !senderModel || !receiver || !receiverModel) {
        res.status(400).json({ message: 'Missing required fields', success: false });
        return;
      }

      if (!message && !mediaUrl) {
        res.status(400).json({ message: 'Message or media required', success: false });
        return;
      }

      if (!['Teacher', 'Student'].includes(senderModel) || !['Teacher', 'Student'].includes(receiverModel)) {
        res.status(400).json({ message: 'Invalid sender or receiver model', success: false });
        return;
      }

      const messageData = await this.chatUseCase.saveMessage(
        chatId,
        sender,
        senderModel,
        receiver,
        receiverModel,
        message,
        mediaUrl,
        replyTo
      );
      res.status(201).json({ message: 'Message sent successfully', data: messageData, success: true });
    } catch (error: any) {
      console.error('Error in sendMessage:', error.message, error.stack);
      res.status(500).json({ message: 'Error sending message', error: error.message, success: false });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      if (!chatId) {
        res.status(400).json({ message: 'Chat ID is required', success: false });
        return;
      }

      const messages = await this.chatUseCase.getMessages(chatId);
      res.status(200).json({ message: 'Messages retrieved successfully', data: messages, count: messages.length, success: true });
    } catch (error: any) {
      console.error('Error in getMessages:', error.message, error.stack);
      res.status(500).json({ message: 'Error retrieving messages', error: error.message, success: false });
    }
  }

  async getChatList(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      if (!userId) {
        res.status(400).json({ message: 'userId is required', success: false });
        return;
      }

      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(userId as string)) {
        res.status(400).json({ message: 'Invalid userId format', success: false });
        return;
      }

      const chatList = await this.chatUseCase.getChatList(userId as string);
      res.status(200).json({ message: 'Chat list retrieved successfully', data: chatList, success: true });
    } catch (error: any) {
      console.error('Error in getChatList:', error.message, error.stack);
      res.status(500).json({ message: 'Error retrieving chat list', error: error.message, success: false });
    }
  }

  async addReaction(req: Request, res: Response): Promise<void> {
    try {
      const { messageId, userId, reaction } = req.body;
      if (!messageId || !userId || !reaction) {
        res.status(400).json({ message: 'Missing required fields', success: false });
        return;
      }

      const updatedMessage = await this.chatUseCase.addReaction(messageId, userId, reaction);
      res.status(200).json({ message: 'Reaction added successfully', data: updatedMessage, success: true });
    } catch (error: any) {
      console.error('Error in addReaction:', error.message, error.stack);
      res.status(500).json({ message: 'Error adding reaction', error: error.message, success: false });
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId, userId } = req.body;
      if (!messageId || !userId) {
        res.status(400).json({ message: 'Missing required fields', success: false });
        return;
      }

      const deletedMessage = await this.chatUseCase.deleteMessage(messageId, userId);
      res.status(200).json({ message: 'Message deleted successfully', data: deletedMessage, success: true });
    } catch (error: any) {
      console.error('Error in deleteMessage:', error.message, error.stack);
      res.status(500).json({ message: 'Error deleting message', error: error.message, success: false });
    }
  }

  async uploadMedia(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded', success: false });
        return;
      }
      res.status(200).json({ message: 'File uploaded successfully', data: { url: req.file.path }, success: true });
    } catch (error: any) {
      console.error('Error in uploadMedia:', error.message, error.stack);
      res.status(500).json({ message: 'Error uploading file', error: error.message, success: false });
    }
  }
}