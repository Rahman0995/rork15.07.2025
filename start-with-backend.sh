#!/bin/bash

echo "🚀 Starting Military Management System with Backend..."

# Kill any existing processes on port 3000
echo "🔄 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend in background
echo "🔧 Starting backend server..."
node start-backend-simple.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Backend is running successfully!"
else
    echo "⚠️  Backend might not be ready yet, but continuing..."
fi

# Start the Expo app
echo "📱 Starting Expo app..."
npm run start

# Cleanup on exit
trap "echo '🔄 Shutting down...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM