# CoreInventory Production Deployment Guide

## Security Checklist

### Environment Variables
1. **JWT_SECRET**: Generate a secure random key
   ```bash
   # Generate a secure JWT secret
   openssl rand -base64 32
   ```

2. **Database Credentials**: Use production database credentials
   ```env
   DATABASE_URL="postgresql://prod_user:secure_password@prod_host:5432/coreinventory"
   ```

3. **Environment Settings**:
   ```env
   NODE_ENV="production"
   PORT=3000
   JWT_EXPIRES_IN="7d"
   ```

### Database Setup

1. **Create Production Database**:
   ```sql
   CREATE DATABASE coreinventory;
   CREATE USER coreinventory_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE coreinventory TO coreinventory_user;
   ```

2. **Run Migrations**:
   ```bash
   cd backend
   npx prisma db push
   npm run prisma:seed  # Optional: for initial data
   ```

### Security Hardening

1. **CORS Configuration**: Update `backend/src/app.ts`
   ```typescript
   app.use(cors({
     origin: ['https://yourdomain.com'],
     credentials: true
   }));
   ```

2. **Rate Limiting**: Add rate limiting middleware
   ```bash
   npm install express-rate-limit
   ```

3. **Helmet**: Add security headers
   ```bash
   npm install helmet
   ```

4. **HTTPS**: Ensure HTTPS is enabled in production

### Docker Deployment

1. **Backend Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npx prisma generate
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Frontend Dockerfile**:
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **Docker Compose**:
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       environment:
         - DATABASE_URL=${DATABASE_URL}
         - JWT_SECRET=${JWT_SECRET}
         - NODE_ENV=production
       ports:
         - "3000:3000"
     
     frontend:
       build: ./frontend/blueprint-canvas-engine-main
       ports:
         - "80:80"
     
     postgres:
       image: postgres:15
       environment:
         - POSTGRES_DB=coreinventory
         - POSTGRES_USER=${DB_USER}
         - POSTGRES_PASSWORD=${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

### Environment-Specific Configurations

#### Development
```env
NODE_ENV="development"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coreinventory_dev"
JWT_SECRET="dev-secret-key"
```

#### Staging
```env
NODE_ENV="staging"
DATABASE_URL="postgresql://staging_user:staging_pass@staging_host:5432/coreinventory_staging"
JWT_SECRET="staging-secret-key"
```

#### Production
```env
NODE_ENV="production"
DATABASE_URL="postgresql://prod_user:prod_pass@prod_host:5432/coreinventory"
JWT_SECRET="production-secret-key-256-bits"
```

### Monitoring and Logging

1. **Application Logging**:
   ```bash
   npm install winston
   ```

2. **Health Checks**: Already implemented at `/api/health`

3. **Database Monitoring**: Monitor connection pool and query performance

### Backup Strategy

1. **Database Backups**:
   ```bash
   # Daily backup script
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

2. **File Backups**: Backup uploaded files if any

### Performance Optimization

1. **Database Indexing**: Already optimized in Prisma schema
2. **Connection Pooling**: Configure Prisma connection pool
3. **Caching**: Consider Redis for session storage
4. **CDN**: Use CDN for static assets

### Deployment Steps

1. **Prepare Environment**:
   ```bash
   # Copy environment template
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Build Applications**:
   ```bash
   # Backend
   cd backend
   npm ci
   npm run build
   
   # Frontend
   cd ../frontend/blueprint-canvas-engine-main
   npm ci
   npm run build
   ```

3. **Database Setup**:
   ```bash
   cd backend
   npx prisma db push
   npm run prisma:seed  # Optional
   ```

4. **Start Services**:
   ```bash
   # Using PM2 for process management
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

### Troubleshooting

1. **Database Connection Issues**:
   - Check DATABASE_URL format
   - Verify database server is running
   - Check firewall settings

2. **JWT Issues**:
   - Ensure JWT_SECRET is set
   - Check token expiration settings

3. **CORS Issues**:
   - Verify frontend domain in CORS settings
   - Check protocol (HTTP vs HTTPS)

### Security Best Practices

1. **Never commit .env files**
2. **Use environment variable management**
3. **Regular security updates**
4. **Monitor for vulnerabilities**
5. **Implement proper logging**
6. **Use HTTPS in production**
7. **Regular database backups**
8. **Monitor application performance**