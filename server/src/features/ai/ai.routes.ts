import { Router } from 'express';
import { AIController } from './ai.controller';
import { validate } from '../../middleware/validate';
import { scenarioSchema } from './ai.schema';
import { authMiddleware } from '../../middleware/auth';
import { aiLimiter } from '../../middleware/rateLimiter';

const router = Router();
const controller = new AIController();

// AI Scenario Engine (Module 5)
router.post('/scenario', authMiddleware, aiLimiter, validate(scenarioSchema), controller.scenario);

// AI Coach (Module 6)
router.get('/coach/daily', authMiddleware, aiLimiter, controller.dailyAdvice);
router.get('/coach/weekly', authMiddleware, aiLimiter, controller.weeklyPlan);
router.get('/coach/monthly', authMiddleware, aiLimiter, controller.monthlyPlan);

export default router;
