import { Router, Request, Response } from 'express';
import { ChatController } from '../../interface/controllers/ChatController';
import { ChatUseCase } from '../../application/useCases/ChatUseCase';
import { ChatRepository } from '../../infrastructure/repositories/ChatRepository';
import { Server } from 'socket.io';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../../infrastructure/services/cloudinary';

// Configure multer storage for chat media uploads
const chatStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat_media',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    resource_type: 'auto'
  }
});

const upload = multer({ storage: chatStorage });

export function createChatRoutes(io: Server): Router {
  const router = Router();
  const chatRepository = new ChatRepository();
  const chatUseCase = new ChatUseCase(chatRepository, io);
  const chatController = new ChatController(chatUseCase);

  router.post('/send', upload.single('media'), (req: Request, res: Response) => chatController.sendMessage(req, res));
  router.post('/initiate', (req: Request, res: Response) => chatController.initiateChat(req, res));
  router.get('/messages/:chatId', (req: Request, res: Response) => chatController.getMessages(req, res));
  router.get('/chatlist', (req: Request, res: Response) => chatController.getChatList(req, res));
  router.post('/reaction', (req: Request, res: Response) => chatController.addReaction(req, res));
  router.post('/delete', (req: Request, res: Response) => chatController.deleteMessage(req, res));
  router.post('/upload', upload.single('media'), (req: Request, res: Response) => chatController.uploadMedia(req, res));

  return router;
}