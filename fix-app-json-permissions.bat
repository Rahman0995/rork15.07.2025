@echo off
REM Скрипт для Windows - изменение прав доступа к app.json

echo Изменяем права доступа к app.json...

REM Для Windows используем icacls для изменения прав
icacls app.json /grant Everyone:F

if %errorlevel% equ 0 (
    echo ✅ Права успешно изменены!
    echo Текущие права app.json:
    icacls app.json
) else (
    echo ❌ Ошибка при изменении прав
)

pause