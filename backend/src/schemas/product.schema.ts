import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().optional(),
  uom: z.enum(['UNIT', 'KG', 'GRAM', 'LITER', 'METER', 'BOX', 'PACK', 'DOZEN', 'TON']).optional(),
  description: z.string().optional(),
  initialStock: z
    .object({
      locationId: z.string(),
      quantity: z.number().min(0),
    })
    .optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  categoryId: z.string().nullable().optional(),
  uom: z.enum(['UNIT', 'KG', 'GRAM', 'LITER', 'METER', 'BOX', 'PACK', 'DOZEN', 'TON']).optional(),
  description: z.string().nullable().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});
