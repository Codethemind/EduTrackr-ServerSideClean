import { INotificationRepository } from '../Interfaces/INotificationRepository';
import { INotification } from '../../infrastructure/models/notification.models';

export class NotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async createNotification(notification: Partial<INotification>): Promise<INotification> {
    try {
      return await this.notificationRepository.createNotification(notification);
    } catch (error) {
      console.error('Error in createNotification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async getNotifications(userId: string, userModel: 'Teacher' | 'Student'): Promise<INotification[]> {
    try {
      return await this.notificationRepository.getNotifications(userId, userModel);
    } catch (error) {
      console.error('Error in getNotifications:', error);
      throw new Error('Failed to get notifications');
    }
  }

  async markAsRead(notificationId: string): Promise<INotification> {
    try {
      return await this.notificationRepository.markAsRead(notificationId);
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string, userModel: 'Teacher' | 'Student'): Promise<void> {
    try {
      await this.notificationRepository.markAllAsRead(userId, userModel);
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await this.notificationRepository.deleteNotification(notificationId);
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      throw new Error('Failed to delete notification');
    }
  }
} 