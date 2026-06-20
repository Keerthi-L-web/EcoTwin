import { Response, NextFunction } from 'express';
import { AIService } from './ai.service';
import { AuthRequest } from '../../middleware/auth';

const aiService = new AIService();

export class AIController {
  async scenario(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question } = req.body as { question: string };
      const result = await aiService.analyzeScenario(req.userId!, question);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async dailyAdvice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const advice = await aiService.getDailyAdvice(req.userId!);
      res.json({ recommendations: advice });
    } catch (error) {
      next(error);
    }
  }

  async weeklyPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await aiService.getWeeklyPlan(req.userId!);
      res.json({ plan });
    } catch (error) {
      next(error);
    }
  }

  async monthlyPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await aiService.getMonthlyPlan(req.userId!);
      res.json({ plan });
    } catch (error) {
      next(error);
    }
  }
}
