#!/bin/bash

echo "🚀 Starting development environment..."

# Increase file watcher limit
echo "📁 Increasing file watcher limit..."
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
bun run index.ts &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd ..
expo start --tunnel

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT