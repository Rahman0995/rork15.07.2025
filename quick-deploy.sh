#!/bin/bash

echo "🚀 Quick Deploy Setup"
echo "===================="

# Make scripts executable
chmod +x deploy-now.js
chmod +x deploy-to-railway-web.js
chmod +x deploy-to-render.js
chmod +x deploy-to-vercel.js

echo "✅ Made scripts executable"
echo ""
echo "🎯 Choose your hosting platform:"
echo ""
echo "1. 🚂 Railway (RECOMMENDED - you have MySQL there)"
echo "   node deploy-now.js"
echo ""
echo "2. 🎨 Render (Free tier with PostgreSQL)"
echo "   node deploy-to-render.js"
echo ""
echo "3. ⚡ Vercel (Great for frontend + serverless)"
echo "   node deploy-to-vercel.js"
echo ""
echo "💡 For Railway (easiest):"
echo "   1. Run: node deploy-now.js"
echo "   2. Go to railway.app"
echo "   3. Deploy from GitHub"
echo "   4. Done! 🎉"