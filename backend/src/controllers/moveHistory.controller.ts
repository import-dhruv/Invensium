import { Request, Response, NextFunction } from 'express';
import { moveHistoryService } from '../services/moveHistory.service';

export const moveHistoryController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { moveType, productId, reference, startDate, endDate, page, limit } = req.query;
      const result = await moveHistoryService.getAll({
        moveType: moveType as string,
        productId: productId as string,
        reference: reference as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },
};
