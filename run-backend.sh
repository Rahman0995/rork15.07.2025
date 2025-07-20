#!/bin/bash

echo "🚀 Starting backend server..."

# Check if bun is available
if command -v bun &> /dev/null; then
    echo "📦 Using Bun runtime"
    cd backend && bun run index.ts
elif command -v node &> /dev/null; then
    echo "📦 Using Node.js runtime"
    node start-backend-node.js
else
    echo "❌ Neither Bun nor Node.js found!"
    echo "Please install Node.js or Bun to run the backend"
    exit 1
fi