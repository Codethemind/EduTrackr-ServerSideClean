import { Router, Request, Response } from "express";
import { AuthController } from '../controllers/AuthController';
import { AuthUseCase } from '../../application/useCases/AuthUseCase';
import { AuthRepository } from '../../infrastructure/repositories/AuthRespository';
const router = Router();

const authRepository = new AuthRepository()
const authUseCase = new AuthUseCase(authRepository)
const authController = new AuthController(authUseCase)

router.post('/loginStudent',async (req:Request,res:Response):Promise<void>=>{
    await authController.loginStudent(req,res)
})
router.post('/loginAdmin',async (req:Request,res:Response):Promise<void>=>{
    await authController.loginAdmin(req,res)
})
router.post('/loginTeacher',async (req:Request,res:Response):Promise<void>=>{
    await authController.loginTeacher(req,res)
})

router.post('/forgotPassword', async (req: Request, res: Response): Promise<void> => {
    await authController.forgotPassword(req, res)
})

router.post('/resetPassword/:token', async (req: Request, res: Response): Promise<void> => {
    await authController.resetPassword(req, res)
})


 export default router