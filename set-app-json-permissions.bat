@echo off
REM Windows equivalent - setting full permissions for app.json
REM Note: Windows doesn't have exact chmod equivalent, but we can use icacls

icacls app.json /grant Everyone:F
echo Permissions set for app.json (Windows)
dir app.json