import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../middleware/auth';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body as { email: string; password: string; name: string };
      const result = await authService.signup(email, password, name);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      const tokens = await authService.refresh(refreshToken);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout(req.userId!);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getProfile(req.userId!);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body as { email: string };
      const { resetToken } = await authService.forgotPassword(email);

      // In production, you would email the link. For demo, we return it directly.
      if (resetToken === 'USER_NOT_FOUND') {
        // Don't reveal if user exists
        res.json({ message: 'If that email is registered, a reset link will appear here.', resetLink: null });
        return;
      }

      const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`;
      res.json({
        message: 'Password reset link generated. Copy the link below to reset your password.',
        resetLink,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body as { token: string; password: string };
      await authService.resetPassword(token, password);
      res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
    } catch (error) {
      next(error);
    }
  }
}
