# Deployment Fix Guide

## Issues Fixed

1. **better-sqlite3 compilation error** - Native dependency requiring Python/build tools
2. **Invalid project root error** - Using deprecated `expo build` command
3. **Missing Python** - Required for native dependencies

## Solutions

### Option 1: Use Fixed Dockerfile (Recommended)

Use the new `Dockerfile.web.simple.fixed` which removes native dependencies:

```bash
# Build with the fixed Dockerfile
docker build -f Dockerfile.web.simple.fixed -t your-app-web .
docker run -p 80:80 your-app-web
```

### Option 2: Use Fixed Build Script

```bash
# Make the script executable
chmod +x build-web-fixed.sh

# Run the build
./build-web-fixed.sh
```

### Option 3: Manual Commands

```bash
# Clean previous builds
rm -rf dist/ build/ .expo/

# Set environment
export NODE_ENV=production
export EXPO_USE_FAST_RESOLVER=1

# Prebuild for web
bunx expo prebuild --clean --platform web

# Export web version (correct command)
bunx expo export --platform web

# Serve with nginx or any static server
```

## Key Changes Made

1. **Fixed build command**: Changed from `expo build` to `expo export --platform web`
2. **Removed native dependencies**: Created Dockerfile without better-sqlite3
3. **Added Python support**: For Dockerfiles that need native compilation
4. **Proper error handling**: Better build scripts with error checking

## Environment Variables

Make sure these are set in your deployment environment:

```bash
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://your-backend-url/api
EXPO_PUBLIC_BASE_URL=https://your-backend-url
```

## For Railway/Render/Vercel

Update your build command in the platform settings:

**Old (broken):**
```bash
bun run build
```

**New (working):**
```bash
bunx expo export --platform web
```

## Verification

After build, check that the `dist/` directory exists and contains:
- `index.html`
- `_expo/` directory with assets
- Static files for your app

The web app will be served from the `dist/` directory.