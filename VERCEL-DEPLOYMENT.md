# Vercel Deployment Guide - CoreInventory Frontend

This guide explains how to deploy the CoreInventory frontend to Vercel.

## Important: Deploy from Frontend Branch

**Deploy from the `frontend` branch, not `main`!**

The repository structure:
- `main` branch: Documentation and setup files only
- `frontend` branch: Frontend application code
- `backend` branch: Backend API code

## Prerequisites

1. **Backend Deployment**: Deploy the backend first using the `backend` branch
2. **Database**: Set up PostgreSQL database

## Step 1: Deploy Backend First

Use the `backend` branch to deploy your API:

```bash
# Clone the backend branch
git clone -b backend https://github.com/import-dhruv/Invensium.git backend-deploy
cd backend-deploy

# Deploy to Heroku (example)
heroku create your-app-name-backend
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
git push heroku HEAD:main
```

## Step 2: Deploy Frontend to Vercel

### Option A: Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. **Important**: Select `frontend` branch (not main)
4. Vercel will auto-detect the configuration from `vercel.json`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-backend-app.herokuapp.com/api`
6. Deploy

### Option B: Vercel CLI
```bash
# Clone frontend branch
git clone -b frontend https://github.com/import-dhruv/Invensium.git frontend-deploy
cd frontend-deploy

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Step 3: Configure Environment Variables

In Vercel dashboard, add:
- **Name**: `VITE_API_URL`
- **Value**: `https://your-backend-url.com/api`

## Step 4: Update Backend CORS

Update your backend to allow requests from Vercel:

```typescript
// In backend app.ts
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://your-vercel-app.vercel.app'
  ],
  credentials: true
}));
```

## Troubleshooting

### Build Fails on Vercel
- Ensure you're deploying from `frontend` branch
- Check that `vercel.json` exists in the branch
- Verify Node.js version compatibility

### API Connection Issues
- Check `VITE_API_URL` environment variable
- Verify backend is deployed and accessible
- Check CORS configuration

## Production URLs

After deployment:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.herokuapp.com`

## Quick Deploy Commands

```bash
# For backend (deploy to Heroku/Railway/etc)
git clone -b backend https://github.com/import-dhruv/Invensium.git
cd Invensium
# Follow your hosting service deployment steps

# For frontend (deploy to Vercel)
# Use Vercel dashboard and select 'frontend' branch
```

Remember: Always deploy backend first, then configure frontend with the backend URL!