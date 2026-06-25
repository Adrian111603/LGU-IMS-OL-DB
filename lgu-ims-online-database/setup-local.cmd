@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo.
echo LGU IMS Online Database - Local Setup
echo ====================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js/npm is not installed or not available in PATH.
  pause
  exit /b 1
)

if not exist "%BACKEND%\.env" (
  echo Creating backend .env from .env.example...
  copy "%BACKEND%\.env.example" "%BACKEND%\.env" >nul
)

if not exist "%FRONTEND%\.env" (
  echo Creating frontend .env from .env.example...
  copy "%FRONTEND%\.env.example" "%FRONTEND%\.env" >nul
)

echo Installing dependencies...
pushd "%ROOT%"
call npm install
if errorlevel 1 (
  popd
  echo Dependency install failed.
  pause
  exit /b 1
)
popd

echo.
echo Setup files are ready.
echo.
echo Before running migrations, edit:
echo %BACKEND%\.env
echo.
echo Set DATABASE_URL to your local PostgreSQL or Supabase PostgreSQL URL.
echo.
echo Then run:
echo cd /d "%BACKEND%"
echo npx prisma migrate dev --name init
echo npm run seed
echo.
echo After that, use start-local.cmd.
echo.
pause

