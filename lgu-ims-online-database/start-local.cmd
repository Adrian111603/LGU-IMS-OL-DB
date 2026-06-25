@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo.
echo LGU IMS Online Database - Local Starter
echo ======================================
echo.

if not exist "%BACKEND%\package.json" (
  echo Backend folder is missing.
  pause
  exit /b 1
)

if not exist "%FRONTEND%\package.json" (
  echo Frontend folder is missing.
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

if not exist "%ROOT%node_modules" (
  echo Installing dependencies. This may take a few minutes...
  pushd "%ROOT%"
  call npm install
  if errorlevel 1 (
    popd
    echo Dependency install failed.
    pause
    exit /b 1
  )
  popd
)

echo.
echo Starting backend API on http://localhost:3000
start "LGU IMS Online API" cmd /k "cd /d "%BACKEND%" && npm run start:dev"

echo Starting frontend app on http://localhost:5173
start "LGU IMS Online Web" cmd /k "cd /d "%FRONTEND%" && npm run dev"

echo.
echo Local starter launched.
echo Open http://localhost:5173 after both windows finish starting.
echo.
pause

