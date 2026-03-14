import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';

export const productController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err) { next(err); }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, search, page, limit } = req.query;
      const result = await productService.getAll({
        categoryId: categoryId as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id);
      res.json({ success: true, data: product });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.delete(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getStock(req: Request, res: Response, next: NextFunction) {
    try {
      const stock = await productService.getStock(req.params.id);
      res.json({ success: true, data: stock });
    } catch (err) { next(err); }
  },

  async getReorderRules(req: Request, res: Response, next: NextFunction) {
    try {
      const rules = await productService.getReorderRules(req.params.id);
      res.json({ success: true, data: rules });
    } catch (err) { next(err); }
  },

  async createReorderRule(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await productService.createReorderRule(req.params.id, req.body);
      res.status(201).json({ success: true, data: rule });
    } catch (err) { next(err); }
  },

  async updateReorderRule(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await productService.updateReorderRule(req.params.ruleId, req.body);
      res.json({ success: true, data: rule });
    } catch (err) { next(err); }
  },

  async deleteReorderRule(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.deleteReorderRule(req.params.ruleId);
      res.json({ success: true, data: { message: 'Reorder rule deleted' } });
    } catch (err) { next(err); }
  },
};
