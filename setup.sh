#!/bin/bash

# CoreInventory Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

echo "CoreInventory Setup Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if PostgreSQL is installed
check_postgresql() {
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed. Please install PostgreSQL first."
        print_warning "On Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
        print_warning "On CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
        exit 1
    fi
    
    print_success "PostgreSQL is installed"
}

# Install backend dependencies
install_backend() {
    print_status "Installing backend dependencies..."
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "Backend package.json not found!"
        exit 1
    fi
    
    npm install
    print_success "Backend dependencies installed"
    cd ..
}

# Install frontend dependencies
install_frontend() {
    print_status "Installing frontend dependencies..."
    cd frontend/blueprint-canvas-engine-main
    
    if [ ! -f "package.json" ]; then
        print_error "Frontend package.json not found!"
        exit 1
    fi
    
    npm install
    print_success "Frontend dependencies installed"
    cd ../..
}

# Setup PostgreSQL database
setup_database() {
    print_status "Setting up PostgreSQL database..."
    
    # Start PostgreSQL service
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql || print_warning "Could not start PostgreSQL service"
    fi
    
    # Create database and set password
    print_status "Creating database and setting up user..."
    
    # Try to create database (ignore if exists)
    sudo -u postgres psql -c "CREATE DATABASE coreinventory;" 2>/dev/null || print_warning "Database might already exist"
    
    # Set postgres user password
    sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" || {
        print_error "Failed to set postgres password. You may need to do this manually."
        print_warning "Run: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\""
    }
    
    print_success "Database setup completed"
}

# Setup Prisma and seed data
setup_prisma() {
    print_status "Setting up Prisma and database schema..."
    cd backend
    
    # Generate Prisma client
    npx prisma generate
    
    # Push schema to database
    npx prisma db push || {
        print_error "Failed to push database schema. Check your database connection."
        print_warning "Make sure PostgreSQL is running and credentials are correct."
        exit 1
    }
    
    # Seed database with sample data
    print_status "Seeding database with sample data..."
    npm run prisma:seed || {
        print_error "Failed to seed database"
        exit 1
    }
    
    print_success "Prisma setup and seeding completed"
    cd ..
}

# Create environment files
setup_env() {
    print_status "Setting up environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coreinventory?schema=public"
JWT_SECRET="coreinventory-dev-secret-key-2024"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
EOF
        print_success "Created backend/.env"
        print_warning "SECURITY: Change JWT_SECRET for production deployment!"
    else
        print_warning "backend/.env already exists, skipping..."
    fi
}

# Production setup warning
production_warning() {
    echo
    print_warning "PRODUCTION DEPLOYMENT NOTES:"
    echo "1. Copy .env.production.example to .env and update with secure values"
    echo "2. Generate secure JWT_SECRET: openssl rand -base64 32"
    echo "3. Use production database credentials"
    echo "4. Review DEPLOYMENT.md for complete production setup guide"
    echo "5. Never commit .env files to version control"
    echo
}

# Main setup function
main() {
    echo
    print_status "Starting CoreInventory setup..."
    echo
    
    # Pre-flight checks
    check_node
    check_postgresql
    
    # Setup environment
    setup_env
    
    # Install dependencies
    install_backend
    install_frontend
    
    # Database setup
    setup_database
    setup_prisma
    
    echo
    print_success "Setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Start the backend server:"
    echo "   cd backend && npm run dev"
    echo
    echo "2. In a new terminal, start the frontend:"
    echo "   cd frontend/blueprint-canvas-engine-main && npm run dev"
    echo
    echo "3. Open your browser to: http://localhost:8080"
    echo
    echo "Login credentials:"
    echo "  Manager: manager@coreinventory.com / password123"
    echo "  Staff:   staff@coreinventory.com / password123"
    echo
    
    production_warning
}

# Run main function
main "$@"