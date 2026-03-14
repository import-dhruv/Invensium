import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';

export const categoryController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body.name);
      res.status(201).json({ success: true, data: category });
    } catch (err) { next(err); }
  },

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAll();
      res.json({ success: true, data: categories });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getById(req.params.id);
      res.json({ success: true, data: category });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.update(req.params.id, req.body.name);
      res.json({ success: true, data: category });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },
};
