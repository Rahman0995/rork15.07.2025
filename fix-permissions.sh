#!/bin/bash
# Make this script executable: chmod +x fix-permissions.sh

# Fix permissions and common React Native issues

echo "🔧 Fixing file permissions..."

# Fix app.json permissions
chmod 644 app.json
echo "✅ Fixed app.json permissions"

# Fix package.json permissions
chmod 644 package.json
echo "✅ Fixed package.json permissions"

# Fix tsconfig.json permissions
chmod 644 tsconfig.json
echo "✅ Fixed tsconfig.json permissions"

# Fix all TypeScript and JavaScript files
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs chmod 644
echo "✅ Fixed TypeScript/JavaScript file permissions"

# Fix directory permissions
find . -type d -exec chmod 755 {} \;
echo "✅ Fixed directory permissions"

# Clear React Native cache
echo "🧹 Clearing caches..."

# Clear npm cache
npm cache clean --force 2>/dev/null || echo "npm cache clean skipped"

# Clear Expo cache
rm -rf ~/.expo/cache 2>/dev/null || echo "Expo cache clear skipped"
rm -rf .expo 2>/dev/null || echo "Local .expo cache clear skipped"

# Clear Metro cache
rm -rf /tmp/metro-* 2>/dev/null || echo "Metro cache clear skipped"
rm -rf /tmp/haste-map-* 2>/dev/null || echo "Haste map cache clear skipped"

# Clear node_modules and reinstall
if [ -d "node_modules" ]; then
    echo "🗑️  Removing node_modules..."
    rm -rf node_modules
fi

echo "📦 Reinstalling dependencies..."
bun install

echo "✅ All fixes applied!"
echo "🚀 Try running your app now with: bun expo start"

# Run the text node checker
if [ -f "fix-text-nodes.js" ]; then
    echo "\n🔍 Checking for text node issues..."
    node fix-text-nodes.js
fi