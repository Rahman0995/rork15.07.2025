#!/bin/bash

# Simple web build script
set -e

echo "🚀 Starting simple web build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/ build/ .expo/

# Set production environment
export NODE_ENV=production
export EXPO_USE_FAST_RESOLVER=1

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Export web version
echo "📦 Exporting web version..."
bunx expo export --platform web --output-dir dist

# Verify build output
echo "✅ Verifying build output..."
if [ -d "dist" ]; then
    echo "✅ Build successful! Output in dist/ directory"
    ls -la dist/
else
    echo "❌ Build failed - no dist directory found"
    exit 1
fi

echo "🎉 Web build completed successfully!"
echo "📁 You can now serve the dist/ directory with any web server"
echo "🌐 For example: cd dist && python3 -m http.server 8080"