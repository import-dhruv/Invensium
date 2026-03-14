#!/bin/bash

# CoreInventory Setup Verification Script
echo "Verifying CoreInventory Setup"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}[OK]${NC} $2"
    else
        echo -e "${RED}[FAIL]${NC} $2"
    fi
}

# Check Node.js
node --version > /dev/null 2>&1
print_check $? "Node.js is installed"

# Check PostgreSQL
psql --version > /dev/null 2>&1
print_check $? "PostgreSQL is installed"

# Check backend dependencies
[ -d "backend/node_modules" ]
print_check $? "Backend dependencies installed"

# Check frontend dependencies
[ -d "frontend/blueprint-canvas-engine-main/node_modules" ]
print_check $? "Frontend dependencies installed"

# Check database connection
cd backend
npx prisma db pull > /dev/null 2>&1
print_check $? "Database connection working"

# Check if servers can start
echo
echo "Testing server startup..."
timeout 10s npm run dev > /dev/null 2>&1 &
sleep 5
curl -s http://localhost:3000/api/health > /dev/null 2>&1
print_check $? "Backend server responds"

pkill -f "ts-node-dev" > /dev/null 2>&1

echo
echo "Setup verification complete!"