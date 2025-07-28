"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/scheduleRoutes.ts
const express_1 = require("express");
const ScheduleController_1 = require("../controllers/ScheduleController");
const ScheduleUseCase_1 = require("../../application/useCases/ScheduleUseCase");
const ScheduleRepository_1 = require("../../infrastructure/repositories/ScheduleRepository");
const auth_1 = require("../middleware/auth");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
// Create instances
const scheduleRepository = new ScheduleRepository_1.ScheduleRepository();
const scheduleUseCase = new ScheduleUseCase_1.ScheduleUseCase(scheduleRepository);
const scheduleController = new ScheduleController_1.ScheduleController(scheduleUseCase);
// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
    const id = req.params.id || req.params.departmentId || req.params.teacherId;
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }
    next();
};
// Create schedule - Only admins can create schedules
router.post('/create', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), scheduleController.createSchedule.bind(scheduleController));
// Get all schedules - All authenticated users can view schedules
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), scheduleController.getAllSchedules.bind(scheduleController));
// Get schedules by department - All authenticated users can view schedules by department
router.get('/department/:departmentId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateObjectId, scheduleController.getSchedulesByDepartment.bind(scheduleController));
// Get schedules by teacher - All authenticated users can view schedules by teacher
router.get('/teacher/:teacherId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateObjectId, scheduleController.getSchedulesByTeacher.bind(scheduleController));
// Get schedule by ID - All authenticated users can view schedule details
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateObjectId, scheduleController.findScheduleById.bind(scheduleController));
// Update schedule - Only admins can update schedules
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), validateObjectId, scheduleController.updateSchedule.bind(scheduleController));
// Delete schedule - Only admins can delete schedules
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['admin']), validateObjectId, scheduleController.deleteSchedule.bind(scheduleController));
// Start live class - Only teachers and admins can start live classes
router.post('/:id/start', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['teacher', 'admin']), validateObjectId, scheduleController.startLiveClass.bind(scheduleController));
exports.default = router;
//# sourceMappingURL=ScheduleRoutes.js.map