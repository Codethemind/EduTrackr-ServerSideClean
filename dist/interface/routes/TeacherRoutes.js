"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/teacherRoutes.ts
const express_1 = require("express");
const TeacherController_1 = require("../controllers/TeacherController");
const TeacherUseCase_1 = require("../../application/useCases/TeacherUseCase");
const TeacherRepository_1 = require("../../infrastructure/repositories/TeacherRepository");
const validation_1 = require("../middleware/validation");
const multer_1 = require("../middleware/multer");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const teacherRepository = new TeacherRepository_1.TeacherRepository();
const teacherUseCase = new TeacherUseCase_1.TeacherUseCase(teacherRepository);
const teacherController = new TeacherController_1.TeacherController(teacherUseCase);
// Teacher creation - Only admins can create teachers
router.post('/create', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), multer_1.upload.single('profileImage'), validation_1.validateUser, teacherController.createTeacherWithImage.bind(teacherController));
// Profile image update - Teachers can update their own, admins can update any
router.put('/:id/profile-image', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['teacher', 'admin']), multer_1.upload.single('profileImage'), teacherController.updateProfileImage.bind(teacherController));
// Get all teachers - All authenticated users can view teachers
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), teacherController.getAllTeachers.bind(teacherController));
// Get teacher by ID - All authenticated users can view teacher details
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), teacherController.findTeacherById.bind(teacherController));
// Update teacher - Teachers can update their own, admins can update any
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['teacher', 'admin']), teacherController.updateTeacher.bind(teacherController));
// Delete teacher - Only admins can delete teachers
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), teacherController.deleteTeacher.bind(teacherController));
exports.default = router;
//# sourceMappingURL=TeacherRoutes.js.map