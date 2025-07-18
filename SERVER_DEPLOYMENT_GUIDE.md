# Server Deployment Guide

## Recommended Hosting Options

### 1. Railway (Recommended for beginners)
- **Pros**: Easy setup, automatic deployments, good free tier
- **Cons**: Limited free tier hours
- **Setup**: 
  1. Connect your GitHub repo to Railway
  2. Deploy using `railway.json` configuration
  3. Set environment variables in Railway dashboard

### 2. Render (Good alternative)
- **Pros**: Generous free tier, easy setup
- **Cons**: Slower cold starts on free tier
- **Setup**:
  1. Connect your GitHub repo to Render
  2. Deploy using `render.yaml` configuration
  3. Set environment variables in Render dashboard

### 3. Vercel (For web frontend only)
- **Pros**: Excellent for static sites, fast CDN
- **Cons**: Backend requires separate hosting
- **Setup**: Deploy frontend only, backend needs separate service

### 4. DigitalOcean App Platform
- **Pros**: Reliable, good performance
- **Cons**: No free tier
- **Setup**: Similar to Railway/Render but paid

## Current Configuration

Your app is configured for:
- **Frontend**: React Native Web (Expo)
- **Backend**: Node.js with Hono and tRPC
- **Database**: PostgreSQL (or SQLite for development)

## Environment Variables Needed

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
EXPO_PUBLIC_BASE_URL=https://your-backend-url.com
```

### Backend (.env)
```
NODE_ENV=production
DATABASE_URL=your-database-connection-string
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://your-frontend-url.com
PORT=3000
```

## Deployment Steps

1. **Choose a hosting provider** (Railway recommended)
2. **Connect your GitHub repository**
3. **Set environment variables**
4. **Deploy using the provided configuration files**
5. **Update your app.config.js** with the production URLs

## Troubleshooting

If you get build errors:
1. Check that all environment variables are set
2. Verify the Dockerfile is using the correct build commands
3. Check the logs for specific error messages
4. Try deploying the backend and frontend separately

## Current Build Configuration

- Uses `Dockerfile.web.simple` for frontend
- Uses `Dockerfile.backend` for backend
- Configured for Railway and Render deployment