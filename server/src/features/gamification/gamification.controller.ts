import { Response, NextFunction } from 'express';
import { GamificationService } from './gamification.service';
import { AuthRequest } from '../../middleware/auth';

const gamificationService = new GamificationService();

export class GamificationController {
  async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await gamificationService.getStats(req.userId!);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const leaderboard = await gamificationService.getLeaderboard();
      res.json({ leaderboard });
    } catch (error) {
      next(error);
    }
  }

  async getBadges(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await gamificationService.getAllBadges(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
