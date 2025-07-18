@echo off
echo 🚀 Starting Military Management App with Mock Data Support...

REM Set environment variables for mock data
set ENABLE_MOCK_DATA=true
set NODE_ENV=development

REM Try to start backend in background (optional)
echo 🔧 Attempting to start backend server...

where bun >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ Starting backend with Bun...
    start /B bun run backend/index.ts
    echo Backend started in background
) else (
    where npx >nul 2>nul
    if %ERRORLEVEL% == 0 (
        npx ts-node --version >nul 2>nul
        if %ERRORLEVEL% == 0 (
            echo ✅ Starting backend with ts-node...
            start /B npx ts-node backend/index.ts
            echo Backend started in background
        ) else (
            echo ⚠️  ts-node not found
            echo 📱 App will run with mock data only
        )
    ) else (
        echo ⚠️  npx not found
        echo 📱 App will run with mock data only
    )
)

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start the Expo app
echo 📱 Starting Expo app...
where bunx >nul 2>nul
if %ERRORLEVEL% == 0 (
    bunx rork start -p jwjevnxtm1q2kz7xwsgmz --tunnel
) else (
    where npx >nul 2>nul
    if %ERRORLEVEL% == 0 (
        npx expo start --tunnel
    ) else (
        echo ❌ Neither bunx nor npx found!
        pause
        exit /b 1
    )
)

pause