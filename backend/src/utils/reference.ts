import prisma from './prisma';

type ReferencePrefix = 'IN' | 'OUT' | 'INT' | 'ADJ';

const tableMap: Record<ReferencePrefix, string> = {
  IN: 'receipt',
  OUT: 'deliveryOrder',
  INT: 'internalTransfer',
  ADJ: 'stockAdjustment',
};

export async function generateReference(
  warehouseCode: string,
  prefix: ReferencePrefix
): Promise<string> {
  const tableName = tableMap[prefix];
  const pattern = `${warehouseCode}/${prefix}/%`;

  // Count existing records with this pattern to determine next number
  let count: number;
  
  if (tableName === 'receipt') {
    count = await prisma.receipt.count({
      where: { reference: { startsWith: `${warehouseCode}/${prefix}/` } },
    });
  } else if (tableName === 'deliveryOrder') {
    count = await prisma.deliveryOrder.count({
      where: { reference: { startsWith: `${warehouseCode}/${prefix}/` } },
    });
  } else if (tableName === 'internalTransfer') {
    count = await prisma.internalTransfer.count({
      where: { reference: { startsWith: `${warehouseCode}/${prefix}/` } },
    });
  } else {
    count = await prisma.stockAdjustment.count({
      where: { reference: { startsWith: `${warehouseCode}/${prefix}/` } },
    });
  }

  const nextNum = (count + 1).toString().padStart(4, '0');
  return `${warehouseCode}/${prefix}/${nextNum}`;
}
