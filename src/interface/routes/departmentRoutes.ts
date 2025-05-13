import { Router } from "express";
import { DepartmentController } from "../controllers/DepartmentController";
import { DepartmentUseCase } from "../../application/useCases/DepartmentUseCase";
import { DepartmentRepository } from "../../infrastructure/repositories/DepartmentRepository";
import { isValidObjectId } from "mongoose";

const router = Router();

// Create instances
const departmentRepository = new DepartmentRepository();
const departmentUseCase = new DepartmentUseCase(departmentRepository);
const departmentController = new DepartmentController(departmentUseCase);

// Middleware to validate ObjectId
const validateObjectId = (req: any, res: any, next: any) => {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid department ID format"
        });
    }
    next();
};

// Define routes
router.post('/create', departmentController.createDepartment.bind(departmentController));
router.get('/:id', validateObjectId, departmentController.getDepartmentById.bind(departmentController));
router.put('/:id', validateObjectId, departmentController.updateDepartment.bind(departmentController));
router.delete('/:id', validateObjectId, departmentController.deleteDepartment.bind(departmentController));
router.get('/', departmentController.getAllDepartments.bind(departmentController));

export default router; 