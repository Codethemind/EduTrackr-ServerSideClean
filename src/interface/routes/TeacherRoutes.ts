import { Router, Request, Response } from "express";
import { TeacherController } from "../controllers/TeacherController";
import { TeacherUseCase } from "../../application/useCases/TeacherUseCase";
import { TeacherRepository } from "../../infrastructure/repositories/TeacherRepository";
import { upload } from "../../infrastructure/middleware/multer";

const router = Router();

// Create instances
const teacherRepository = new TeacherRepository();
const teacherUseCase = new TeacherUseCase(teacherRepository);
const teacherController = new TeacherController(teacherUseCase);

// Define routes - Updated to handle file uploads
router.post('/create', upload.single('profileImage'), async (req: Request, res: Response): Promise<void> => {
  await teacherController.createTeacherWithImage(req, res);
});

// Profile image update route
router.put('/:id/profile-image', upload.single('profileImage'), async (req: Request, res: Response): Promise<void> => {
  await teacherController.updateProfileImage(req, res);
});

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  await teacherController.getAllTeachers(_req, res);
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  await teacherController.findTeacherById(req, res);
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  await teacherController.updateTeacher(req, res);
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  await teacherController.deleteTeacher(req, res);
});

export default router;
