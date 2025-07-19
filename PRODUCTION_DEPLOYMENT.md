# Production Deployment Guide

## Overview
This guide will help you deploy the Military Management System to production with a real MySQL database and proper configuration.

## Prerequisites

1. **Node.js & Bun**: Ensure you have Node.js 18+ and Bun installed
2. **MySQL Database**: A production MySQL database (Railway, PlanetScale, AWS RDS, etc.)
3. **Domain**: A domain name for your application (optional but recommended)

## Step 1: Database Setup

### Option A: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Add a MySQL database service
4. Copy the connection string from the Railway dashboard

### Option B: Other MySQL Providers
- **PlanetScale**: Create a database at [planetscale.com](https://planetscale.com)
- **AWS RDS**: Set up a MySQL instance on AWS
- **DigitalOcean**: Use their managed MySQL service

## Step 2: Environment Configuration

1. Copy the production environment template:
```bash
cp .env.production.example .env.production
```

2. Edit `.env.production` with your actual values:
```env
NODE_ENV=production

# Your actual database URL
DATABASE_URL=mysql://username:password@host:port/database

# Generate a strong JWT secret (use a password generator)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Your production domain(s)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Server configuration
API_PORT=3000
API_HOST=0.0.0.0

# Disable mock data in production
ENABLE_MOCK_DATA=false
```

## Step 3: Deploy Backend

### Option A: Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Option B: Manual Server Deployment
1. Upload your code to your server
2. Install dependencies:
```bash
bun install
```

3. Run the deployment script:
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

### Option C: Docker Deployment
1. Build the Docker image:
```bash
docker build -f Dockerfile.backend -t military-management-api .
```

2. Run the container:
```bash
docker run -d \
  --name military-management-api \
  -p 3000:3000 \
  --env-file .env.production \
  military-management-api
```

## Step 4: Frontend Configuration

Update your frontend environment variables to point to your production API:

```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-api-domain.com
```

## Step 5: Database Initialization

The backend will automatically:
1. Create all necessary tables
2. Set up indexes for performance
3. Insert default user data
4. Handle database migrations

## Step 6: Health Checks

After deployment, verify everything is working:

1. **API Health**: `GET https://your-api-domain.com/api/health`
2. **Database**: Check that tables are created and populated
3. **tRPC**: Test API endpoints via `https://your-api-domain.com/api/trpc`

## Step 7: Production Monitoring

### Recommended Tools:
- **PM2**: Process management for Node.js
- **Nginx**: Reverse proxy and load balancer
- **Let's Encrypt**: Free SSL certificates
- **Sentry**: Error tracking and monitoring

### PM2 Setup:
```bash
npm install -g pm2
pm2 start backend/index.js --name "military-api"
pm2 startup
pm2 save
```

### Nginx Configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Considerations

1. **JWT Secret**: Use a strong, random JWT secret
2. **CORS**: Configure CORS to only allow your frontend domain
3. **Rate Limiting**: The API includes built-in rate limiting
4. **HTTPS**: Always use HTTPS in production
5. **Database**: Use connection pooling and prepared statements
6. **Environment Variables**: Never commit secrets to version control

## Performance Optimization

1. **Database Indexes**: Already included in the schema
2. **Connection Pooling**: Configure MySQL connection pooling
3. **Caching**: Consider adding Redis for caching
4. **CDN**: Use a CDN for static assets

## Backup Strategy

1. **Database Backups**: Set up automated daily backups
2. **Code Backups**: Use Git with multiple remotes
3. **Environment Configs**: Store securely and separately

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**:
   - Check DATABASE_URL format
   - Verify database server is accessible
   - Check firewall settings

2. **CORS Errors**:
   - Update CORS_ORIGIN in .env.production
   - Ensure frontend URL matches exactly

3. **JWT Errors**:
   - Verify JWT_SECRET is set
   - Check token expiration settings

4. **Port Already in Use**:
   - Change API_PORT in .env.production
   - Kill existing processes on that port

### Logs:
```bash
# PM2 logs
pm2 logs military-api

# Docker logs
docker logs military-management-api

# Direct logs
tail -f /var/log/military-api.log
```

## Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test database connectivity
4. Check API health endpoint

The system includes comprehensive error handling and fallback mechanisms to ensure reliability in production.