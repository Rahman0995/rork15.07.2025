#!/bin/bash

echo "🚀 Starting Military Management System Backend..."

# Set environment variables
export NODE_ENV=development
export API_PORT=3000
export API_HOST=0.0.0.0

# Start the backend server
echo "📍 Starting backend on http://0.0.0.0:3000"
echo "🔗 API will be available at http://localhost:3000/api"
echo "💚 Health check: http://localhost:3000/api/health"
echo ""

bun run backend/index.ts