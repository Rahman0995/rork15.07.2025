#!/bin/bash

echo "🚀 Quick Railway Deploy"
echo "======================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Railway CLI"
        exit 1
    fi
fi

echo "✅ Railway CLI ready"

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    railway login
fi

# Check if project is linked
if ! railway status &> /dev/null; then
    echo "🔗 Please link your Railway project:"
    railway link
fi

echo "🚀 Starting deployment..."
railway up --detach

if [ $? -eq 0 ]; then
    echo "✅ Deployment started successfully!"
    echo "🔗 Check status: railway status"
    echo "📋 View logs: railway logs"
    echo "🌐 Open app: railway open"
else
    echo "❌ Deployment failed"
    echo "📋 Check logs: railway logs"
    exit 1
fi