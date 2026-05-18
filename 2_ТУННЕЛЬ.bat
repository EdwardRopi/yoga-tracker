@echo off
title Yoga - SSH Tunnel
echo.
echo =====================================
echo   Yoga Tracker - SSH Tunnel
echo =====================================
echo.
echo Wait for a line like:
echo   https://xxxxxxxx.localhost.run
echo.
echo Copy that URL, then run 3_НАСТРОИТЬ_БОТА.bat
echo DO NOT close this window!
echo.

ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 nokey@localhost.run
pause
