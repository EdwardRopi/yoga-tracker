@echo off
title Yoga Server

set PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%

cd /d "%~dp0backend"

echo Deleting old packages...
if exist node_modules rmdir /s /q node_modules

echo Installing packages (1-2 minutes)...
call npm install

echo.
echo Server running: http://localhost:3000
echo Do not close this window!
echo.
node server.js
pause
