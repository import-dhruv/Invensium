# CoreInventory - Complete Inventory Management System

A full-stack inventory management system built with React, Node.js, Express, TypeScript, and PostgreSQL. This system implements ALL features specified in the original requirements.

## Fully Implemented Features

### Authentication System
- **User Registration & Login** - JWT-based authentication with role management
- **OTP-based Password Reset** - Secure password recovery with time-limited OTP tokens
- **Role-based Access Control** - INVENTORY_MANAGER and WAREHOUSE_STAFF roles
- **Automatic Dashboard Redirect** - Seamless login experience

### Dashboard Analytics
- **Complete KPI Dashboard** with real-time metrics:
  - Total Products in Stock
  - Low Stock / Out of Stock Items (with reorder rule integration)
  - Pending Receipts (total and late counts)
  - Pending Deliveries (total, late, and waiting counts)
  - Internal Transfers Scheduled
- **Dynamic Filtering System**:
  - By document type (Receipts/Deliveries/Transfers/Adjustments)
  - By status (Draft, Waiting, Ready, Done, Cancelled)
  - By warehouse and location
  - By product category
- **Recent Stock Movement Chart** - Visual representation of inventory activity

### Product Management
- **Complete Product CRUD** with:
  - Name, SKU/Code, Category, Unit of Measure
  - Description and initial stock setup
  - Product search and filtering
- **Product Categories** - Full category management system
- **Stock Availability per Location** - Multi-location inventory tracking
- **Reorder Rules Management** - Min/max quantity rules per location
- **Product Detail View** - Comprehensive stock and rules overview

### Operations Management

#### Receipts (Incoming Stock)
- **Complete Receipt Workflow**:
  1. Create receipt with supplier information
  2. Add products and quantities via line items
  3. Status progression: DRAFT → READY → DONE
  4. Automatic stock increment on validation
  5. Complete audit trail in move history

#### Delivery Orders (Outgoing Stock)
- **Complete Delivery Workflow**:
  1. Create delivery order with customer information
  2. Add products and quantities via line items
  3. Pick and pack process simulation
  4. Automatic stock decrement with availability validation
  5. Complete audit trail in move history

#### Internal Transfers
- **Inter-location Stock Movement**:
  - Transfer between any locations (Main Warehouse → Production Floor, Rack A → Rack B, Warehouse 1 → Warehouse 2)
  - Line items management for multiple products
  - Automatic stock adjustment (decrement source, increment destination)
  - Complete movement logging in ledger

#### Stock Adjustments
- **Physical Inventory Corrections**:
  - Record vs. physical count comparison
  - Automatic variance calculation
  - System stock updates based on physical counts
  - Reason tracking and audit trail

### Advanced Features
- **Multi-warehouse Support** - Complete warehouse and location hierarchy
- **SKU Search & Smart Filters** - Advanced search across all entities
- **Low Stock Alerts** - Integrated with reorder rules and dashboard KPIs
- **Complete Move History** - Full stock ledger with filtering and search
- **Reference Number Generation** - Automatic reference codes for all operations
- **Real-time Stock Tracking** - Live inventory updates across all operations

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Automated Setup
```bash
# Run the setup script (handles everything)
./setup.sh

# Or start development servers
./start-dev.sh
```

### Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api

### Login Credentials
**Manager Account:**
- Email: `manager@coreinventory.com`
- Password: `password123`

**Staff Account:**
- Email: `staff@coreinventory.com`
- Password: `password123`

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT Authentication
- Zod validation

### Frontend
- React 18 + TypeScript
- Vite build tool
- TailwindCSS + shadcn/ui
- TanStack React Query
- React Router

## Feature Completion Status

**Overall: 100% Feature Complete** - All requirements from the original specification have been implemented and tested.

## License

MIT License - see LICENSE file for details.