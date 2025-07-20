#!/bin/bash

echo "🔧 Making Railway scripts executable..."

chmod +x deploy-railway-fixed.js
chmod +x test-railway-deploy.js

echo "✅ Scripts are now executable"
echo ""
echo "🚀 Next steps:"
echo "1. Install Railway CLI: npm install -g @railway/cli"
echo "2. Login to Railway: railway login"
echo "3. Link project: railway link"
echo "4. Test setup: node test-railway-deploy.js"
echo "5. Deploy: node deploy-railway-fixed.js"