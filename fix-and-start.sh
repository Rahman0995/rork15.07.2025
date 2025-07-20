#!/bin/bash

echo "🔧 Fixing file watcher limits and starting development environment..."

# Clean up caches
echo "🧹 Cleaning caches..."
rm -rf node_modules/.cache 2>/dev/null
rm -rf .expo 2>/dev/null  
rm -rf .metro 2>/dev/null
rm -rf /tmp/metro-* 2>/dev/null

# Set environment variables to solve ENOSPC issue
export WATCHMAN_DISABLE_WATCH=1
export EXPO_NO_DOTENV=1
export EXPO_NO_CACHE=1

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "expo start" || true
pkill -f "ts-node" || true
pkill -f "node.*backend" || true

# Wait a moment
sleep 2

echo "🚀 Starting development environment..."

# Start the development environment
node start-dev.js