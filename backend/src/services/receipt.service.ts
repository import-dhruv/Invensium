import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import { generateReference } from '../utils/reference';
import { stockService } from './stock.service';

export const receiptService = {
  async create(data: {
    supplier?: string;
    locationId: string;
    scheduledDate?: string;
    notes?: string;
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
    const reference = await generateReference(warehouseCode, 'IN');

    return prisma.receipt.create({
      data: {
        reference,
        supplier: data.supplier,
        locationId: data.locationId,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        notes: data.notes,
        createdById: data.createdById,
      },
      include: { location: { include: { warehouse: true } }, lines: { include: { product: true } } },
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

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
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
      prisma.receipt.count({ where }),
    ]);

    return { receipts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        location: { include: { warehouse: true } },
        lines: { include: { product: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!receipt) {
      throw createError('Receipt not found', 404);
    }
    return receipt;
  },

  async update(id: string, data: { supplier?: string; scheduledDate?: string; notes?: string; status?: string }) {
    const receipt = await prisma.receipt.findUnique({ where: { id } });
    if (!receipt) {
      throw createError('Receipt not found', 404);
    }
    if (receipt.status === 'DONE' || receipt.status === 'CANCELLED') {
      throw createError('Cannot modify a completed or cancelled receipt', 400);
    }

    const updateData: any = {};
    if (data.supplier !== undefined) updateData.supplier = data.supplier;
    if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status) updateData.status = data.status;

    return prisma.receipt.update({
      where: { id },
      data: updateData,
      include: { location: { include: { warehouse: true } }, lines: { include: { product: true } } },
    });
  },

  async addLine(receiptId: string, data: {
    productId: string;
    quantityOrdered: number;
    quantityReceived?: number;
  }) {
    const receipt = await prisma.receipt.findUnique({ where: { id: receiptId } });
    if (!receipt) {
      throw createError('Receipt not found', 404);
    }
    if (receipt.status === 'DONE' || receipt.status === 'CANCELLED') {
      throw createError('Cannot add lines to a completed or cancelled receipt', 400);
    }

    return prisma.receiptLine.create({
      data: {
        receiptId,
        productId: data.productId,
        quantityOrdered: data.quantityOrdered,
        quantityReceived: data.quantityReceived || 0,
      },
      include: { product: true },
    });
  },

  async validate(id: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        lines: { include: { product: true } },
        location: { include: { warehouse: true } },
      },
    });
    if (!receipt) {
      throw createError('Receipt not found', 404);
    }
    if (receipt.status === 'DONE') {
      throw createError('Receipt is already validated', 400);
    }
    if (receipt.status === 'CANCELLED') {
      throw createError('Cannot validate a cancelled receipt', 400);
    }
    if (receipt.lines.length === 0) {
      throw createError('Cannot validate a receipt with no lines', 400);
    }

    // Process each line: use quantityOrdered as received if quantityReceived is 0
    for (const line of receipt.lines) {
      const qty = line.quantityReceived > 0 ? line.quantityReceived : line.quantityOrdered;

      // Update quantityReceived
      await prisma.receiptLine.update({
        where: { id: line.id },
        data: { quantityReceived: qty },
      });

      // Increment stock
      await stockService.incrementStock(line.productId, receipt.locationId, qty);

      // Log move
      await stockService.logMove(
        'IN',
        receipt.reference,
        line.productId,
        null,
        receipt.locationId,
        qty,
        receipt.supplier || undefined
      );
    }

    // Update status
    return prisma.receipt.update({
      where: { id },
      data: { status: 'DONE' },
      include: {
        location: { include: { warehouse: true } },
        lines: { include: { product: true } },
      },
    });
  },
};
