"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/adminRoutes.ts
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const AdminUseCase_1 = require("../../application/useCases/AdminUseCase");
const AdminRepository_1 = require("../../infrastructure/repositories/AdminRepository");
const TeacherRepository_1 = require("../../infrastructure/repositories/TeacherRepository");
const studentRepository_1 = require("../../infrastructure/repositories/studentRepository");
const EmailService_1 = require("../../infrastructure/services/EmailService");
const multer_1 = require("../middleware/multer");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Initialize repositories and use cases
const adminRepository = new AdminRepository_1.AdminRepository();
const teacherRepository = new TeacherRepository_1.TeacherRepository();
const studentRepository = new studentRepository_1.StudentRepository();
const emailService = new EmailService_1.EmailService();
const adminUseCase = new AdminUseCase_1.AdminUseCase(adminRepository, emailService, teacherRepository, studentRepository);
const adminController = new AdminController_1.AdminController(adminUseCase);
// Admin routes - Only admins can manage other admins
router.post("/create", auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), multer_1.upload.single("profileImage"), adminController.createAdminWithImage.bind(adminController));
router.get("/", auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), adminController.getAllAdmins.bind(adminController));
router.get("/search", auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), adminController.searchUsers.bind(adminController));
router.get("/:id", auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), adminController.findAdminById.bind(adminController));
router.put("/:id", auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), multer_1.upload.single("profileImage"), adminController.updateAdmin.bind(adminController));
router.put("/:id/profile-image", auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), multer_1.upload.single("profileImage"), adminController.updateAdminProfileImage.bind(adminController));
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), adminController.deleteAdmin.bind(adminController));
exports.default = router;
//# sourceMappingURL=AdminRoutes.js.map