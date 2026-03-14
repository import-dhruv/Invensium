import { Request, Response, NextFunction } from 'express';
import { receiptService } from '../services/receipt.service';

export const receiptController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const receipt = await receiptService.create({
        ...req.body,
        createdById: req.user!.userId,
      });
      res.status(201).json({ success: true, data: receipt });
    } catch (err) { next(err); }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, locationId, page, limit } = req.query;
      const result = await receiptService.getAll({
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
      const receipt = await receiptService.getById(req.params.id);
      res.json({ success: true, data: receipt });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const receipt = await receiptService.update(req.params.id, req.body);
      res.json({ success: true, data: receipt });
    } catch (err) { next(err); }
  },

  async addLine(req: Request, res: Response, next: NextFunction) {
    try {
      const line = await receiptService.addLine(req.params.id, req.body);
      res.status(201).json({ success: true, data: line });
    } catch (err) { next(err); }
  },

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const receipt = await receiptService.validate(req.params.id);
      res.json({ success: true, data: receipt });
    } catch (err) { next(err); }
  },
};
