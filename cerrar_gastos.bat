@echo off
title Cerrando Sistema de Gastos
color 0C

echo Cerrando Sistema de Gastos...

REM 
taskkill /f /im node.exe >nul 2>&1

REM
for /f "tokens=2" %%i in ('tasklist /fi "windowtitle eq Backend*" /fo csv ^| find /c /v ""') do if %%i gtr 1 taskkill /fi "windowtitle eq Backend*" /f >nul 2>&1
for /f "tokens=2" %%i in ('tasklist /fi "windowtitle eq Frontend*" /fo csv ^| find /c /v ""') do if %%i gtr 1 taskkill /fi "windowtitle eq Frontend*" /f >nul 2>&1

echo Sistema cerrado correctamente.
timeout /t 2 >nul