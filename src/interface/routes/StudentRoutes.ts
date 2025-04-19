// src/routes/studentRoutes.ts

import { Router, Request, Response } from "express";
import { StudentController } from "../controllers/StudentController";
import { StudentUseCase } from "../../application/useCases/studentUseCase";
import { StudentRepository } from "../../infrastructure/repositories/studentRepository";



const router = Router();

// Create instances
const studentRepository = new StudentRepository();
const studentUseCase = new StudentUseCase(studentRepository);
const studentController = new StudentController(studentUseCase);

// Define routes
router.post('/create', async (req: Request, res: Response): Promise<void> => {
  
  await studentController.createStudent(req, res);
});

// router.get('/:id', async (req: Request, res: Response): Promise<void> => {
//   await studentController.getStudentById(req, res);
// });

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  await studentController.updateStudent(req, res);
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  await studentController.deleteStudent(req, res);
});

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  await studentController.getAllStudents(_req, res);
});

export default router;
