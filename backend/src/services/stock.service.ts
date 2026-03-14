import prisma from '../utils/prisma';
import { MoveType } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

export const stockService = {
  async incrementStock(productId: string, locationId: string, quantity: number) {
    await prisma.stockLevel.upsert({
      where: {
        productId_locationId: { productId, locationId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        productId,
        locationId,
        quantity,
      },
    });
  },

  async decrementStock(productId: string, locationId: string, quantity: number) {
    const stock = await prisma.stockLevel.findUnique({
      where: {
        productId_locationId: { productId, locationId },
      },
    });

    if (!stock || stock.quantity < quantity) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      throw createError(
        `Insufficient stock for "${product?.name || productId}". Available: ${stock?.quantity || 0}, Requested: ${quantity}`,
        400
      );
    }

    await prisma.stockLevel.update({
      where: {
        productId_locationId: { productId, locationId },
      },
      data: {
        quantity: { decrement: quantity },
      },
    });
  },

  async logMove(
    moveType: MoveType,
    reference: string,
    productId: string,
    fromLocationId: string | null,
    toLocationId: string | null,
    quantity: number,
    contact?: string
  ) {
    await prisma.moveHistory.create({
      data: {
        reference,
        moveType,
        productId,
        fromLocationId,
        toLocationId,
        quantity,
        contact,
        status: 'Done',
      },
    });
  },

  async getStockByProduct(productId: string) {
    return prisma.stockLevel.findMany({
      where: { productId },
      include: {
        location: {
          include: { warehouse: true },
        },
      },
    });
  },

  async getStockByLocation(locationId: string) {
    return prisma.stockLevel.findMany({
      where: { locationId },
      include: { product: true },
    });
  },

  async getTotalStock(productId: string): Promise<number> {
    const result = await prisma.stockLevel.aggregate({
      where: { productId },
      _sum: { quantity: true },
    });
    return result._sum.quantity || 0;
  },
};
