import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

export const warehouseService = {
  async create(name: string, address?: string) {
    const existing = await prisma.warehouse.findUnique({ where: { name } });
    if (existing) {
      throw createError(`Warehouse "${name}" already exists`, 409);
    }
    return prisma.warehouse.create({ data: { name, address } });
  },

  async getAll() {
    return prisma.warehouse.findMany({
      include: {
        locations: true,
        _count: { select: { locations: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async getById(id: string) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: { locations: true },
    });
    if (!warehouse) {
      throw createError('Warehouse not found', 404);
    }
    return warehouse;
  },

  async update(id: string, data: { name?: string; address?: string }) {
    const warehouse = await prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) {
      throw createError('Warehouse not found', 404);
    }
    return prisma.warehouse.update({ where: { id }, data });
  },

  async delete(id: string) {
    const warehouse = await prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) {
      throw createError('Warehouse not found', 404);
    }
    await prisma.warehouse.delete({ where: { id } });
    return { message: 'Warehouse deleted successfully' };
  },
};
