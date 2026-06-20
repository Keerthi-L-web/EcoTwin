import { Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { AuthRequest } from '../../middleware/auth';

const reportsService = new ReportsService();

export class ReportsController {
  async getData(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportsService.getReportData(req.userId!);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}
