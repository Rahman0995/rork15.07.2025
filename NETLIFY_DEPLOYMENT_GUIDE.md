# Netlify Deployment Guide

## Quick Setup

1. **Prepare for deployment:**
   ```bash
   node deploy-netlify.js
   ```

2. **Go to Netlify:**
   - Visit https://netlify.com
   - Sign in with GitHub
   - Click "New site from Git"
   - Select your repository

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

4. **Environment variables (optional):**
   - `EXPO_PUBLIC_API_URL`: Your backend API URL

## Manual Setup

If you prefer manual setup:

1. **Update package.json:**
   ```bash
   cp package-netlify.json package.json
   ```

2. **Update app config:**
   ```bash
   cp app.config.netlify.js app.config.js
   ```

3. **Update API URL:**
   Edit `app.config.js` and replace `https://your-backend-url.com/api` with your actual backend URL.

## Troubleshooting

### Build Fails
- Make sure Node version is set to 18 in Netlify settings
- Check that all dependencies are in package.json
- Verify app.config.js is valid

### App Loads but API Doesn't Work
- Update the API URL in app.config.js
- Make sure your backend is deployed and accessible
- Check CORS settings on your backend

### Routing Issues
- The netlify.toml file handles SPA routing
- All routes redirect to index.html

## Alternative Hosting Options

If Netlify doesn't work, try:
- **Vercel**: `node deploy-to-vercel.js`
- **Railway**: `node deploy-railway.js`
- **Render**: `node deploy-to-render.js`

## Backend Deployment

For the backend, consider:
- **Railway**: Best for full-stack apps with database
- **Render**: Good free tier
- **Heroku**: Reliable but paid
- **Vercel**: Good for serverless functions