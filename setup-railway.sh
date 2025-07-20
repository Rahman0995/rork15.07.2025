#!/bin/bash

echo "🔧 Setting up Railway deployment..."

# Make scripts executable
chmod +x make-railway-scripts-executable.sh
chmod +x quick-railway-deploy.sh
chmod +x deploy-railway-fixed.js
chmod +x test-railway-deploy.js

echo "✅ All scripts are now executable"

# Install Railway CLI if not present
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    if [ $? -eq 0 ]; then
        echo "✅ Railway CLI installed"
    else
        echo "❌ Failed to install Railway CLI"
        echo "Please install manually: npm install -g @railway/cli"
    fi
else
    echo "✅ Railway CLI already installed"
fi

echo ""
echo "🚀 Railway setup complete!"
echo ""
echo "Next steps:"
echo "1. Login: railway login"
echo "2. Link project: railway link"
echo "3. Test: node test-railway-deploy.js"
echo "4. Deploy: ./quick-railway-deploy.sh"
echo ""
echo "Or use the automated script:"
echo "./quick-railway-deploy.sh"