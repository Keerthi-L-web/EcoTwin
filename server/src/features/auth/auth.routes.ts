import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { signupSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema';
import { authMiddleware } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';

const router = Router();
const controller = new AuthController();

router.post('/signup', authLimiter, validate(signupSchema), controller.signup);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshSchema), controller.refresh);
router.post('/logout', authMiddleware, controller.logout);
router.get('/me', authMiddleware, controller.me);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

export default router;
