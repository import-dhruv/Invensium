import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import { generateReference } from '../utils/reference';
import { stockService } from './stock.service';

export const transferService = {
  async create(data: {
    fromLocationId: string;
    toLocationId: string;
    scheduledDate?: string;
    notes?: string;
    createdById: string;
  }) {
    if (data.fromLocationId === data.toLocationId) {
      throw createError('Source and destination locations must be different', 400);
    }

    const [fromLoc, toLoc] = await Promise.all([
      prisma.location.findUnique({ where: { id: data.fromLocationId }, include: { warehouse: true } }),
      prisma.location.findUnique({ where: { id: data.toLocationId }, include: { warehouse: true } }),
    ]);

    if (!fromLoc) throw createError('Source location not found', 404);
    if (!toLoc) throw createError('Destination location not found', 404);

    const warehouseCode = fromLoc.warehouse.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const reference = await generateReference(warehouseCode, 'INT');

    return prisma.internalTransfer.create({
      data: {
        reference,
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        notes: data.notes,
        createdById: data.createdById,
      },
      include: {
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
        lines: { include: { product: true } },
      },
    });
  },

  async getAll(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;

    const [transfers, total] = await Promise.all([
      prisma.internalTransfer.findMany({
        where,
        include: {
          fromLocation: { include: { warehouse: true } },
          toLocation: { include: { warehouse: true } },
          lines: { include: { product: true } },
          createdBy: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.internalTransfer.count({ where }),
    ]);

    return { transfers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: string) {
    const transfer = await prisma.internalTransfer.findUnique({
      where: { id },
      include: {
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
        lines: { include: { product: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!transfer) {
      throw createError('Transfer not found', 404);
    }
    return transfer;
  },

  async update(id: string, data: { scheduledDate?: string; notes?: string; status?: string }) {
    const transfer = await prisma.internalTransfer.findUnique({ where: { id } });
    if (!transfer) throw createError('Transfer not found', 404);
    if (transfer.status === 'DONE' || transfer.status === 'CANCELLED') {
      throw createError('Cannot modify a completed or cancelled transfer', 400);
    }

    const updateData: any = {};
    if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status) updateData.status = data.status;

    return prisma.internalTransfer.update({
      where: { id },
      data: updateData,
      include: {
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
        lines: { include: { product: true } },
      },
    });
  },

  async addLine(transferId: string, data: { productId: string; quantity: number }) {
    const transfer = await prisma.internalTransfer.findUnique({ where: { id: transferId } });
    if (!transfer) throw createError('Transfer not found', 404);
    if (transfer.status === 'DONE' || transfer.status === 'CANCELLED') {
      throw createError('Cannot add lines to a completed or cancelled transfer', 400);
    }

    return prisma.transferLine.create({
      data: {
        transferId,
        productId: data.productId,
        quantity: data.quantity,
      },
      include: { product: true },
    });
  },

  async validate(id: string) {
    const transfer = await prisma.internalTransfer.findUnique({
      where: { id },
      include: { lines: { include: { product: true } } },
    });
    if (!transfer) throw createError('Transfer not found', 404);
    if (transfer.status === 'DONE') throw createError('Transfer is already validated', 400);
    if (transfer.status === 'CANCELLED') throw createError('Cannot validate a cancelled transfer', 400);
    if (transfer.lines.length === 0) throw createError('Cannot validate a transfer with no lines', 400);

    for (const line of transfer.lines) {
      // Decrement source
      await stockService.decrementStock(line.productId, transfer.fromLocationId, line.quantity);

      // Increment destination
      await stockService.incrementStock(line.productId, transfer.toLocationId, line.quantity);

      // Log move
      await stockService.logMove(
        'TRANSFER',
        transfer.reference,
        line.productId,
        transfer.fromLocationId,
        transfer.toLocationId,
        line.quantity
      );
    }

    return prisma.internalTransfer.update({
      where: { id },
      data: { status: 'DONE' },
      include: {
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
        lines: { include: { product: true } },
      },
    });
  },
};
