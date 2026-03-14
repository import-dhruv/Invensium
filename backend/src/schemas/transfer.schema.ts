import { z } from 'zod';

export const createTransferSchema = z.object({
  fromLocationId: z.string().min(1, 'Source location is required'),
  toLocationId: z.string().min(1, 'Destination location is required'),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const addTransferLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().positive('Quantity must be positive'),
});
