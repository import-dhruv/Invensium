import { Request, Response, NextFunction } from 'express';
import { warehouseService } from '../services/warehouse.service';

export const warehouseController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouse = await warehouseService.create(req.body.name, req.body.address);
      res.status(201).json({ success: true, data: warehouse });
    } catch (err) { next(err); }
  },

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const warehouses = await warehouseService.getAll();
      res.json({ success: true, data: warehouses });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouse = await warehouseService.getById(req.params.id);
      res.json({ success: true, data: warehouse });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouse = await warehouseService.update(req.params.id, req.body);
      res.json({ success: true, data: warehouse });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await warehouseService.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },
};
