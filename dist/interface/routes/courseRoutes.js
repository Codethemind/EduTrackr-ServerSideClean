"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/courseRoutes.ts
const express_1 = require("express");
const CourseController_1 = require("../controllers/CourseController");
const CourseUseCase_1 = require("../../application/useCases/CourseUseCase");
const CourseRepository_1 = require("../../infrastructure/repositories/CourseRepository");
const auth_1 = require("../middleware/auth");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
const courseRepository = new CourseRepository_1.CourseRepository();
const courseUseCase = new CourseUseCase_1.CourseUseCase(courseRepository);
const courseController = new CourseController_1.CourseController(courseUseCase);
const validateObjectId = (req, res, next) => {
    const id = req.params.id || req.params.departmentId;
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }
    next();
};
// Create course - Only admins can create courses
router.post('/create', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), courseController.createCourse.bind(courseController));
// Get course by ID - All authenticated users can view course details
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateObjectId, courseController.getCourseById.bind(courseController));
// Get courses by department - All authenticated users can view courses by department
router.get('/department/:departmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateObjectId, courseController.getCoursesByDepartment.bind(courseController));
// Update course - Only admins can update courses
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), validateObjectId, courseController.updateCourse.bind(courseController));
// Delete course - Only admins can delete courses
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), validateObjectId, courseController.deleteCourse.bind(courseController));
// Get all courses - All authenticated users can view all courses
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), courseController.getAllCourses.bind(courseController));
exports.default = router;
//# sourceMappingURL=courseRoutes.js.map