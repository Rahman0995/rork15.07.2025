#!/bin/bash

echo "🧹 Clearing all caches..."

# Clear npm/yarn cache
echo "Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Clear Metro cache
echo "Clearing Metro cache..."
npx expo r -c 2>/dev/null || npx react-native start --reset-cache 2>/dev/null || true

# Clear Expo cache
echo "Clearing Expo cache..."
npx expo install --fix 2>/dev/null || true

# Clear node_modules and reinstall
echo "Clearing node_modules..."
rm -rf node_modules
rm -f package-lock.json yarn.lock

echo "Reinstalling dependencies..."
npm install

# Clear TypeScript cache
echo "Clearing TypeScript cache..."
rm -rf .tsbuildinfo
npx tsc --build --clean 2>/dev/null || true

# Clear Babel cache
echo "Clearing Babel cache..."
rm -rf .babel-cache
rm -rf node_modules/.cache

echo "✅ All caches cleared! Ready to restart."
echo "Run: npx expo start -c"