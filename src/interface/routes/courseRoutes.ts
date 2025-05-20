import { Router } from "express";
import { CourseController } from "../controllers/CourseController";
import { CourseUseCase } from "../../application/useCases/CourseUseCase";
import { CourseRepository } from "../../infrastructure/repositories/CourseRepository";
import { isValidObjectId } from "mongoose";

const router = Router();


const courseRepository = new CourseRepository();
const courseUseCase = new CourseUseCase(courseRepository);
const courseController = new CourseController(courseUseCase);


const validateObjectId = (req: any, res: any, next: any) => {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid course ID format"
        });
    }
    next();
};


router.post('/create', courseController.createCourse.bind(courseController));
router.get('/:id', validateObjectId, courseController.getCourseById.bind(courseController));
router.get('/department/:departmentId', validateObjectId, courseController.getCoursesByDepartment.bind(courseController));
router.put('/:id', validateObjectId, courseController.updateCourse.bind(courseController));
router.delete('/:id', validateObjectId, courseController.deleteCourse.bind(courseController));
router.get('/', courseController.getAllCourses.bind(courseController));

export default router; 