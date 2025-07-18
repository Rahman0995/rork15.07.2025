# Deployment Guide

## Quick Fix for Current Build Issue

The build is failing because `expo build` is deprecated. Here are the solutions:

### Option 1: Use Docker (Recommended)
Your Dockerfile.web is already correctly configured. Use it directly:

```bash
# Build the Docker image
docker build -f Dockerfile.web -t military-app-web .

# Run the container
docker run -p 80:80 military-app-web
```

### Option 2: Manual Build
Run the correct build command directly:

```bash
# Install dependencies
bun install

# Clean and prebuild
bunx expo prebuild --clean

# Export web build
bunx expo export --platform web
```

### Option 3: Use Custom Build Script
```bash
# Make the script executable
chmod +x build.sh

# Run the build
./build.sh
```

## Platform-Specific Deployment

### Railway
1. Use the provided `railway.json` configuration
2. Set environment variables in Railway dashboard
3. Deploy using Dockerfile.web

### Render
1. Use the provided `render.yaml` configuration
2. Connect your GitHub repository
3. Render will automatically use the Docker configuration

### Vercel
For Vercel, you need to build statically:
```bash
bunx expo export --platform web
```
Then deploy the `dist` folder.

## Environment Variables

Make sure to set these environment variables in your deployment platform:

- `EXPO_PUBLIC_API_URL`: Your backend API URL
- `EXPO_PUBLIC_BASE_URL`: Your app base URL
- `NODE_ENV`: production

## Troubleshooting

If you're still getting the "Invalid project root: /app/build" error:

1. Make sure you're not running `expo build` (deprecated)
2. Use `expo export --platform web` instead
3. Check that your deployment platform is using the correct Dockerfile
4. Verify the working directory in your deployment configuration

## Server Recommendations

For production deployment, I recommend:

1. **Railway** - Easy Docker deployment, good for full-stack apps
2. **Render** - Free tier available, good Docker support
3. **Vercel** - Great for static web apps (frontend only)
4. **DigitalOcean App Platform** - Good for Docker deployments

Choose Railway or Render if you want to deploy both frontend and backend together.