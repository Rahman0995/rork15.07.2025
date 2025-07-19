#!/bin/bash

# Production Deployment Script for Military Management System

set -e

echo "🚀 Starting production deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "Please copy .env.production.example to .env.production and configure it."
    exit 1
fi

# Load production environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo "✅ Environment variables loaded"

# Validate required environment variables
required_vars=("DATABASE_URL" "JWT_SECRET" "NODE_ENV")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Required environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
bun install --production

# Build the application
echo "🔨 Building application..."
bun run backend:build

# Test database connection
echo "🔍 Testing database connection..."
node -e "
const mysql = require('mysql2/promise');
const config = require('./backend/config').config;

async function testConnection() {
  try {
    const connection = await mysql.createConnection(config.database.url);
    await connection.execute('SELECT 1');
    await connection.end();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
"

# Initialize database
echo "🗄️ Initializing database..."
node -e "
const { initializeDatabase } = require('./backend/database');

initializeDatabase().then((success) => {
  if (success) {
    console.log('✅ Database initialized successfully');
    process.exit(0);
  } else {
    console.error('❌ Database initialization failed');
    process.exit(1);
  }
});
"

# Start the production server
echo "🌟 Starting production server..."
echo "Server will be available at http://localhost:${API_PORT:-3000}"
echo "Health check: http://localhost:${API_PORT:-3000}/api/health"

# Use PM2 if available, otherwise use node directly
if command -v pm2 &> /dev/null; then
    echo "Using PM2 for process management..."
    pm2 start backend/index.js --name "military-management-api" --env production
    pm2 save
    echo "✅ Application started with PM2"
    echo "Use 'pm2 logs military-management-api' to view logs"
    echo "Use 'pm2 stop military-management-api' to stop the application"
else
    echo "PM2 not found, starting with node..."
    NODE_ENV=production node backend/index.js
fi

echo "🎉 Production deployment completed!"