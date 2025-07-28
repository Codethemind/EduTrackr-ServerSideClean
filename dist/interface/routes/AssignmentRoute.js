"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/assignmentRoutes.ts
const express_1 = require("express");
const AssignmentController_1 = require("../controllers/AssignmentController");
const AssignmentUseCase_1 = require("../../application/useCases/AssignmentUseCase");
const AssignmentRepository_1 = require("../../infrastructure/repositories/AssignmentRepository");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
// Initialize dependencies
const assignmentRepository = new AssignmentRepository_1.AssignmentRepository();
const assignmentUseCase = new AssignmentUseCase_1.AssignmentUseCase(assignmentRepository);
const assignmentController = new AssignmentController_1.AssignmentController(assignmentUseCase);
// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
    const id = req.params.id || req.params.departmentId || req.params.teacherId;
    if (id && !(0, mongoose_1.isValidObjectId)(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }
    next();
};
// Create assignment (Teachers and Admins only)
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['teacher', 'admin']), AssignmentController_1.assignmentUpload.array('attachments', 5), // Allow up to 5 files
assignmentController.createAssignment.bind(assignmentController));
// Get all assignments (with filters) - All authenticated users
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), assignmentController.getAssignments.bind(assignmentController));
// Get assignments by department ID - All authenticated users
router.get('/department/:departmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateObjectId, assignmentController.getAssignmentsByDepartment.bind(assignmentController));
// Get assignments by teacher ID - All authenticated users
router.get('/teacher/:teacherId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateObjectId, assignmentController.getAssignmentsByTeacher.bind(assignmentController));
// Get assignment by ID - All authenticated users
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateObjectId, assignmentController.getAssignmentById.bind(assignmentController));
// Update assignment (Teachers and Admins only)
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['teacher', 'admin']), validateObjectId, validation_1.validateAssignment, assignmentController.updateAssignment.bind(assignmentController));
// Delete assignment (Teachers and Admins only)
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['teacher', 'admin']), validateObjectId, assignmentController.deleteAssignment.bind(assignmentController));
// Submit assignment (Students only)
router.post('/:id/submit', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student']), validateObjectId, AssignmentController_1.submissionUpload.array('files', 5), // Allow up to 5 files
validation_1.validateSubmission, assignmentController.submitAssignment.bind(assignmentController));
// Grade submission (Teachers and Admins only)
router.post('/:id/grade', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['teacher', 'admin']), validateObjectId, validation_1.validateGrade, assignmentController.gradeSubmission.bind(assignmentController));
// Get all submissions for an assignment (Teachers and Admins only)
router.get('/:id/submissions', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['teacher', 'admin']), validateObjectId, assignmentController.getSubmissions.bind(assignmentController));
exports.default = router;
//# sourceMappingURL=AssignmentRoute.js.map