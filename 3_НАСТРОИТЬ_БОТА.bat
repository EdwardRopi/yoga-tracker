@echo off
title Yoga - Configure Bot
set PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%
cd /d "%~dp0backend"

echo.
echo =====================================
echo   Yoga Tracker - Bot Setup
echo =====================================
echo.
set /p TUNNEL_URL="Paste your trycloudflare.com URL here: "

echo.
echo Configuring bot with: %TUNNEL_URL%
echo.

node setup-bot.js %TUNNEL_URL%
echo.
pause
