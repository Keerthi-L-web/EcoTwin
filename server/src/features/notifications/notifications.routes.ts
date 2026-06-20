import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const controller = new NotificationsController();

router.get('/', authMiddleware, controller.getAll);
router.put('/:id/read', authMiddleware, controller.markAsRead);
router.put('/read-all', authMiddleware, controller.markAllAsRead);

export default router;
