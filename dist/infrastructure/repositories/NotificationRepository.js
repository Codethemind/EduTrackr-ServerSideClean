"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notification_models_1 = require("../models/notification.models");
class NotificationRepository {
    async createNotification(notification) {
        try {
            const newNotification = await notification_models_1.Notification.create(notification);
            return newNotification;
        }
        catch (error) {
            console.error('Error in createNotification:', error);
            throw new Error('Failed to create notification');
        }
    }
    async getNotifications(userId, userModel) {
        try {
            // Normalize userModel to ensure proper case
            const normalizedUserModel = userModel.charAt(0).toUpperCase() + userModel.slice(1).toLowerCase();
            const notifications = await notification_models_1.Notification.find({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                userModel: normalizedUserModel
            })
                .sort({ timestamp: -1 })
                .limit(50);
            return notifications;
        }
        catch (error) {
            console.error('Error in getNotifications:', error);
            throw new Error('Failed to get notifications');
        }
    }
    async markAsRead(notificationId) {
        try {
            const notification = await notification_models_1.Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
            if (!notification) {
                throw new Error('Notification not found');
            }
            return notification;
        }
        catch (error) {
            console.error('Error in markAsRead:', error);
            throw new Error('Failed to mark notification as read');
        }
    }
    async markAllAsRead(userId, userModel) {
        try {
            await notification_models_1.Notification.updateMany({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                userModel,
                read: false
            }, { read: true });
        }
        catch (error) {
            console.error('Error in markAllAsRead:', error);
            throw new Error('Failed to mark all notifications as read');
        }
    }
    async deleteNotification(notificationId) {
        try {
            const result = await notification_models_1.Notification.findByIdAndDelete(notificationId);
            if (!result) {
                throw new Error('Notification not found');
            }
        }
        catch (error) {
            console.error('Error in deleteNotification:', error);
            throw new Error('Failed to delete notification');
        }
    }
}
exports.NotificationRepository = NotificationRepository;
//# sourceMappingURL=NotificationRepository.js.map