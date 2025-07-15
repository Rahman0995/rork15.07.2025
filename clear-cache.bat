@echo off
echo 🧹 Очистка кэша React Native / Expo проекта...

REM Остановить все процессы
echo ⏹️  Остановка процессов...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

REM Очистка кэша Bun
echo 🗑️  Очистка кэша Bun...
bun pm cache rm

REM Удаление node_modules и lock файлов
echo 📦 Удаление node_modules...
if exist node_modules rmdir /s /q node_modules
if exist bun.lock del bun.lock

REM Очистка кэша Expo/Metro
echo 🚀 Очистка кэша Expo...
bunx expo install --fix
bunx expo r -c

REM Переустановка зависимостей
echo 📥 Переустановка зависимостей...
bun install

echo ✅ Кэш очищен! Теперь запустите проект:
echo    bun start
echo    или
echo    bunx expo start --clear
pause