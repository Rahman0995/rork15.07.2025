#!/bin/bash

# Deployment script for Military Management App

set -e

echo "🚀 Starting deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Load environment variables
if [ -f .env.production ]; then
    echo "📋 Loading production environment variables..."
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "⚠️  .env.production file not found. Using default values."
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check backend health
echo "🔍 Checking backend health..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    docker-compose logs backend
    exit 1
fi

# Check web frontend
echo "🔍 Checking web frontend..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Web frontend is accessible"
else
    echo "❌ Web frontend is not accessible"
    docker-compose logs web
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Your app is now running:"
echo "   Web: http://localhost"
echo "   API: http://localhost:3000/api"
echo "   Health: http://localhost:3000/api/health"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"