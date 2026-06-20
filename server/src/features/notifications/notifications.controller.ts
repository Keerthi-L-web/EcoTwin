import { Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';
import { AuthRequest } from '../../middleware/auth';

const notificationsService = new NotificationsService();

export class NotificationsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await notificationsService.getNotifications(req.userId!);
      res.json({ notifications });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationsService.markAsRead(req.params.id!, req.userId!);
      res.json({ message: 'Marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationsService.markAllAsRead(req.userId!);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}
