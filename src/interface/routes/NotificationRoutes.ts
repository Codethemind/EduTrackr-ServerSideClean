import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { NotificationUseCase } from '../../application/useCases/NotificationUseCase';
import { NotificationRepository } from '../../infrastructure/repositories/NotificationRepository';

export function createNotificationRoutes(): Router {
  const router = Router();
  const notificationRepository = new NotificationRepository();
  const notificationUseCase = new NotificationUseCase(notificationRepository);
  const notificationController = new NotificationController(notificationUseCase);

  // Get notifications for a user
  router.get('/', (req, res) => notificationController.getNotifications(req, res));

  // Mark a notification as read
  router.put('/:notificationId/read', (req, res) => notificationController.markAsRead(req, res));

  // Mark all notifications as read
  router.put('/read-all', (req, res) => notificationController.markAllAsRead(req, res));

  // Delete a notification
  router.delete('/:notificationId', (req, res) => notificationController.deleteNotification(req, res));

  return router;
} 