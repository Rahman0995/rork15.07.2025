@echo off
echo 🚀 Запуск приложения для мобильного устройства...

REM Найти и установить правильный IP
echo 🔍 Поиск локального IP адреса...
node fix-mobile-connection.js

REM Запустить backend
echo 🔧 Запуск backend сервера...
start /B npm run backend:dev

REM Подождать немного для запуска backend
timeout /t 3 /nobreak > nul

REM Запустить frontend с туннелем
echo 📱 Запуск frontend с туннелем...
npm run start

pause