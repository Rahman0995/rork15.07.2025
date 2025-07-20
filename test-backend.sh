#!/bin/bash

echo "🧪 Testing backend server..."

# Set development environment
export NODE_ENV=development

# Start backend
echo "🔧 Starting backend on port 3000..."
cd backend
bun run index.ts