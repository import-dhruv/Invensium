import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import { generateReference } from '../utils/reference';
import { stockService } from './stock.service';

export const deliveryService = {
  async create(data: {
    customer?: string;
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
    const reference = await generateReference(warehouseCode, 'OUT');

    return prisma.deliveryOrder.create({
      data: {
        reference,
        customer: data.customer,
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

    const [deliveries, total] = await Promise.all([
      prisma.deliveryOrder.findMany({
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
      prisma.deliveryOrder.count({ where }),
    ]);

    return { deliveries, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getById(id: string) {
    const delivery = await prisma.deliveryOrder.findUnique({
      where: { id },
      include: {
        location: { include: { warehouse: true } },
        lines: { include: { product: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!delivery) {
      throw createError('Delivery order not found', 404);
    }
    return delivery;
  },

  async update(id: string, data: { customer?: string; scheduledDate?: string; notes?: string; status?: string }) {
    const delivery = await prisma.deliveryOrder.findUnique({ where: { id } });
    if (!delivery) {
      throw createError('Delivery order not found', 404);
    }
    if (delivery.status === 'DONE' || delivery.status === 'CANCELLED') {
      throw createError('Cannot modify a completed or cancelled delivery', 400);
    }

    const updateData: any = {};
    if (data.customer !== undefined) updateData.customer = data.customer;
    if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status) updateData.status = data.status;

    return prisma.deliveryOrder.update({
      where: { id },
      data: updateData,
      include: { location: { include: { warehouse: true } }, lines: { include: { product: true } } },
    });
  },

  async addLine(deliveryId: string, data: {
    productId: string;
    quantityOrdered: number;
    quantityDelivered?: number;
  }) {
    const delivery = await prisma.deliveryOrder.findUnique({ where: { id: deliveryId } });
    if (!delivery) {
      throw createError('Delivery order not found', 404);
    }
    if (delivery.status === 'DONE' || delivery.status === 'CANCELLED') {
      throw createError('Cannot add lines to a completed or cancelled delivery', 400);
    }

    return prisma.deliveryLine.create({
      data: {
        deliveryOrderId: deliveryId,
        productId: data.productId,
        quantityOrdered: data.quantityOrdered,
        quantityDelivered: data.quantityDelivered || 0,
      },
      include: { product: true },
    });
  },

  async validate(id: string) {
    const delivery = await prisma.deliveryOrder.findUnique({
      where: { id },
      include: {
        lines: { include: { product: true } },
        location: { include: { warehouse: true } },
      },
    });
    if (!delivery) {
      throw createError('Delivery order not found', 404);
    }
    if (delivery.status === 'DONE') {
      throw createError('Delivery is already validated', 400);
    }
    if (delivery.status === 'CANCELLED') {
      throw createError('Cannot validate a cancelled delivery', 400);
    }
    if (delivery.lines.length === 0) {
      throw createError('Cannot validate a delivery with no lines', 400);
    }

    // Process each line
    for (const line of delivery.lines) {
      const qty = line.quantityDelivered > 0 ? line.quantityDelivered : line.quantityOrdered;

      // Update quantityDelivered
      await prisma.deliveryLine.update({
        where: { id: line.id },
        data: { quantityDelivered: qty },
      });

      // Decrement stock (will throw if insufficient)
      await stockService.decrementStock(line.productId, delivery.locationId, qty);

      // Log move
      await stockService.logMove(
        'OUT',
        delivery.reference,
        line.productId,
        delivery.locationId,
        null,
        qty,
        delivery.customer || undefined
      );
    }

    return prisma.deliveryOrder.update({
      where: { id },
      data: { status: 'DONE' },
      include: {
        location: { include: { warehouse: true } },
        lines: { include: { product: true } },
      },
    });
  },
};
