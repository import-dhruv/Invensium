import { z } from 'zod';

export const createAdjustmentSchema = z.object({
  locationId: z.string().min(1, 'Location is required'),
  reason: z.string().optional(),
});

export const addAdjustmentLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  countedQty: z.number().min(0, 'Counted quantity cannot be negative'),
});
