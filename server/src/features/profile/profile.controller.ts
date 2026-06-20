import { Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';
import { AuthRequest } from '../../middleware/auth';

const profileService = new ProfileService();

export class ProfileController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await profileService.getProfile(req.userId!);
      res.json({ profile });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await profileService.updateProfile(req.userId!, req.body);
      res.json({ profile });
    } catch (error) {
      next(error);
    }
  }
}
