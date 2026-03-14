import { Request, Response, NextFunction } from 'express';
import { locationService } from '../services/location.service';

export const locationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.create(req.body.name, req.body.warehouseId);
      res.status(201).json({ success: true, data: location });
    } catch (err) { next(err); }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await locationService.getAll(req.query.warehouseId as string);
      res.json({ success: true, data: locations });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.getById(req.params.id);
      res.json({ success: true, data: location });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.update(req.params.id, req.body);
      res.json({ success: true, data: location });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await locationService.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },
};
