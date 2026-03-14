# Git Repository Setup Instructions

## Overview
This guide will help you set up the CoreInventory project in a Git repository with proper branch structure and security measures.

## Branch Structure
- **main**: Complete project with all components
- **backend**: Backend code only (Node.js/Express/Prisma)
- **frontend**: Frontend code only (React/TypeScript/Vite)

## Security Measures Implemented
- All sensitive files (.env) are excluded from Git
- Comprehensive .gitignore file
- Production-ready configuration templates
- Security best practices documented

## Step-by-Step Setup

### 1. Prepare the Repository
```bash
# Run the automated Git setup script
./git-setup.sh
```

This script will:
- Initialize Git repository
- Clean up sensitive files
- Create initial commit
- Set up branch structure

### 2. Add Your Remote Repository
```bash
# Replace <your-repository-url> with your actual repository URL
git remote add origin <your-repository-url>
```

### 3. Push All Branches
```bash
# Push main branch (complete project)
git push -u origin main

# Push backend branch
git push -u origin backend

# Push frontend branch  
git push -u origin frontend
```

## Manual Branch Setup (Alternative)

If you prefer to set up branches manually:

### 1. Create and Push Main Branch
```bash
git init
git add .
git commit -m "Initial commit: CoreInventory complete project"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

### 2. Create Backend Branch
```bash
git checkout -b backend
# Remove frontend directory
rm -rf frontend/
git add .
git commit -m "Backend: Node.js/Express/Prisma inventory management API"
git push -u origin backend
```

### 3. Create Frontend Branch
```bash
git checkout main
git checkout -b frontend
# Remove backend directory
rm -rf backend/
# Keep only frontend code
git add .
git commit -m "Frontend: React/TypeScript inventory management UI"
git push -u origin frontend
```

### 4. Return to Main Branch
```bash
git checkout main
```

## Repository Structure

### Main Branch Contents
```
├── backend/                 # Node.js backend
├── frontend/               # React frontend
├── docker-compose.yml      # Docker orchestration
├── ecosystem.config.js     # PM2 configuration
├── setup.sh               # Development setup
├── git-setup.sh           # Git preparation
├── DEPLOYMENT.md          # Production deployment guide
├── PRODUCTION-CHECKLIST.md # Production readiness
├── README.md              # Project documentation
└── .gitignore             # Git ignore rules
```

### Backend Branch Contents
```
├── src/                   # Source code
├── prisma/               # Database schema and migrations
├── package.json          # Dependencies and scripts
├── Dockerfile           # Docker configuration
├── tsconfig.json        # TypeScript configuration
└── .env.example         # Environment template
```

### Frontend Branch Contents
```
├── src/                  # React source code
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── Dockerfile          # Docker configuration
├── nginx.conf          # Nginx configuration
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## Security Considerations

### Files Excluded from Git
- `.env` files (all variants)
- `node_modules/`
- Build outputs (`dist/`, `build/`)
- Log files
- Database files
- IDE configuration files

### Environment Variables
Use the provided templates:
- `.env.example` - Development template
- `.env.production.example` - Production template

### Production Deployment
1. Review `DEPLOYMENT.md` for complete production setup
2. Follow `PRODUCTION-CHECKLIST.md` for security verification
3. Never commit sensitive credentials
4. Use environment variable management tools in production

## Verification

After pushing to your repository, verify:

1. **Main branch** contains the complete project
2. **Backend branch** contains only backend code
3. **Frontend branch** contains only frontend code
4. No `.env` files are committed
5. All sensitive information is excluded

## Next Steps

1. Set up CI/CD pipelines for each branch
2. Configure environment-specific deployments
3. Set up monitoring and alerting
4. Review security configurations
5. Test deployment procedures

## Troubleshooting

### Common Issues

**Large file warnings:**
```bash
# If you get warnings about large files
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch node_modules/*' --prune-empty --tag-name-filter cat -- --all
```

**Sensitive data accidentally committed:**
```bash
# Remove sensitive files from Git history
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
```

**Branch synchronization:**
```bash
# Keep branches in sync with main
git checkout backend
git merge main
git push origin backend
```

## Support

For issues with:
- **Development setup**: Check `README.md`
- **Production deployment**: Review `DEPLOYMENT.md`
- **Security concerns**: Follow `PRODUCTION-CHECKLIST.md`
- **Git operations**: Refer to this document