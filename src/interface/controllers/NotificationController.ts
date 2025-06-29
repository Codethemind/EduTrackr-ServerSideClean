import { Request, Response } from 'express';
import { NotificationUseCase } from '../../application/useCases/NotificationUseCase';
import { HttpStatus } from '../../common/enums/http-status.enum';

export class NotificationController {
  constructor(private notificationUseCase: NotificationUseCase) {}

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId, userModel } = req.query;
      console.log('Getting notifications for:', { userId, userModel });

      if (!userId || !userModel) {
        console.log('Missing required fields:', { userId, userModel });
        res.status(HttpStatus.BAD_REQUEST).json({ 
          message: 'Missing required fields: userId and userModel are required', 
          success: false 
        });
        return;
      }

      // Convert userModel to proper case
      const normalizedUserModel = (userModel as string).charAt(0).toUpperCase() + 
                                (userModel as string).slice(1).toLowerCase();

      if (!['Teacher', 'Student','Admin'].includes(normalizedUserModel)) {
        console.log('Invalid user model:', userModel);
        res.status(HttpStatus.BAD_REQUEST).json({ 
          message: 'Invalid user model. Must be either "Teacher" or "Student"', 
          success: false 
        });
        return;
      }

      const notifications = await this.notificationUseCase.getNotifications(
        userId as string,
        normalizedUserModel as 'Teacher' | 'Student'
      );

      console.log(`Found ${notifications.length} notifications`);

      // Transform notifications to match frontend expectations
      const transformedNotifications = notifications.map(notification => ({
        id: notification._id,
        type: notification.type,
        message: notification.message,
        sender: notification.sender,
        role: notification.role,
        read: notification.read,
        timestamp: notification.timestamp,
        data: notification.data
      }));

      res.status(HttpStatus.OK).json({
        message: 'Notifications retrieved successfully',
        data: transformedNotifications,
        success: true
      });
    } catch (error: any) {
      console.error('Error in getNotifications:', error.message, error.stack);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error retrieving notifications',
        error: error.message,
        success: false
      });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Notification ID is required', success: false });
        return;
      }

      const notification = await this.notificationUseCase.markAsRead(notificationId);

      res.status(HttpStatus.OK).json({
        message: 'Notification marked as read',
        data: notification,
        success: true
      });
    } catch (error: any) {
      console.error('Error in markAsRead:', error.message, error.stack);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error marking notification as read',
        error: error.message,
        success: false
      });
    }
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { userId, userModel } = req.body;

      if (!userId || !userModel) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Missing required fields', success: false });
        return;
      }

      if (!['Teacher', 'Student'].includes(userModel)) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid user model', success: false });
        return;
      }

      await this.notificationUseCase.markAllAsRead(userId, userModel);

      res.status(HttpStatus.OK).json({
        message: 'All notifications marked as read',
        success: true
      });
    } catch (error: any) {
      console.error('Error in markAllAsRead:', error.message, error.stack);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error marking all notifications as read',
        error: error.message,
        success: false
      });
    }
  }

  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Notification ID is required', success: false });
        return;
      }

      await this.notificationUseCase.deleteNotification(notificationId);

      res.status(HttpStatus.OK).json({
        message: 'Notification deleted successfully',
        success: true
      });
    } catch (error: any) {
      console.error('Error in deleteNotification:', error.message, error.stack);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error deleting notification',
        error: error.message,
        success: false
      });
    }
  }
} 