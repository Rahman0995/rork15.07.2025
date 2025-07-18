#!/bin/bash

echo "🔧 Network Diagnostic and Fix Script"
echo "===================================="

# Make scripts executable
chmod +x find-network-info.js
chmod +x test-backend-simple.js

# Find network information
echo "📡 Finding network information..."
node find-network-info.js

echo ""
echo "🚀 Starting backend server..."

# Try to start backend in background
if command -v bun &> /dev/null; then
    echo "Using Bun to start backend..."
    bun run dev:backend &
    BACKEND_PID=$!
else
    echo "Using npm to start backend..."
    npm run dev:backend &
    BACKEND_PID=$!
fi

# Wait a moment for server to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend connectivity
echo "🔍 Testing backend connectivity..."
node test-backend-simple.js

echo ""
echo "📱 Now you can start the mobile app:"
echo "   npm start"
echo "   or"
echo "   bun start"

echo ""
echo "🛑 To stop the backend server, run:"
echo "   kill $BACKEND_PID"

# Keep script running
echo ""
echo "Press Ctrl+C to stop the backend server and exit..."
wait $BACKEND_PID