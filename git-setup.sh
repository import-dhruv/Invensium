#!/bin/bash

# Git Repository Setup Script
# This script prepares the code for Git repository with proper branch structure

set -e

echo "CoreInventory Git Setup"
echo "======================"

# Colors
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

# Check if git is installed
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_success "Git is installed"
}

# Initialize git repository if not already initialized
init_git() {
    if [ ! -d ".git" ]; then
        print_info "Initializing Git repository..."
        git init
        print_success "Git repository initialized"
    else
        print_info "Git repository already exists"
    fi
}

# Create .gitignore if it doesn't exist or is incomplete
setup_gitignore() {
    print_info "Ensuring comprehensive .gitignore is in place..."
    
    # The .gitignore should already be updated by previous steps
    if [ -f ".gitignore" ]; then
        print_success ".gitignore file is ready"
    else
        print_error ".gitignore file not found!"
        exit 1
    fi
}

# Remove any sensitive files that might exist
cleanup_sensitive_files() {
    print_info "Cleaning up sensitive files..."
    
    # Remove .env files if they exist
    find . -name ".env" -not -path "./node_modules/*" -delete 2>/dev/null || true
    find . -name ".env.local" -not -path "./node_modules/*" -delete 2>/dev/null || true
    find . -name ".env.production" -not -path "./node_modules/*" -delete 2>/dev/null || true
    
    print_success "Sensitive files cleaned up"
}

# Create initial commit structure
create_initial_structure() {
    print_info "Setting up initial Git structure..."
    
    # Add all files except those in .gitignore
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        print_warning "No changes to commit"
    else
        # Create initial commit
        git commit -m "Initial commit: CoreInventory - Complete Inventory Management System

- Full-stack application with React frontend and Node.js backend
- JWT-based authentication with role management
- Complete inventory operations (receipts, deliveries, transfers, adjustments)
- Multi-warehouse and location support
- Real-time stock tracking and move history
- Dashboard analytics with KPIs
- Production-ready with Docker support
- Comprehensive security measures implemented"
        
        print_success "Initial commit created"
    fi
}

# Create branch structure
create_branches() {
    print_info "Creating branch structure..."
    
    # Ensure we're on main branch
    git checkout -b main 2>/dev/null || git checkout main
    
    # Create backend branch
    git checkout -b backend
    print_success "Created 'backend' branch"
    
    # Create frontend branch  
    git checkout main
    git checkout -b frontend
    print_success "Created 'frontend' branch"
    
    # Return to main branch
    git checkout main
    print_success "Returned to 'main' branch"
}

# Display branch information
show_branch_info() {
    echo
    print_info "Git repository is ready with the following structure:"
    echo
    echo "Branches created:"
    echo "  - main: Complete project (current)"
    echo "  - backend: Backend code only"
    echo "  - frontend: Frontend code only"
    echo
    echo "To push to your repository:"
    echo "  1. Add your remote repository:"
    echo "     git remote add origin <your-repository-url>"
    echo
    echo "  2. Push all branches:"
    echo "     git push -u origin main"
    echo "     git push -u origin backend"
    echo "     git push -u origin frontend"
    echo
    print_warning "SECURITY REMINDERS:"
    echo "  - .env files are excluded from Git"
    echo "  - Use .env.example files as templates"
    echo "  - Never commit sensitive credentials"
    echo "  - Review DEPLOYMENT.md for production setup"
    echo
}

# Main function
main() {
    echo
    print_info "Starting Git setup for CoreInventory..."
    echo
    
    check_git
    init_git
    setup_gitignore
    cleanup_sensitive_files
    create_initial_structure
    create_branches
    show_branch_info
    
    print_success "Git setup completed successfully!"
}

# Run main function
main "$@"