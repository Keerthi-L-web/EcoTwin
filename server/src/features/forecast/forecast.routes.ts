import { Router } from 'express';
import { ForecastController } from './forecast.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const controller = new ForecastController();

router.get('/', authMiddleware, controller.getForecast);

export default router;
