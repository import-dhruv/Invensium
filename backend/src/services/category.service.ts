import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

export const categoryService = {
  async create(name: string) {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      throw createError(`Category "${name}" already exists`, 409);
    }
    return prisma.category.create({ data: { name } });
  },

  async getAll() {
    return prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!category) {
      throw createError('Category not found', 404);
    }
    return category;
  },

  async update(id: string, name: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw createError('Category not found', 404);
    }
    return prisma.category.update({ where: { id }, data: { name } });
  },

  async delete(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw createError('Category not found', 404);
    }
    await prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  },
};
