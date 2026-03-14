# Vercel Deployment Fix - CoreInventory

## Issue Resolution

The Vercel build was failing because it was trying to build from the `main` branch, which contains only documentation and setup files.

## ✅ Solution Implemented

### 1. Fixed Branch Structure
- **`main` branch**: Documentation and project overview
- **`frontend` branch**: Complete frontend application with Vercel config
- **`backend` branch**: Complete backend API

### 2. Vercel Configuration Added
- Added `vercel.json` to `frontend` branch
- Configured proper build commands and output directory
- Made API URL configurable via environment variables

### 3. Environment Configuration
- Added `VITE_API_URL` environment variable support
- Created `.env.example` for development
- Configured production environment handling

## 🚀 How to Deploy

### For Vercel (Frontend):
1. **Important**: Deploy from `frontend` branch, not `main`
2. In Vercel dashboard:
   - Import repository
   - Select `frontend` branch
   - Add environment variable: `VITE_API_URL` = your backend URL
   - Deploy

### For Backend:
1. Deploy from `backend` branch to Heroku/Railway/Render
2. Set up PostgreSQL database
3. Configure environment variables

## 📁 Repository Structure

```
main branch (documentation only)
├── README.md
├── DEPLOYMENT.md
├── PRODUCTION-CHECKLIST.md
└── setup files...

frontend branch (deploy this to Vercel)
├── frontend/blueprint-canvas-engine-main/
├── vercel.json
├── VERCEL-DEPLOYMENT.md
└── package.json (frontend build scripts)

backend branch (deploy this to Heroku/etc)
├── backend/
├── Dockerfile
└── package.json (backend build scripts)
```

## 🔧 Build Commands Fixed

**Before (failing):**
```json
"build": "npm run build:backend && npm run build:frontend"
```

**After (working):**
```json
"build": "cd frontend/blueprint-canvas-engine-main && npm ci && npm run build"
```

## 🌐 Environment Variables

Set in Vercel dashboard:
- `VITE_API_URL`: Your deployed backend API URL (e.g., `https://your-app.herokuapp.com/api`)

## ✅ Next Steps

1. **Deploy Backend First**: Use `backend` branch
2. **Deploy Frontend**: Use `frontend` branch with the backend URL
3. **Configure CORS**: Update backend to allow Vercel domain

The build should now work correctly on Vercel! 🎉