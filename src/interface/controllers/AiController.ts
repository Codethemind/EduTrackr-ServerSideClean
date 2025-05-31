import { Request, Response } from 'express';
import { AiUseCase } from '../../application/useCases/AiUseCase';

export class AiController {
    constructor(private aiUseCase: AiUseCase) {}

    async handleStudentChat(req: Request, res: Response): Promise<void> {
        try {
            const { message, context } = req.body;
            
            if (!message) {
                res.status(400).json({ error: 'Message is required' });
                return;
            }

            const response = await this.aiUseCase.generateStudentResponse(message, context);
            res.json({ response });
        } catch (error) {
            console.error('Error in handleStudentChat:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async handleTeacherChat(req: Request, res: Response): Promise<void> {
        try {
            const { message, context } = req.body;
            
            if (!message) {
                res.status(400).json({ error: 'Message is required' });
                return;
            }

            const response = await this.aiUseCase.generateTeacherResponse(message, context);
            res.json({ response });
        } catch (error) {
            console.error('Error in handleTeacherChat:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
} 