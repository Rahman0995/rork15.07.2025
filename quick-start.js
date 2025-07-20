#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запускаем Expo приложение...');

// Проверяем, есть ли локальная установка expo
const expoPath = path.join(__dirname, 'node_modules', '.bin', 'expo');
const fs = require('fs');

let command, args;

if (fs.existsSync(expoPath)) {
    console.log('✅ Используем локальную установку Expo CLI');
    command = expoPath;
    args = ['start', '--tunnel'];
} else {
    console.log('📦 Используем npx для запуска Expo CLI');
    command = 'npx';
    args = ['expo', 'start', '--tunnel'];
}

const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true
});

child.on('error', (error) => {
    console.error('❌ Ошибка запуска:', error.message);
    process.exit(1);
});

child.on('close', (code) => {
    console.log(`🏁 Процесс завершен с кодом ${code}`);
    process.exit(code);
});