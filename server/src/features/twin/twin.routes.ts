import { Router } from 'express';
import { TwinController } from './twin.controller';
import { validate } from '../../middleware/validate';
import { simulateSchema } from './twin.schema';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const controller = new TwinController();

router.post('/simulate', authMiddleware, validate(simulateSchema), controller.simulate);
router.get('/history', authMiddleware, controller.getHistory);
router.get('/comparison', authMiddleware, controller.getComparison);

export default router;
