import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const dashboardController = {
  async getKPIs(_req: Request, res: Response, next: NextFunction) {
    try {
      const kpis = await dashboardService.getKPIs();
      res.json({ success: true, data: kpis });
    } catch (err) { next(err); }
  },
};
