#!/bin/bash

echo "🚀 Starting Military Management App with Mock Data Support..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Set environment variables for mock data
export ENABLE_MOCK_DATA=true
export NODE_ENV=development

# Try to start backend in background (optional)
echo "🔧 Attempting to start backend server..."
if command -v bun &> /dev/null; then
    echo "✅ Starting backend with Bun..."
    bun run backend/index.ts &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
elif command -v npx &> /dev/null && npx ts-node --version &> /dev/null; then
    echo "✅ Starting backend with ts-node..."
    npx ts-node backend/index.ts &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
else
    echo "⚠️  Backend runtime not found (Bun or ts-node)"
    echo "📱 App will run with mock data only"
    BACKEND_PID=""
fi

# Wait a moment for backend to start
sleep 2

# Start the Expo app
echo "📱 Starting Expo app..."
if command -v bunx &> /dev/null; then
    bunx rork start -p jwjevnxtm1q2kz7xwsgmz --tunnel
elif command -v npx &> /dev/null; then
    npx expo start --tunnel
else
    echo "❌ Neither bunx nor npx found!"
    exit 1
fi

# Cleanup function
cleanup() {
    echo "🔄 Shutting down..."
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for the process to finish
wait