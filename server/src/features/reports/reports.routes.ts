import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const controller = new ReportsController();

router.get('/data', authMiddleware, controller.getData);

export default router;
