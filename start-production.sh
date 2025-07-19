#!/bin/bash

# Production startup script for Military Management System

set -e

echo "🚀 Starting Military Management System in Production Mode..."

# Check if required files exist
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "Please copy .env.production.example to .env.production and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Validate required environment variables
required_vars=("DATABASE_URL" "JWT_SECRET" "NODE_ENV")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Choose deployment method
echo "Choose deployment method:"
echo "1) Docker Compose (Recommended)"
echo "2) Direct Node.js"
echo "3) PM2 Process Manager"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🐳 Starting with Docker Compose..."
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker first."
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            echo "❌ Docker Compose is not installed. Please install Docker Compose first."
            exit 1
        fi
        
        # Build and start services
        docker-compose -f docker-compose.production.yml up -d --build
        
        echo "✅ Services started with Docker Compose"
        echo "📊 Check status: docker-compose -f docker-compose.production.yml ps"
        echo "📋 View logs: docker-compose -f docker-compose.production.yml logs -f"
        echo "🛑 Stop services: docker-compose -f docker-compose.production.yml down"
        ;;
        
    2)
        echo "🟢 Starting with Direct Node.js..."
        
        # Install dependencies
        echo "📦 Installing dependencies..."
        bun install --production
        
        # Start the application
        echo "🌟 Starting application..."
        NODE_ENV=production bun backend/index.ts
        ;;
        
    3)
        echo "⚡ Starting with PM2..."
        
        # Check if PM2 is installed
        if ! command -v pm2 &> /dev/null; then
            echo "📦 Installing PM2..."
            npm install -g pm2
        fi
        
        # Install dependencies
        echo "📦 Installing dependencies..."
        bun install --production
        
        # Create PM2 ecosystem file
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'military-management-api',
    script: 'backend/index.ts',
    interpreter: 'bun',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      DATABASE_URL: '${DATABASE_URL}',
      JWT_SECRET: '${JWT_SECRET}',
      CORS_ORIGIN: '${CORS_ORIGIN}',
      API_PORT: '${API_PORT:-3000}',
      API_HOST: '${API_HOST:-0.0.0.0}'
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
        
        # Create logs directory
        mkdir -p logs
        
        # Start with PM2
        pm2 start ecosystem.config.js --env production
        pm2 save
        pm2 startup
        
        echo "✅ Application started with PM2"
        echo "📊 Check status: pm2 status"
        echo "📋 View logs: pm2 logs military-management-api"
        echo "🔄 Restart: pm2 restart military-management-api"
        echo "🛑 Stop: pm2 stop military-management-api"
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

# Wait a moment for services to start
sleep 5

# Health check
echo "🔍 Performing health check..."
if curl -f http://localhost:${API_PORT:-3000}/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed! API is running."
    echo "🌐 API URL: http://localhost:${API_PORT:-3000}/api"
    echo "❤️ Health Check: http://localhost:${API_PORT:-3000}/api/health"
    echo "📡 tRPC Endpoint: http://localhost:${API_PORT:-3000}/api/trpc"
else
    echo "❌ Health check failed. Please check the logs."
    exit 1
fi

echo "🎉 Production deployment completed successfully!"
echo ""
echo "📚 Next steps:"
echo "1. Configure your domain and SSL certificates"
echo "2. Set up monitoring and alerting"
echo "3. Configure automated backups"
echo "4. Update your frontend to use the production API URL"