@echo off
title Sistema de Gastos - Monitor
color 0B

:INICIO
cls
echo ╔══════════════════════════════════════════╗
echo ║        SISTEMA DE GASTOS PERSONALES      ║
echo ╚══════════════════════════════════════════╝
echo.

REM 
set backend_running=0
set frontend_running=0

netstat -an | findstr ":3001" >nul && set backend_running=1
netstat -an | findstr ":3000" >nul && set frontend_running=1

if %backend_running%==1 (
    echo ✓ Backend ejecutándose en puerto 3001
) else (
    echo ✗ Backend no está ejecutándose
)

if %frontend_running%==1 (
    echo ✓ Frontend ejecutándose en puerto 3000
) else (
    echo ✗ Frontend no está ejecutándose
)

echo.
echo [1] Iniciar Todo
echo [2] Solo Backend
echo [3] Solo Frontend
echo [4] Abrir en Navegador
echo [5] Estado del Sistema
echo [6] Cerrar Todo
echo [7] Salir
echo.
set /p choice="Selecciona una opción: "

if "%choice%"=="1" goto INICIAR_TODO
if "%choice%"=="2" goto INICIAR_BACKEND
if "%choice%"=="3" goto INICIAR_FRONTEND
if "%choice%"=="4" goto ABRIR_NAVEGADOR
if "%choice%"=="5" goto ESTADO
if "%choice%"=="6" goto CERRAR_TODO
if "%choice%"=="7" goto SALIR
goto INICIO

:INICIAR_TODO
echo Iniciando sistema completo...
cd backend
start /min "" cmd /c "npm run dev"
timeout /t 3 >nul
cd ../frontend
start /min "" cmd /c "npm start"
echo Sistema iniciado en segundo plano
timeout /t 2 >nul
goto INICIO

:INICIAR_BACKEND
echo Iniciando backend...
cd backend
start /min "" cmd /c "npm run dev"
cd ..
echo Backend iniciado
timeout /t 2 >nul
goto INICIO

:INICIAR_FRONTEND
echo Iniciando frontend...
cd frontend
start /min "" cmd /c "npm start"
cd ..
echo Frontend iniciado
timeout /t 2 >nul
goto INICIO

:ABRIR_NAVEGADOR
start "" "http://localhost:3000"
goto INICIO

:ESTADO
echo.
echo Estado actual del sistema:
netstat -an | findstr ":3001" >nul && echo ✓ Backend OK || echo ✗ Backend OFF
netstat -an | findstr ":3000" >nul && echo ✓ Frontend OK || echo ✗ Frontend OFF
netstat -an | findstr ":3306" >nul && echo ✓ MySQL (XAMPP) OK || echo ✗ MySQL OFF
pause
goto INICIO

:CERRAR_TODO
echo Cerrando sistema...
taskkill /f /im node.exe >nul 2>&1
echo Sistema cerrado
timeout /t 2 >nul
goto INICIO

:SALIR
exit