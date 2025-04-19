import { Router, Request, Response } from "express";
import { TeacherController } from "../controllers/TeacherController";
import { TeacherUseCase } from "../../application/useCases/TeacherUseCase";
import { TeacherRepository } from "../../infrastructure/repositories/TeacherRepository";

const router = Router();

// Create instances
const teacherRepository = new TeacherRepository();
const teacherUseCase = new TeacherUseCase(teacherRepository);
const teacherController = new TeacherController(teacherUseCase);

// Define routes
router.post('/create', async (req: Request, res: Response): Promise<void> => {
  await teacherController.createTeacher(req, res);
});

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  await teacherController.getAllTeachers(_req, res);
});

// router.get('/:id', async (req: Request, res: Response): Promise<void> => {
//   await teacherController.getTeacherById(req, res);
// });

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  await teacherController.updateTeacher(req, res);
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  await teacherController.deleteTeacher(req, res);
});

export default router;
