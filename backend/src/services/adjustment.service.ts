import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import { generateReference } from '../utils/reference';
import { stockService } from './stock.service';

export const adjustmentService = {
  async create(data: {
    locationId: string;
    reason?: string;
    createdById: string;
  }) {
    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
      include: { warehouse: true },
    });
    if (!location) {
      throw createError('Location not found', 404);
    }

    const warehouseCode = location.warehouse.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const reference = await generateReference(warehouseCode, 'ADJ');

    return prisma.stockAdjustment.create({
      data: {
        reference,
        locationId: data.locationId,
        reason: data.reason,
        createdById: data.createdById,
      },
      include: {
        location: { include: { warehouse: true } },
        lines: { include: { product: true } },
      },
    });
  },

  async getAll(filters?: {
    status?: string;
    locationId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.locationId) where.locationId = filters.locationId;

    const [adjustments, total] = await Promise.all([
      prisma.stockAdjustment.findMany({
        where,
        include: {
          location: { include: { warehouse: true } },
          lines: { include: { product: true } },
          createdBy: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockAdjustment.count({ where }),
    ]);

    return { adjustments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: string) {
    const adjustment = await prisma.stockAdjustment.findUnique({
      where: { id },
      include: {
        location: { include: { warehouse: true } },
        lines: { include: { product: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!adjustment) {
      throw createError('Stock adjustment not found', 404);
    }
    return adjustment;
  },

  async update(id: string, data: { reason?: string; status?: string }) {
    const adjustment = await prisma.stockAdjustment.findUnique({ where: { id } });
    if (!adjustment) throw createError('Stock adjustment not found', 404);
    if (adjustment.status === 'DONE' || adjustment.status === 'CANCELLED') {
      throw createError('Cannot modify a completed or cancelled adjustment', 400);
    }

    const updateData: any = {};
    if (data.reason !== undefined) updateData.reason = data.reason;
    if (data.status) updateData.status = data.status;

    return prisma.stockAdjustment.update({
      where: { id },
      data: updateData,
      include: { location: { include: { warehouse: true } }, lines: { include: { product: true } } },
    });
  },

  async addLine(adjustmentId: string, data: { productId: string; countedQty: number }) {
    const adjustment = await prisma.stockAdjustment.findUnique({ where: { id: adjustmentId } });
    if (!adjustment) throw createError('Stock adjustment not found', 404);
    if (adjustment.status === 'DONE' || adjustment.status === 'CANCELLED') {
      throw createError('Cannot add lines to a completed or cancelled adjustment', 400);
    }

    // Get current stock as recorded qty
    const stock = await prisma.stockLevel.findUnique({
      where: {
        productId_locationId: { productId: data.productId, locationId: adjustment.locationId },
      },
    });

    const recordedQty = stock?.quantity || 0;
    const difference = data.countedQty - recordedQty;

    return prisma.adjustmentLine.create({
      data: {
        adjustmentId,
        productId: data.productId,
        recordedQty,
        countedQty: data.countedQty,
        difference,
      },
      include: { product: true },
    });
  },

  async validate(id: string) {
    const adjustment = await prisma.stockAdjustment.findUnique({
      where: { id },
      include: { lines: { include: { product: true } } },
    });
    if (!adjustment) throw createError('Stock adjustment not found', 404);
    if (adjustment.status === 'DONE') throw createError('Adjustment is already validated', 400);
    if (adjustment.status === 'CANCELLED') throw createError('Cannot validate a cancelled adjustment', 400);
    if (adjustment.lines.length === 0) throw createError('Cannot validate an adjustment with no lines', 400);

    for (const line of adjustment.lines) {
      // Re-calculate difference with fresh stock data
      const stock = await prisma.stockLevel.findUnique({
        where: {
          productId_locationId: { productId: line.productId, locationId: adjustment.locationId },
        },
      });

      const recordedQty = stock?.quantity || 0;
      const difference = line.countedQty - recordedQty;

      // Update line with latest recorded qty and difference
      await prisma.adjustmentLine.update({
        where: { id: line.id },
        data: { recordedQty, difference },
      });

      if (difference > 0) {
        // Stock increase (found more than recorded)
        await stockService.incrementStock(line.productId, adjustment.locationId, difference);
      } else if (difference < 0) {
        // Stock decrease (found less than recorded)
        await stockService.decrementStock(line.productId, adjustment.locationId, Math.abs(difference));
      }

      // Log move
      await stockService.logMove(
        'ADJUSTMENT',
        adjustment.reference,
        line.productId,
        difference < 0 ? adjustment.locationId : null,
        difference > 0 ? adjustment.locationId : null,
        Math.abs(difference)
      );
    }

    return prisma.stockAdjustment.update({
      where: { id },
      data: { status: 'DONE' },
      include: {
        location: { include: { warehouse: true } },
        lines: { include: { product: true } },
      },
    });
  },
};
