import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { validate } from '../../middleware/validate';
import { profileUpdateSchema } from './profile.schema';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const controller = new ProfileController();

router.get('/', authMiddleware, controller.getProfile);
router.put('/', authMiddleware, validate(profileUpdateSchema), controller.updateProfile);

export default router;
