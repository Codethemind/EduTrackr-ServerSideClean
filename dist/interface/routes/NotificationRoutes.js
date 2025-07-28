"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/notificationRoutes.ts
const express_1 = require("express");
const NotificationController_1 = require("../controllers/NotificationController");
const NotificationUseCase_1 = require("../../application/useCases/NotificationUseCase");
const NotificationRepository_1 = require("../../infrastructure/repositories/NotificationRepository");
const auth_1 = require("../middleware/auth");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
const notificationRepository = new NotificationRepository_1.NotificationRepository();
const notificationUseCase = new NotificationUseCase_1.NotificationUseCase(notificationRepository);
const notificationController = new NotificationController_1.NotificationController(notificationUseCase);
// Middleware to validate notification ID
const validateNotificationId = (req, res, next) => {
    const id = req.params.notificationId;
    if (!(0, mongoose_1.isValidObjectId)(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid notification ID format"
        });
    }
    next();
};
// Get notifications - Users can view their own notifications
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), notificationController.getNotifications.bind(notificationController));
// Mark notification as read - Users can mark their own notifications as read
router.put('/:notificationId/read', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateNotificationId, notificationController.markAsRead.bind(notificationController));
// Mark all notifications as read - Users can mark all their notifications as read
router.put('/read-all', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), notificationController.markAllAsRead.bind(notificationController));
// Delete notification - Users can delete their own notifications
router.delete('/:notificationId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateNotificationId, notificationController.deleteNotification.bind(notificationController));
exports.default = router;
//# sourceMappingURL=NotificationRoutes.js.map