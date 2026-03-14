export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: string;
  stock: number;
  minStock: number;
  location: string;
  price: number;
}

export interface Operation {
  id: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  reference: string;
  status: 'draft' | 'confirmed' | 'done' | 'cancelled';
  date: string;
  partner?: string;
  sourceLocation?: string;
  destLocation?: string;
  items: { productId: string; productName: string; quantity: number }[];
}

export interface StockMove {
  id: string;
  date: string;
  product: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  from: string;
  to: string;
  quantity: number;
  reference: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  locations: { id: string; name: string; type: string }[];
}

export const categories = ['Electronics', 'Furniture', 'Office Supplies', 'Raw Materials', 'Packaging'];

export const warehouses: Warehouse[] = [
  {
    id: 'wh1', name: 'Main Warehouse', code: 'WH-MAIN',
    locations: [
      { id: 'loc1', name: 'Zone A - Shelf 1', type: 'internal' },
      { id: 'loc2', name: 'Zone A - Shelf 2', type: 'internal' },
      { id: 'loc3', name: 'Zone B - Floor', type: 'internal' },
      { id: 'loc4', name: 'Receiving Dock', type: 'receiving' },
      { id: 'loc5', name: 'Shipping Dock', type: 'shipping' },
    ]
  },
  {
    id: 'wh2', name: 'Secondary Depot', code: 'WH-SEC',
    locations: [
      { id: 'loc6', name: 'Storage Room 1', type: 'internal' },
      { id: 'loc7', name: 'Storage Room 2', type: 'internal' },
    ]
  },
];

export const products: Product[] = [
  { id: 'p1', name: 'Mechanical Keyboard', sku: 'EL-KB-001', category: 'Electronics', unitOfMeasure: 'Units', stock: 142, minStock: 20, location: 'Zone A - Shelf 1', price: 89.99 },
  { id: 'p2', name: 'USB-C Hub', sku: 'EL-HB-002', category: 'Electronics', unitOfMeasure: 'Units', stock: 58, minStock: 15, location: 'Zone A - Shelf 1', price: 45.00 },
  { id: 'p3', name: 'Standing Desk', sku: 'FR-DK-001', category: 'Furniture', unitOfMeasure: 'Units', stock: 12, minStock: 5, location: 'Zone B - Floor', price: 549.00 },
  { id: 'p4', name: 'Monitor Arm', sku: 'FR-MA-002', category: 'Furniture', unitOfMeasure: 'Units', stock: 34, minStock: 10, location: 'Zone A - Shelf 2', price: 129.00 },
  { id: 'p5', name: 'A4 Paper Ream', sku: 'OS-PP-001', category: 'Office Supplies', unitOfMeasure: 'Reams', stock: 3, minStock: 50, location: 'Storage Room 1', price: 8.50 },
  { id: 'p6', name: 'Bubble Wrap Roll', sku: 'PK-BW-001', category: 'Packaging', unitOfMeasure: 'Rolls', stock: 8, minStock: 10, location: 'Zone B - Floor', price: 22.00 },
  { id: 'p7', name: 'Steel Rod 12mm', sku: 'RM-SR-001', category: 'Raw Materials', unitOfMeasure: 'Meters', stock: 250, minStock: 100, location: 'Zone B - Floor', price: 4.20 },
  { id: 'p8', name: 'Ethernet Cable Cat6', sku: 'EL-EC-003', category: 'Electronics', unitOfMeasure: 'Units', stock: 5, minStock: 30, location: 'Zone A - Shelf 2', price: 12.00 },
];

export const operations: Operation[] = [
  { id: 'op1', type: 'receipt', reference: 'REC-2026-001', status: 'done', date: '2026-03-10', partner: 'TechParts Inc.', destLocation: 'Receiving Dock', items: [{ productId: 'p1', productName: 'Mechanical Keyboard', quantity: 50 }] },
  { id: 'op2', type: 'receipt', reference: 'REC-2026-002', status: 'confirmed', date: '2026-03-13', partner: 'PaperWorld Co.', destLocation: 'Receiving Dock', items: [{ productId: 'p5', productName: 'A4 Paper Ream', quantity: 200 }] },
  { id: 'op3', type: 'delivery', reference: 'DEL-2026-001', status: 'done', date: '2026-03-11', partner: 'Acme Corp', sourceLocation: 'Shipping Dock', items: [{ productId: 'p3', productName: 'Standing Desk', quantity: 3 }, { productId: 'p4', productName: 'Monitor Arm', quantity: 6 }] },
  { id: 'op4', type: 'delivery', reference: 'DEL-2026-002', status: 'draft', date: '2026-03-14', partner: 'StartupHQ', sourceLocation: 'Shipping Dock', items: [{ productId: 'p1', productName: 'Mechanical Keyboard', quantity: 10 }] },
  { id: 'op5', type: 'transfer', reference: 'TRF-2026-001', status: 'done', date: '2026-03-12', sourceLocation: 'Zone A - Shelf 1', destLocation: 'Storage Room 1', items: [{ productId: 'p2', productName: 'USB-C Hub', quantity: 20 }] },
  { id: 'op6', type: 'adjustment', reference: 'ADJ-2026-001', status: 'done', date: '2026-03-09', destLocation: 'Zone B - Floor', items: [{ productId: 'p6', productName: 'Bubble Wrap Roll', quantity: -2 }] },
];

export const stockMoves: StockMove[] = [
  { id: 'm1', date: '2026-03-10 09:15', product: 'Mechanical Keyboard', type: 'receipt', from: 'Supplier', to: 'Receiving Dock', quantity: 50, reference: 'REC-2026-001' },
  { id: 'm2', date: '2026-03-10 10:30', product: 'Mechanical Keyboard', type: 'transfer', from: 'Receiving Dock', to: 'Zone A - Shelf 1', quantity: 50, reference: 'REC-2026-001' },
  { id: 'm3', date: '2026-03-11 14:00', product: 'Standing Desk', type: 'delivery', from: 'Zone B - Floor', to: 'Shipping Dock', quantity: 3, reference: 'DEL-2026-001' },
  { id: 'm4', date: '2026-03-11 14:00', product: 'Monitor Arm', type: 'delivery', from: 'Zone A - Shelf 2', to: 'Shipping Dock', quantity: 6, reference: 'DEL-2026-001' },
  { id: 'm5', date: '2026-03-12 11:45', product: 'USB-C Hub', type: 'transfer', from: 'Zone A - Shelf 1', to: 'Storage Room 1', quantity: 20, reference: 'TRF-2026-001' },
  { id: 'm6', date: '2026-03-09 16:20', product: 'Bubble Wrap Roll', type: 'adjustment', from: 'Zone B - Floor', to: 'Zone B - Floor', quantity: -2, reference: 'ADJ-2026-001' },
  { id: 'm7', date: '2026-03-13 08:00', product: 'A4 Paper Ream', type: 'receipt', from: 'Supplier', to: 'Receiving Dock', quantity: 200, reference: 'REC-2026-002' },
];
