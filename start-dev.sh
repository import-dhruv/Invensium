#!/bin/bash

# CoreInventory Development Starter
# This script starts both backend and frontend in development mode

echo "Starting CoreInventory Development Servers"
echo "============================================="

# Function to cleanup background processes on exit
cleanup() {
    echo
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start backend server
echo "Starting backend server (port 3000)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server  
echo "Starting frontend server (port 8080)..."
cd frontend/blueprint-canvas-engine-main
npm run dev &
FRONTEND_PID=$!
cd ../..

echo
echo "Both servers are starting up..."
echo
echo "Frontend: http://localhost:8080"
echo "Backend:  http://localhost:3000/api"
echo
echo "Login credentials:"
echo "  Manager: manager@coreinventory.com / password123"
echo "  Staff:   staff@coreinventory.com / password123"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID