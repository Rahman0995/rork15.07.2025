#!/bin/bash
echo "🚀 Запуск backend сервера..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1
node start-backend-simple.js