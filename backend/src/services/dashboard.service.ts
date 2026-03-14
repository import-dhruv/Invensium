import prisma from '../utils/prisma';

export const dashboardService = {
  async getKPIs() {
    const now = new Date();

    const [
      totalProducts,
      totalStockLevels,
      lowStockItems,
      outOfStockItems,
      pendingReceipts,
      lateReceipts,
      pendingDeliveries,
      lateDeliveries,
      waitingDeliveries,
      scheduledTransfers,
    ] = await Promise.all([
      // Total products
      prisma.product.count(),

      // Total stock levels (products with stock > 0)
      prisma.stockLevel.count({ where: { quantity: { gt: 0 } } }),

      // Low stock items (below reorder rule minimum)
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT sl."productId")::bigint as count
        FROM "StockLevel" sl
        INNER JOIN "ReorderRule" rr
          ON sl."productId" = rr."productId" AND sl."locationId" = rr."locationId"
        WHERE sl.quantity <= rr."minQuantity" AND sl.quantity > 0
      `.then((r) => Number(r[0]?.count || 0)),

      // Out of stock items
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT sl."productId")::bigint as count
        FROM "StockLevel" sl
        WHERE sl.quantity = 0
      `.then((r) => Number(r[0]?.count || 0)),

      // Pending receipts (not DONE or CANCELLED)
      prisma.receipt.count({
        where: { status: { notIn: ['DONE', 'CANCELLED'] } },
      }),

      // Late receipts
      prisma.receipt.count({
        where: {
          status: { notIn: ['DONE', 'CANCELLED'] },
          scheduledDate: { lt: now },
        },
      }),

      // Pending deliveries
      prisma.deliveryOrder.count({
        where: { status: { notIn: ['DONE', 'CANCELLED'] } },
      }),

      // Late deliveries
      prisma.deliveryOrder.count({
        where: {
          status: { notIn: ['DONE', 'CANCELLED'] },
          scheduledDate: { lt: now },
        },
      }),

      // Waiting deliveries
      prisma.deliveryOrder.count({
        where: { status: 'WAITING' },
      }),

      // Scheduled internal transfers
      prisma.internalTransfer.count({
        where: { status: { notIn: ['DONE', 'CANCELLED'] } },
      }),
    ]);

    return {
      totalProducts,
      totalStockLevels,
      lowStockItems,
      outOfStockItems,
      pendingReceipts: {
        total: pendingReceipts,
        late: lateReceipts,
      },
      pendingDeliveries: {
        total: pendingDeliveries,
        late: lateDeliveries,
        waiting: waitingDeliveries,
      },
      scheduledTransfers,
    };
  },
};
