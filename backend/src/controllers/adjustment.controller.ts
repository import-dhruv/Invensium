import { Request, Response, NextFunction } from 'express';
import { adjustmentService } from '../services/adjustment.service';

export const adjustmentController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const adjustment = await adjustmentService.create({
        ...req.body,
        createdById: req.user!.userId,
      });
      res.status(201).json({ success: true, data: adjustment });
    } catch (err) { next(err); }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, locationId, page, limit } = req.query;
      const result = await adjustmentService.getAll({
        status: status as string,
        locationId: locationId as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const adjustment = await adjustmentService.getById(req.params.id);
      res.json({ success: true, data: adjustment });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const adjustment = await adjustmentService.update(req.params.id, req.body);
      res.json({ success: true, data: adjustment });
    } catch (err) { next(err); }
  },

  async addLine(req: Request, res: Response, next: NextFunction) {
    try {
      const line = await adjustmentService.addLine(req.params.id, req.body);
      res.status(201).json({ success: true, data: line });
    } catch (err) { next(err); }
  },

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const adjustment = await adjustmentService.validate(req.params.id);
      res.json({ success: true, data: adjustment });
    } catch (err) { next(err); }
  },
};
