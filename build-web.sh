#!/bin/bash

# Web build script for deployment
echo "🔨 Building web application..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Run prebuild
echo "🔧 Running prebuild..."
bunx expo prebuild --clean --platform web

# Export web build
echo "📦 Exporting web build..."
bunx expo export --platform web

echo "✅ Build completed successfully!"
echo "📁 Build output is in the 'dist' directory"