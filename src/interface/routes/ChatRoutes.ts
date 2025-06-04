import { Router, Request, Response } from 'express';
import { ChatController } from '../../interface/controllers/ChatController';
import { ChatUseCase } from '../../application/useCases/ChatUseCase';
import { ChatRepository } from '../../infrastructure/repositories/ChatRepository';
import { NotificationRepository } from '../../infrastructure/repositories/NotificationRepository';
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
    resource_type: 'auto',
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' }, // Limit image size
      { quality: 'auto' } // Optimize quality
    ]
  }
});

const upload = multer({ 
  storage: chatStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
    files: 1
  },
 
});

export function createChatRoutes(io: Server): Router {
  const router = Router();
  const chatRepository = new ChatRepository();
  const notificationRepository = new NotificationRepository();
  const chatUseCase = new ChatUseCase(chatRepository, notificationRepository, io);
  const chatController = new ChatController(chatUseCase);

  // Error handling middleware for multer
  const handleMulterError = (err: any, req: Request, res: Response, next: Function) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File size too large. Maximum size is 20MB', 
          success: false 
        });
      }
      return res.status(400).json({ 
        message: err.message, 
        success: false 
      });
    }
    next(err);
  };

  router.post('/send', upload.single('media'), handleMulterError, (req: Request, res: Response) => chatController.sendMessage(req, res));
  router.post('/initiate', (req: Request, res: Response) => chatController.initiateChat(req, res));
  router.get('/messages/:chatId', (req: Request, res: Response) => chatController.getMessages(req, res));
  router.get('/chatlist', (req: Request, res: Response) => chatController.getChatList(req, res));
  router.post('/reaction', (req: Request, res: Response) => chatController.addReaction(req, res));
  router.post('/delete', (req: Request, res: Response) => chatController.deleteMessage(req, res));
  router.post('/upload', upload.single('media'), handleMulterError, (req: Request, res: Response) => chatController.uploadMedia(req, res));

  return router;
}