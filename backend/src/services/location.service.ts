import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

export const locationService = {
  async create(name: string, warehouseId: string) {
    const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) {
      throw createError('Warehouse not found', 404);
    }

    const existing = await prisma.location.findUnique({
      where: { name_warehouseId: { name, warehouseId } },
    });
    if (existing) {
      throw createError(`Location "${name}" already exists in this warehouse`, 409);
    }

    return prisma.location.create({
      data: { name, warehouseId },
      include: { warehouse: true },
    });
  },

  async getAll(warehouseId?: string) {
    const where: any = {};
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }
    return prisma.location.findMany({
      where,
      include: { warehouse: true },
      orderBy: { name: 'asc' },
    });
  },

  async getById(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        warehouse: true,
        stockLevels: { include: { product: true } },
      },
    });
    if (!location) {
      throw createError('Location not found', 404);
    }
    return location;
  },

  async update(id: string, data: { name?: string }) {
    const location = await prisma.location.findUnique({ where: { id } });
    if (!location) {
      throw createError('Location not found', 404);
    }
    return prisma.location.update({
      where: { id },
      data,
      include: { warehouse: true },
    });
  },

  async delete(id: string) {
    const location = await prisma.location.findUnique({ where: { id } });
    if (!location) {
      throw createError('Location not found', 404);
    }
    await prisma.location.delete({ where: { id } });
    return { message: 'Location deleted successfully' };
  },
};
