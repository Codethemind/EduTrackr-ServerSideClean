"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/departmentRoutes.ts
const express_1 = require("express");
const DepartmentController_1 = require("../controllers/DepartmentController");
const DepartmentUseCase_1 = require("../../application/useCases/DepartmentUseCase");
const DepartmentRepository_1 = require("../../infrastructure/repositories/DepartmentRepository");
const auth_1 = require("../middleware/auth");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
const departmentRepository = new DepartmentRepository_1.DepartmentRepository();
const departmentUseCase = new DepartmentUseCase_1.DepartmentUseCase(departmentRepository);
const departmentController = new DepartmentController_1.DepartmentController(departmentUseCase);
// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
    const id = req.params.id;
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid department ID format"
        });
    }
    next();
};
// Create department - Only admins can create departments
router.post('/create', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), departmentController.createDepartment.bind(departmentController));
// Get department by ID - All authenticated users can view department details
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateObjectId, departmentController.getDepartmentById.bind(departmentController));
// Update department - Only admins can update departments
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), validateObjectId, departmentController.updateDepartment.bind(departmentController));
// Delete department - Only admins can delete departments
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), validateObjectId, departmentController.deleteDepartment.bind(departmentController));
// Get all departments - All authenticated users can view all departments
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), departmentController.getAllDepartments.bind(departmentController));
exports.default = router;
//# sourceMappingURL=departmentRoutes.js.map