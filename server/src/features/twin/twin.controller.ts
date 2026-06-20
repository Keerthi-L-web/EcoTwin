import { Response, NextFunction } from 'express';
import { TwinService } from './twin.service';
import { AuthRequest } from '../../middleware/auth';

const twinService = new TwinService();

export class TwinController {
  async simulate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await twinService.simulate(req.userId!, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const simulations = await twinService.getHistory(req.userId!);
      res.json({ simulations });
    } catch (error) {
      next(error);
    }
  }

  async getComparison(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const comparison = await twinService.getComparison(req.userId!);
      res.json(comparison);
    } catch (error) {
      next(error);
    }
  }
}
