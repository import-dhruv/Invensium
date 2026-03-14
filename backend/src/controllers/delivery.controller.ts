import { Request, Response, NextFunction } from 'express';
import { deliveryService } from '../services/delivery.service';

export const deliveryController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const delivery = await deliveryService.create({
        ...req.body,
        createdById: req.user!.userId,
      });
      res.status(201).json({ success: true, data: delivery });
    } catch (err) { next(err); }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, locationId, page, limit } = req.query;
      const result = await deliveryService.getAll({
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
      const delivery = await deliveryService.getById(req.params.id);
      res.json({ success: true, data: delivery });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const delivery = await deliveryService.update(req.params.id, req.body);
      res.json({ success: true, data: delivery });
    } catch (err) { next(err); }
  },

  async addLine(req: Request, res: Response, next: NextFunction) {
    try {
      const line = await deliveryService.addLine(req.params.id, req.body);
      res.status(201).json({ success: true, data: line });
    } catch (err) { next(err); }
  },

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const delivery = await deliveryService.validate(req.params.id);
      res.json({ success: true, data: delivery });
    } catch (err) { next(err); }
  },
};
