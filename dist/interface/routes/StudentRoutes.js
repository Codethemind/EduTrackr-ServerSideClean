"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/studentRoutes.ts
const express_1 = require("express");
const StudentController_1 = require("../controllers/StudentController");
const studentUseCase_1 = require("../../application/useCases/studentUseCase");
const studentRepository_1 = require("../../infrastructure/repositories/studentRepository");
const multer_1 = require("../middleware/multer");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const studentRepository = new studentRepository_1.StudentRepository();
const studentUseCase = new studentUseCase_1.StudentUseCase(studentRepository);
const studentController = new StudentController_1.StudentController(studentUseCase);
// Student creation - Only admins can create students
router.post('/create', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), multer_1.upload.single('profileImage'), validation_1.validateUser, studentController.createStudentWithImage.bind(studentController));
// Profile image update - Students can update their own, admins can update any
router.put('/:id/profile-image', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'admin']), multer_1.upload.single('profileImage'), studentController.updateProfileImage.bind(studentController));
// Get student by ID - Students can view their own, teachers and admins can view any
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), studentController.getStudentById.bind(studentController));
// Update student - Students can update their own, admins can update any
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'admin']), validation_1.validateUserUpdate, studentController.updateStudent.bind(studentController));
// Delete student - Only admins can delete students
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), studentController.deleteStudent.bind(studentController));
// Get all students - Teachers and admins can view all students
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['teacher', 'admin']), studentController.getAllStudents.bind(studentController));
exports.default = router;
//# sourceMappingURL=StudentRoutes.js.map