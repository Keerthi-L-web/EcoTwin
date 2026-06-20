import { Router } from 'express';
import { GoalsController } from './goals.controller';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createGoalSchema, updateGoalSchema } from './goals.schema';

const router = Router();
const goalsController = new GoalsController();

router.use(authMiddleware);

router.get('/', goalsController.getAll);
router.post('/', validate(createGoalSchema), goalsController.create);
router.put('/:id', validate(updateGoalSchema), goalsController.update);
router.delete('/:id', goalsController.delete);

export default router;
