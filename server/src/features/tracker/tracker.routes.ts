import { Router } from 'express';
import { TrackerController } from './tracker.controller';
import { validate } from '../../middleware/validate';
import { createActivitySchema } from './tracker.schema';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const controller = new TrackerController();

router.post('/', authMiddleware, validate(createActivitySchema), controller.create);
router.get('/', authMiddleware, controller.getActivities);
router.get('/summary', authMiddleware, controller.getSummary);
router.get('/daily-totals', authMiddleware, controller.getDailyTotals);
router.delete('/:id', authMiddleware, controller.delete);

export default router;
