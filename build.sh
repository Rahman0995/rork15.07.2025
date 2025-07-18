#!/bin/bash

# Build script for web deployment
echo "🔨 Building web application..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Export web build
echo "📦 Exporting web build..."
bunx expo export --platform web

echo "✅ Build completed successfully!"
echo "📁 Build output is in the 'dist' directory"