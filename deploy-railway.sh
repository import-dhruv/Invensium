#!/bin/bash

# Railway Deployment Script for CoreInventory Backend
# This script helps deploy the backend to Railway

set -e

echo "🚂 CoreInventory Backend - Railway Deployment"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
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

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed."
        echo "Install it with: npm install -g @railway/cli"
        echo "Or visit: https://docs.railway.app/develop/cli"
        exit 1
    fi
    print_success "Railway CLI is installed"
}

# Check if we're on the backend branch
check_branch() {
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "backend" ]; then
        print_error "You must be on the 'backend' branch to deploy"
        echo "Switch with: git checkout backend"
        exit 1
    fi
    print_success "On backend branch"
}

# Login to Railway
railway_login() {
    print_info "Checking Railway authentication..."
    if ! railway whoami &> /dev/null; then
        print_info "Please login to Railway..."
        railway login
    fi
    print_success "Authenticated with Railway"
}

# Create or link project
setup_project() {
    print_info "Setting up Railway project..."
    
    if [ ! -f ".railway/project.json" ]; then
        print_info "Creating new Railway project..."
        railway init
    else
        print_success "Railway project already configured"
    fi
}

# Add PostgreSQL database
add_database() {
    print_info "Adding PostgreSQL database..."
    railway add --database postgresql || print_warning "Database might already exist"
    print_success "PostgreSQL database configured"
}

# Set environment variables
set_env_vars() {
    print_info "Setting environment variables..."
    
    # Generate JWT secret if not provided
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 32)
        print_info "Generated JWT_SECRET"
    fi
    
    railway variables set NODE_ENV=production
    railway variables set JWT_SECRET="$JWT_SECRET"
    railway variables set JWT_EXPIRES_IN=7d
    railway variables set PORT=3000
    
    print_success "Environment variables set"
}

# Deploy to Railway
deploy() {
    print_info "Deploying to Railway..."
    railway up
    print_success "Deployment initiated"
}

# Show deployment info
show_info() {
    echo
    print_success "Deployment completed!"
    echo
    echo "Your backend is now deployed to Railway!"
    echo
    echo "Next steps:"
    echo "1. Check deployment status: railway status"
    echo "2. View logs: railway logs"
    echo "3. Get your app URL: railway domain"
    echo "4. Update your frontend VITE_API_URL with the Railway URL"
    echo
    echo "Useful commands:"
    echo "- railway logs --follow  # Follow logs in real-time"
    echo "- railway shell          # Access your app's shell"
    echo "- railway variables      # View environment variables"
    echo
}

# Main deployment function
main() {
    print_info "Starting Railway deployment process..."
    
    check_railway_cli
    check_branch
    railway_login
    setup_project
    add_database
    set_env_vars
    deploy
    show_info
}

# Run main function
main "$@"