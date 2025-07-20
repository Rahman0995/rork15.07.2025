#!/bin/bash

# Проверяем, установлен ли expo локально
if [ -f "node_modules/.bin/expo" ]; then
    echo "Используем локальную установку Expo..."
    ./node_modules/.bin/expo start --tunnel
elif command -v npx &> /dev/null; then
    echo "Используем npx для запуска Expo..."
    npx expo start --tunnel
else
    echo "Ошибка: Expo CLI не найден. Попробуйте установить его локально:"
    echo "npm install --save-dev @expo/cli"
fi