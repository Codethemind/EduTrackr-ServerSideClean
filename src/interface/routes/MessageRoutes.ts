import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';
import { MessageUseCase } from '../../application/useCases/MessageUseCase';
import { MessageRepository } from '../../infrastructure/repositories/MessageRepository';

const router = Router();
const messageRepository = new MessageRepository();
const messageUseCase = new MessageUseCase(messageRepository);
const messageController = new MessageController(messageUseCase, (global as any).io);

router.get('/:senderId/:receiverId', async (req, res) => {
  await messageController.getConversation(req, res);
});

router.get('/users', async (req, res) => {
  await messageController.getChatUsers(req, res);
});

export default router;