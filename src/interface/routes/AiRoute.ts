import { Router, Request, Response } from "express";
import { AiController } from '../controllers/AiController';
import { AiUseCase } from '../../application/useCases/AiUseCase';
import { AiRepository } from '../../infrastructure/repositories/AiRepository';

const router = Router();

const aiRepository = new AiRepository();
const aiUseCase = new AiUseCase(aiRepository);
const aiController = new AiController(aiUseCase);

router.post('/student/chat', async (req: Request, res: Response): Promise<void> => {
    await aiController.handleStudentChat(req, res);
});


router.post('/teacher/chat', async (req: Request, res: Response): Promise<void> => {
    await aiController.handleTeacherChat(req, res);
});

export default router; 