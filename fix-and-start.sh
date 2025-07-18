#!/bin/bash

echo "🔧 Starting comprehensive fix process..."

# Step 1: Fix build issues
echo "Step 1: Fixing import.meta and other build issues..."
node fix-build-issues.js

# Step 2: Clear all caches
echo "Step 2: Clearing caches..."
bash clear-cache-and-restart.sh

# Step 3: Check TypeScript
echo "Step 3: Checking TypeScript..."
npx tsc --noEmit --skipLibCheck

# Step 4: Start with clean cache
echo "Step 4: Starting Expo with clean cache..."
echo "✅ All fixes applied!"
echo ""
echo "Now run one of these commands:"
echo "  npx expo start -c          # Start with clean cache"
echo "  npx expo start -c --web    # Start web version"
echo "  npx expo start -c --tunnel # Start with tunnel"