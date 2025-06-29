import { Request, Response } from 'express';
import { AiUseCase } from '../../application/useCases/AiUseCase';
import { HttpStatus } from '../../common/enums/http-status.enum';

export class AiController {
    constructor(private aiUseCase: AiUseCase) {}

    async handleStudentChat(req: Request, res: Response): Promise<void> {
        try {
            const { message, context } = req.body;
            
            if (!message) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: 'Message is required' });
                return;
            }

            const response = await this.aiUseCase.generateStudentResponse(message, context);
            res.json({ response });
        } catch (error) {
            console.error('Error in handleStudentChat:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        }
    }

    async handleTeacherChat(req: Request, res: Response): Promise<void> {
        try {
            const { message, context } = req.body;
            
            if (!message) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: 'Message is required' });
                return;
            }

            const response = await this.aiUseCase.generateTeacherResponse(message, context);
            res.json({ response });
        } catch (error) {
            console.error('Error in handleTeacherChat:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        }
    }
} 