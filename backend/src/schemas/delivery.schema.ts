import { z } from 'zod';

export const createDeliverySchema = z.object({
  customer: z.string().optional(),
  locationId: z.string().min(1, 'Location is required'),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const addDeliveryLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantityOrdered: z.number().positive('Quantity must be positive'),
  quantityDelivered: z.number().min(0).optional(),
});
