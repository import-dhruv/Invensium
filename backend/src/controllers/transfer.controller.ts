import { Request, Response, NextFunction } from 'express';
import { transferService } from '../services/transfer.service';

export const transferController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const transfer = await transferService.create({
        ...req.body,
        createdById: req.user!.userId,
      });
      res.status(201).json({ success: true, data: transfer });
    } catch (err) { next(err); }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await transferService.getAll({
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const transfer = await transferService.getById(req.params.id);
      res.json({ success: true, data: transfer });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const transfer = await transferService.update(req.params.id, req.body);
      res.json({ success: true, data: transfer });
    } catch (err) { next(err); }
  },

  async addLine(req: Request, res: Response, next: NextFunction) {
    try {
      const line = await transferService.addLine(req.params.id, req.body);
      res.status(201).json({ success: true, data: line });
    } catch (err) { next(err); }
  },

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const transfer = await transferService.validate(req.params.id);
      res.json({ success: true, data: transfer });
    } catch (err) { next(err); }
  },
};
