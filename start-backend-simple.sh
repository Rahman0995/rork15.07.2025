#!/bin/bash

echo "🚀 Starting backend server..."

# Set environment variables
export NODE_ENV=development
export API_PORT=3000
export API_HOST=0.0.0.0

# Navigate to backend directory
cd /home/user/rork-app/backend

# Start the server
echo "🔧 Starting server on http://0.0.0.0:3000"
echo "📡 tRPC endpoint: http://0.0.0.0:3000/api/trpc"
echo "❤️ Health check: http://0.0.0.0:3000/api/health"

bun run index.ts