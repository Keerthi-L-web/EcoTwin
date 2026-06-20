import { Response, NextFunction } from 'express';
import { TrackerService } from './tracker.service';
import { AuthRequest } from '../../middleware/auth';

const trackerService = new TrackerService();

export class TrackerController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const activity = await trackerService.createActivity(req.userId!, req.body);
      res.status(201).json({ activity });
    } catch (error) {
      next(error);
    }
  }

  async getActivities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const range = (req.query.range as string) ?? 'week';
      const result = await trackerService.getActivities(req.userId!, range);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await trackerService.getSummary(req.userId!);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await trackerService.deleteActivity(req.params.id as string, req.userId!);
      res.json({ message: 'Activity deleted' });
    } catch (error) {
      next(error);
    }
  }

  async getDailyTotals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const totals = await trackerService.getDailyTotals(req.userId!, days);
      res.json({ totals });
    } catch (error) {
      next(error);
    }
  }
}
