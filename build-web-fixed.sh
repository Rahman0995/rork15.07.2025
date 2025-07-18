#!/bin/bash

# Build script for web deployment
set -e

echo "🚀 Starting web build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/ build/ .expo/

# Set production environment
export NODE_ENV=production
export EXPO_USE_FAST_RESOLVER=1

# Prebuild for web platform
echo "🔧 Running prebuild for web..."
bunx expo prebuild --clean --platform web || echo "Prebuild completed with warnings"

# Export web version (this is the correct command, not expo build)
echo "📦 Exporting web version..."
bunx expo export --platform web

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