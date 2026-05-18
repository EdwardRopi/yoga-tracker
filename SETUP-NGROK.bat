@echo off
chcp 65001 >nul
title Yoga Tracker — Ngrok Setup

echo.
echo  ====================================
echo   🌐  НАСТРОЙКА NGROK + БОТ
echo  ====================================
echo.

cd /d "%~dp0backend"

:: Проверяем ngrok
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo  📦 Устанавливаем ngrok через npm...
    npm install -g ngrok
)

echo  🌐 Запускаем туннель на порт 3000...
echo  (Скопируй HTTPS ссылку вида https://xxxx.ngrok.io)
echo.
echo  После появления ссылки:
echo  1. Скопируй https://xxxx.ngrok-free.app
echo  2. Открой НОВОЕ окно cmd
echo  3. Введи: cd C:\Users\veron\yoga-tracker\backend
echo  4. Введи: node setup-bot.js https://xxxx.ngrok-free.app
echo.

ngrok http 3000
pause
