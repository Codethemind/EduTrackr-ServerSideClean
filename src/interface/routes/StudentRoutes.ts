// src/routes/studentRoutes.ts

import { Router, Request, Response } from "express";
import { StudentController } from "../controllers/StudentController";
import { StudentUseCase } from "../../application/useCases/studentUseCase";
import { StudentRepository } from "../../infrastructure/repositories/studentRepository";
import { upload } from "../../infrastructure/middleware/multer";
import { validateUser, validateUserUpdate, validateProfileImage } from "../../infrastructure/middleware/validation";
import { isValidObjectId } from "mongoose";

const router = Router();

// Create instances
const studentRepository = new StudentRepository();
const studentUseCase = new StudentUseCase(studentRepository);
const studentController = new StudentController(studentUseCase);

// Middleware to validate ObjectId
const validateObjectId = (req: Request, res: Response, next: Function) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID format"
    });
  }
  next();
};


router.post('/create', upload.single('profileImage'), validateUser, async (req: Request, res: Response): Promise<void> => {
    await studentController.createStudentWithImage(req, res);
});

router.put('/:id/profile-image', validateObjectId, upload.single('profileImage'), validateProfileImage, async (req: Request, res: Response): Promise<void> => {
  await studentController.updateProfileImage(req, res);
});

router.get('/:id', validateObjectId, async (req: Request, res: Response): Promise<void> => {
  await studentController.getStudentById(req, res);
});

router.put('/:id', validateObjectId, validateUserUpdate, async (req: Request, res: Response): Promise<void> => {
  await studentController.updateStudent(req, res);
});

router.delete('/:id', validateObjectId, async (req: Request, res: Response): Promise<void> => {
  await studentController.deleteStudent(req, res);
});

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  await studentController.getAllStudents(_req, res);
});

export default router;
