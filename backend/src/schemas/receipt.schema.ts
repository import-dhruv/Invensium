import { z } from 'zod';

export const createReceiptSchema = z.object({
  supplier: z.string().optional(),
  locationId: z.string().min(1, 'Location is required'),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const addReceiptLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantityOrdered: z.number().positive('Quantity must be positive'),
  quantityReceived: z.number().min(0).optional(),
});
