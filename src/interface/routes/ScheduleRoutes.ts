import { Router, Request, Response } from "express";
import { ScheduleController } from "../controllers/ScheduleController";
import { ScheduleUseCase } from "../../application/useCases/ScheduleUseCase";
import { ScheduleRepository } from "../../infrastructure/repositories/ScheduleRepository";
import { validateObjectId } from "../../infrastructure/middleware/validation";

const router = Router();

// Create instances
const scheduleRepository = new ScheduleRepository();
const scheduleUseCase = new ScheduleUseCase(scheduleRepository);
const scheduleController = new ScheduleController(scheduleUseCase);

// Create schedule
router.post('/create', (req: Request, res: Response) => {

  scheduleController.createSchedule(req, res);
});

// Get all schedules
router.get('/', (req: Request, res: Response) => {
  scheduleController.getAllSchedules(req, res);
});

// Get schedules by department
router.get('/department/:departmentId', validateObjectId, (req: Request, res: Response) => {
  scheduleController.getSchedulesByDepartment(req, res);
});

// Get schedules by teacher
router.get('/teacher/:teacherId', validateObjectId, (req: Request, res: Response) => {
  scheduleController.getSchedulesByTeacher(req, res);
});

// Get schedule by ID
router.get('/:id', validateObjectId, (req: Request, res: Response) => {
  scheduleController.findScheduleById(req, res);
});

// Update schedule
router.put('/:id', validateObjectId, (req: Request, res: Response) => {
  scheduleController.updateSchedule(req, res);
});

// Delete schedule
router.delete('/:id', validateObjectId, (req: Request, res: Response) => {
  scheduleController.deleteSchedule(req, res);
});

export default router; 