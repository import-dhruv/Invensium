import prisma from '../utils/prisma';

export const moveHistoryService = {
  async getAll(filters?: {
    moveType?: string;
    productId?: string;
    reference?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.moveType) where.moveType = filters.moveType;
    if (filters?.productId) where.productId = filters.productId;
    if (filters?.reference) where.reference = { contains: filters.reference, mode: 'insensitive' };
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters?.startDate) where.date.gte = new Date(filters.startDate);
      if (filters?.endDate) where.date.lte = new Date(filters.endDate);
    }

    const [moves, total] = await Promise.all([
      prisma.moveHistory.findMany({
        where,
        include: {
          product: true,
          fromLocation: { include: { warehouse: true } },
          toLocation: { include: { warehouse: true } },
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.moveHistory.count({ where }),
    ]);

    return {
      moves,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },
};
