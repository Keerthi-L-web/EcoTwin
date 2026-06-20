import { Response, NextFunction } from 'express';
import { GoalsService } from './goals.service';
import { AuthRequest } from '../../middleware/auth';
import { CreateGoalInput, UpdateGoalInput } from './goals.schema';

const goalsService = new GoalsService();

export class GoalsController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const goals = await goalsService.getGoals(req.userId!);
      res.json({ goals });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const goal = await goalsService.createGoal(req.userId!, req.body as CreateGoalInput);
      res.status(201).json({ goal });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const goal = await goalsService.updateGoal(req.params.id as string, req.userId!, req.body as UpdateGoalInput);
      res.json({ goal });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await goalsService.deleteGoal(req.params.id as string, req.userId!);
      res.json({ message: 'Goal deleted' });
    } catch (error) {
      next(error);
    }
  }
}
