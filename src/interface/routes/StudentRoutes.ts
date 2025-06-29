// src/routes/studentRoutes.ts

import { Router, Request, Response } from "express";
import { StudentController } from "../controllers/StudentController";
import { StudentUseCase } from "../../application/useCases/studentUseCase";
import { StudentRepository } from "../../infrastructure/repositories/studentRepository";
import { upload } from "../middleware/multer";
import { validateUser, validateUserUpdate, validateProfileImage } from "../middleware/validation";
import { isValidObjectId } from "mongoose";

const router = Router();

const studentRepository = new StudentRepository();
const studentUseCase = new StudentUseCase(studentRepository);
const studentController = new StudentController(studentUseCase);



router.post('/create', upload.single('profileImage'), validateUser, async (req: Request, res: Response): Promise<void> => {
  await studentController.createStudentWithImage(req, res);
});

router.put('/:id/profile-image', upload.single('profileImage'),  async (req: Request, res: Response): Promise<void> => {
  await studentController.updateProfileImage(req, res);
});


router.get('/:id',  async (req: Request, res: Response): Promise<void> => {
  await studentController.getStudentById(req, res);
});

router.put('/:id', validateUserUpdate, async (req: Request, res: Response): Promise<void> => {
  await studentController.updateStudent(req, res);
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  await studentController.deleteStudent(req, res);
});

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  await studentController.getAllStudents(_req, res);
});

export default router;
