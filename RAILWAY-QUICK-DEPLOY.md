# 🚂 Quick Railway Deployment - CoreInventory Backend

## 🚀 One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/your-template-id)

## 📋 Manual Deploy Steps

### 1. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. **Choose `backend` branch** (important!)

### 2. Add Database
1. Click "New Service" → "Database" → "PostgreSQL"
2. Railway auto-generates `DATABASE_URL`

### 3. Set Environment Variables
```env
NODE_ENV=production
JWT_SECRET=your-generated-secret-here
JWT_EXPIRES_IN=7d
PORT=3000
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### 4. Deploy
- Railway automatically detects configuration
- Build and deploy happens automatically
- Get your URL: `https://your-app.up.railway.app`

## ✅ What's Configured

- ✅ `railway.toml` - Railway configuration
- ✅ `nixpacks.toml` - Build configuration  
- ✅ Health check endpoint (`/api/health`)
- ✅ Auto database migrations
- ✅ CORS for Vercel domains
- ✅ Production-ready settings

## 🔗 After Deployment

1. **Note your Railway URL**: `https://your-app.up.railway.app`
2. **Update frontend**: Set `VITE_API_URL=https://your-app.up.railway.app/api`
3. **Test API**: Visit `https://your-app.up.railway.app/api/health`

## 🛠️ CLI Deployment (Alternative)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Run deployment script
./deploy-railway.sh
```

## 📊 Monitoring

- **Logs**: Railway dashboard → Your service → Deployments
- **Health**: `https://your-app.up.railway.app/api/health`
- **Database**: Railway dashboard → PostgreSQL service

## 💡 Tips

- Railway auto-deploys on push to `backend` branch
- Free tier: $5 credit monthly
- Pro plan: $20/month for production
- Zero-downtime deployments

Ready to deploy! 🚀