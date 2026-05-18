@echo off
chcp 65001 >nul
title Yoga Tracker

echo.
echo  ====================================
echo   🧘  ЙОГА ТРЕКЕР — Запуск
echo  ====================================
echo.

:: Переходим в папку backend
cd /d "%~dp0backend"

:: Проверяем Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌ Node.js не установлен!
    echo.
    echo  Скачай и установи с сайта: https://nodejs.org
    echo  Выбери кнопку "LTS", установи, затем запусти этот файл снова.
    echo.
    pause
    exit /b 1
)

:: Устанавливаем зависимости если нужно
if not exist node_modules (
    echo  📦 Устанавливаем зависимости (первый запуск, ~1 минута)...
    npm install
    echo.
)

:: Запускаем сервер
echo  🚀 Запускаем сервер...
echo  📱 Открой в браузере: http://localhost:3000
echo.
echo  Для остановки нажми Ctrl+C
echo.
npm start
pause
