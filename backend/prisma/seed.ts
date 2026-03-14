import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  // 1. Create users
  const password = await bcrypt.hash('password123', 12);

  const manager = await prisma.user.upsert({
    where: { email: 'manager@coreinventory.com' },
    update: {},
    create: {
      name: 'John Manager',
      email: 'manager@coreinventory.com',
      password,
      role: 'INVENTORY_MANAGER',
    },
  });
  console.log(`User: ${manager.name} (${manager.role})`);

  const staff = await prisma.user.upsert({
    where: { email: 'staff@coreinventory.com' },
    update: {},
    create: {
      name: 'Jane Staff',
      email: 'staff@coreinventory.com',
      password,
      role: 'WAREHOUSE_STAFF',
    },
  });
  console.log(`User: ${staff.name} (${staff.role})`);

  // 2. Create categories
  const categories = ['Raw Materials', 'Finished Goods', 'Packaging', 'Components'];
  const createdCategories = [];
  for (const name of categories) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdCategories.push(cat);
    console.log(`Category: ${cat.name}`);
  }

  // 3. Create warehouses
  const wh1 = await prisma.warehouse.upsert({
    where: { name: 'Main Warehouse' },
    update: {},
    create: { name: 'Main Warehouse', address: '123 Industrial Rd, Warehouse District' },
  });
  console.log(`Warehouse: ${wh1.name}`);

  const wh2 = await prisma.warehouse.upsert({
    where: { name: 'Secondary Warehouse' },
    update: {},
    create: { name: 'Secondary Warehouse', address: '456 Storage Ave, Block B' },
  });
  console.log(`Warehouse: ${wh2.name}`);

  // 4. Create locations
  const locations = [
    { name: 'Rack A', warehouseId: wh1.id },
    { name: 'Rack B', warehouseId: wh1.id },
    { name: 'Production Floor', warehouseId: wh1.id },
    { name: 'Receiving Dock', warehouseId: wh1.id },
    { name: 'Shipping Dock', warehouseId: wh1.id },
    { name: 'Rack A', warehouseId: wh2.id },
    { name: 'Rack B', warehouseId: wh2.id },
  ];

  const createdLocations = [];
  for (const loc of locations) {
    const location = await prisma.location.upsert({
      where: { name_warehouseId: { name: loc.name, warehouseId: loc.warehouseId } },
      update: {},
      create: loc,
    });
    createdLocations.push(location);
  }
  console.log(`${createdLocations.length} locations created`);

  // 5. Create products
  const products = [
    { name: 'Steel Rods', sku: 'RAW-STL-001', categoryId: createdCategories[0].id, uom: 'KG' as const },
    { name: 'Aluminum Sheets', sku: 'RAW-ALU-001', categoryId: createdCategories[0].id, uom: 'KG' as const },
    { name: 'Office Chairs', sku: 'FIN-CHR-001', categoryId: createdCategories[1].id, uom: 'UNIT' as const },
    { name: 'Standing Desks', sku: 'FIN-DSK-001', categoryId: createdCategories[1].id, uom: 'UNIT' as const },
    { name: 'Cardboard Boxes (Large)', sku: 'PKG-BOX-001', categoryId: createdCategories[2].id, uom: 'BOX' as const },
    { name: 'Screws M6x25', sku: 'CMP-SCR-001', categoryId: createdCategories[3].id, uom: 'PACK' as const },
    { name: 'Bolts M8x30', sku: 'CMP-BLT-001', categoryId: createdCategories[3].id, uom: 'PACK' as const },
    { name: 'Wooden Panels', sku: 'RAW-WOD-001', categoryId: createdCategories[0].id, uom: 'UNIT' as const },
  ];

  const createdProducts = [];
  for (const prod of products) {
    const product = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });
    createdProducts.push(product);
    console.log(`Product: ${product.name} (${product.sku})`);
  }

  // 6. Set initial stock levels
  const stockLevels = [
    { productId: createdProducts[0].id, locationId: createdLocations[0].id, quantity: 500 },  // Steel Rods in Rack A
    { productId: createdProducts[1].id, locationId: createdLocations[0].id, quantity: 200 },  // Aluminum in Rack A
    { productId: createdProducts[2].id, locationId: createdLocations[1].id, quantity: 75 },   // Chairs in Rack B
    { productId: createdProducts[3].id, locationId: createdLocations[1].id, quantity: 30 },   // Desks in Rack B
    { productId: createdProducts[4].id, locationId: createdLocations[3].id, quantity: 200 },  // Boxes at Receiving
    { productId: createdProducts[5].id, locationId: createdLocations[0].id, quantity: 1000 }, // Screws in Rack A
    { productId: createdProducts[6].id, locationId: createdLocations[0].id, quantity: 800 },  // Bolts in Rack A
    { productId: createdProducts[7].id, locationId: createdLocations[1].id, quantity: 150 },  // Panels in Rack B
  ];

  for (const sl of stockLevels) {
    await prisma.stockLevel.upsert({
      where: { productId_locationId: { productId: sl.productId, locationId: sl.locationId } },
      update: { quantity: sl.quantity },
      create: sl,
    });
  }
  console.log(`${stockLevels.length} stock levels set`);

  // 7. Create reorder rules
  const reorderRules = [
    { productId: createdProducts[0].id, locationId: createdLocations[0].id, minQuantity: 100, maxQuantity: 1000 },
    { productId: createdProducts[2].id, locationId: createdLocations[1].id, minQuantity: 10, maxQuantity: 100 },
    { productId: createdProducts[4].id, locationId: createdLocations[3].id, minQuantity: 50, maxQuantity: 500 },
  ];

  for (const rule of reorderRules) {
    await prisma.reorderRule.upsert({
      where: { productId_locationId: { productId: rule.productId, locationId: rule.locationId } },
      update: { minQuantity: rule.minQuantity, maxQuantity: rule.maxQuantity },
      create: rule,
    });
  }
  console.log(`${reorderRules.length} reorder rules created`);

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
