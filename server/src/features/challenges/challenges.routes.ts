import { Router } from 'express';
import { ChallengesController } from './challenges.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const controller = new ChallengesController();

router.get('/', authMiddleware, controller.getAll);
router.post('/:id/join', authMiddleware, controller.join);
router.put('/:id/progress', authMiddleware, controller.updateProgress);
router.get('/active', authMiddleware, controller.getActive);

export default router;
