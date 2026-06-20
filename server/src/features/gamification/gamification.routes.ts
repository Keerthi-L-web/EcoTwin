import { Router } from 'express';
import { GamificationController } from './gamification.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const controller = new GamificationController();

router.get('/stats', authMiddleware, controller.getStats);
router.get('/leaderboard', authMiddleware, controller.getLeaderboard);
router.get('/badges', authMiddleware, controller.getBadges);

export default router;
