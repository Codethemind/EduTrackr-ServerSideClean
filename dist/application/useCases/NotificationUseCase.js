"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationUseCase = void 0;
const createHttpError_1 = require("../../common/utils/createHttpError");
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const http_message_enum_1 = require("../../common/enums/http-message.enum");
class NotificationUseCase {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async createNotification(notification) {
        try {
            return await this.notificationRepository.createNotification(notification);
        }
        catch (error) {
            console.error('Error in createNotification:', error);
            (0, createHttpError_1.createHttpError)(http_message_enum_1.NotificationMessage.CREATE_FAILED, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getNotifications(userId, userModel) {
        try {
            return await this.notificationRepository.getNotifications(userId, userModel);
        }
        catch (error) {
            console.error('Error in getNotifications:', error);
            (0, createHttpError_1.createHttpError)(http_message_enum_1.NotificationMessage.FETCH_FAILED, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async markAsRead(notificationId) {
        try {
            return await this.notificationRepository.markAsRead(notificationId);
        }
        catch (error) {
            console.error('Error in markAsRead:', error);
            (0, createHttpError_1.createHttpError)(http_message_enum_1.NotificationMessage.MARK_READ_FAILED, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async markAllAsRead(userId, userModel) {
        try {
            await this.notificationRepository.markAllAsRead(userId, userModel);
        }
        catch (error) {
            console.error('Error in markAllAsRead:', error);
            (0, createHttpError_1.createHttpError)(http_message_enum_1.NotificationMessage.MARK_ALL_READ_FAILED, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteNotification(notificationId) {
        try {
            await this.notificationRepository.deleteNotification(notificationId);
        }
        catch (error) {
            console.error('Error in deleteNotification:', error);
            (0, createHttpError_1.createHttpError)(http_message_enum_1.NotificationMessage.DELETE_FAILED, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.NotificationUseCase = NotificationUseCase;
//# sourceMappingURL=NotificationUseCase.js.map