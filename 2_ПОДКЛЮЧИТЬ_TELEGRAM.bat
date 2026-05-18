@echo off
title Yoga Tunnel
set PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%
cd /d "%~dp0backend"

echo.
echo Connecting tunnel...
echo.
node auto-tunnel.js
pause
