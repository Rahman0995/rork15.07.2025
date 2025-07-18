#!/bin/bash

echo "🔧 Military Management System - Fix and Start"
echo "=============================================="

# Make scripts executable
chmod +x run-backend.sh
chmod +x diagnose-network.js
chmod +x test-backend-connection.js

# Run network diagnostics
echo "🔍 Running network diagnostics..."
node diagnose-network.js

echo ""
echo "🚀 Starting backend server..."
echo "Press Ctrl+C to stop"
echo ""

# Start the backend
./run-backend.sh