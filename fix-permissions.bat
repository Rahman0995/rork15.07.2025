@echo off
echo 🔧 Fixing React Native issues...

echo 🧹 Clearing caches...

REM Clear npm cache
npm cache clean --force 2>nul

REM Clear Expo cache
if exist "%USERPROFILE%\.expo\cache" rmdir /s /q "%USERPROFILE%\.expo\cache" 2>nul
if exist ".expo" rmdir /s /q ".expo" 2>nul

REM Clear Metro cache
for /d %%i in ("%TEMP%\metro-*") do rmdir /s /q "%%i" 2>nul
for /d %%i in ("%TEMP%\haste-map-*") do rmdir /s /q "%%i" 2>nul

REM Clear node_modules and reinstall
if exist "node_modules" (
    echo 🗑️  Removing node_modules...
    rmdir /s /q "node_modules"
)

echo 📦 Reinstalling dependencies...
bun install

echo ✅ All fixes applied!
echo 🚀 Try running your app now with: bun expo start

REM Run the text node checker
if exist "fix-text-nodes.js" (
    echo.
    echo 🔍 Checking for text node issues...
    node fix-text-nodes.js
)

pause