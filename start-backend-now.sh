#!/bin/bash

echo "🔍 Killing any processes using port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "✅ Port 3000 is free"

echo "🚀 Starting backend server..."
cd "$(dirname "$0")"

# Set environment variables
export NODE_ENV=development
export PORT=3000
export HOST=0.0.0.0
export USE_SQLITE=true
export DATABASE_URL="sqlite:///tmp/rork_app.sqlite"

# Start the backend
npx tsx backend/index.ts