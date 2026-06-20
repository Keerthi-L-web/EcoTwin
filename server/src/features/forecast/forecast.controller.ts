import { Response, NextFunction } from 'express';
import { ForecastService } from './forecast.service';
import { AuthRequest } from '../../middleware/auth';

const forecastService = new ForecastService();

export class ForecastController {
  async getForecast(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query.period as string) ?? 'month';
      const forecast = await forecastService.getForecast(req.userId!, period);
      res.json({ forecast });
    } catch (error) {
      next(error);
    }
  }
}
