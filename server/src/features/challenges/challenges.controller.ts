import { Response, NextFunction } from 'express';
import { ChallengesService } from './challenges.service';
import { AuthRequest } from '../../middleware/auth';

const challengesService = new ChallengesService();

export class ChallengesController {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const challenges = await challengesService.getAllChallenges();
      res.json({ challenges });
    } catch (error) {
      next(error);
    }
  }

  async join(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userChallenge = await challengesService.joinChallenge(req.userId!, req.params.id as string);
      res.status(201).json({ userChallenge });
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { progress } = req.body as { progress: number };
      const userChallenge = await challengesService.updateProgress(req.userId!, req.params.id as string, progress);
      res.json({ userChallenge });
    } catch (error) {
      next(error);
    }
  }

  async getActive(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userChallenges = await challengesService.getActiveUserChallenges(req.userId!);
      res.json({ userChallenges });
    } catch (error) {
      next(error);
    }
  }
}
