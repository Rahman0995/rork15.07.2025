# Railway Deployment Fix Guide

## Problem
The deployment is failing because `better-sqlite3` (a native dependency) can't be compiled during the build process. Your app uses MySQL, so SQLite is not needed.

## Solution

### Step 1: Remove SQLite Dependencies
Run this script to remove unnecessary SQLite dependencies:

```bash
node remove-sqlite-deps.js
bun install
```

Or manually remove these lines from `package.json`:
- `"better-sqlite3": "^12.2.0",`
- `"@types/better-sqlite3": "^7.6.13",`

### Step 2: Use Fixed Dockerfile
The Railway configuration has been updated to use `Dockerfile.web.fixed` which properly handles native dependencies.

### Step 3: Deploy to Railway
1. Commit your changes:
```bash
git add .
git commit -m "Fix: Remove SQLite dependencies for web deployment"
git push
```

2. Railway will automatically redeploy using the fixed configuration.

## What the Fix Does

1. **Dockerfile.web.fixed**: 
   - Installs `node-gyp` and build tools
   - Handles native dependencies during build
   - Creates web-only build that doesn't need native deps at runtime

2. **Railway.json**: Updated to use the fixed Dockerfile

3. **Package.json cleanup**: Removes SQLite dependencies since you're using MySQL

## Alternative: Environment Variables
If you need to keep SQLite for local development, you can use environment-based conditional imports in your database code.

## Verification
After deployment, your app should:
- ✅ Build successfully on Railway
- ✅ Serve the web version via nginx
- ✅ Connect to your MySQL database for backend operations

## Troubleshooting
If you still get build errors:
1. Check Railway build logs for specific error messages
2. Ensure all environment variables are set in Railway dashboard
3. Verify your MySQL database connection string is correct