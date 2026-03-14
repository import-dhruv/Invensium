import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import { UnitOfMeasure } from '@prisma/client';
import { stockService } from './stock.service';

export const productService = {
  async create(data: {
    name: string;
    sku: string;
    categoryId?: string;
    uom?: string;
    description?: string;
    initialStock?: { locationId: string; quantity: number };
  }) {
    const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existing) {
      throw createError(`Product with SKU "${data.sku}" already exists`, 409);
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId,
        uom: (data.uom as UnitOfMeasure) || 'UNIT',
        description: data.description,
      },
      include: { category: true },
    });

    // Set initial stock if provided
    if (data.initialStock && data.initialStock.quantity > 0) {
      await stockService.incrementStock(
        product.id,
        data.initialStock.locationId,
        data.initialStock.quantity
      );
      await stockService.logMove(
        'IN',
        `INIT/${product.sku}`,
        product.id,
        null,
        data.initialStock.locationId,
        data.initialStock.quantity
      );
    }

    return product;
  },

  async getAll(filters?: {
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, stockLevels: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => ({
        ...p,
        totalStock: p.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        stockLevels: {
          include: { location: { include: { warehouse: true } } },
        },
        reorderRules: true,
      },
    });
    if (!product) {
      throw createError('Product not found', 404);
    }
    return {
      ...product,
      totalStock: product.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0),
    };
  },

  async update(id: string, data: {
    name?: string;
    sku?: string;
    categoryId?: string | null;
    uom?: string;
    description?: string | null;
  }) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw createError('Product not found', 404);
    }

    if (data.sku && data.sku !== product.sku) {
      const skuExists = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (skuExists) {
        throw createError(`SKU "${data.sku}" already in use`, 409);
      }
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        uom: data.uom as UnitOfMeasure | undefined,
      },
      include: { category: true },
    });
  },

  async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw createError('Product not found', 404);
    }
    await prisma.product.delete({ where: { id } });
    return { message: 'Product deleted successfully' };
  },

  async getStock(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw createError('Product not found', 404);
    }
    return stockService.getStockByProduct(productId);
  },

  async getReorderRules(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw createError('Product not found', 404);
    }
    
    return prisma.reorderRule.findMany({
      where: { productId },
      include: {
        location: {
          include: { warehouse: true },
        },
      },
    });
  },

  async createReorderRule(productId: string, data: {
    locationId: string;
    minQuantity: number;
    maxQuantity: number;
  }) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw createError('Product not found', 404);
    }

    const location = await prisma.location.findUnique({ where: { id: data.locationId } });
    if (!location) {
      throw createError('Location not found', 404);
    }

    const existing = await prisma.reorderRule.findUnique({
      where: { productId_locationId: { productId, locationId: data.locationId } },
    });
    if (existing) {
      throw createError('Reorder rule already exists for this product and location', 409);
    }

    return prisma.reorderRule.create({
      data: {
        productId,
        locationId: data.locationId,
        minQuantity: data.minQuantity,
        maxQuantity: data.maxQuantity,
      },
      include: {
        location: {
          include: { warehouse: true },
        },
      },
    });
  },

  async updateReorderRule(ruleId: string, data: {
    minQuantity?: number;
    maxQuantity?: number;
  }) {
    const rule = await prisma.reorderRule.findUnique({ where: { id: ruleId } });
    if (!rule) {
      throw createError('Reorder rule not found', 404);
    }

    return prisma.reorderRule.update({
      where: { id: ruleId },
      data,
      include: {
        location: {
          include: { warehouse: true },
        },
      },
    });
  },

  async deleteReorderRule(ruleId: string) {
    const rule = await prisma.reorderRule.findUnique({ where: { id: ruleId } });
    if (!rule) {
      throw createError('Reorder rule not found', 404);
    }

    await prisma.reorderRule.delete({ where: { id: ruleId } });
    return { message: 'Reorder rule deleted successfully' };
  },
};
