@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"

echo.
echo LGU IMS Online Database - Database Setup
echo =======================================
echo.

if not exist "%BACKEND%\.env" (
  echo Missing backend .env file.
  echo Run setup-local.cmd first, then set DATABASE_URL.
  pause
  exit /b 1
)

pushd "%BACKEND%"

echo Running Prisma migration...
call npx prisma migrate dev --name init
if errorlevel 1 (
  popd
  echo Prisma migration failed. Check DATABASE_URL in backend\.env.
  pause
  exit /b 1
)

echo.
echo Seeding default accounts and barangays...
call npm run seed
if errorlevel 1 (
  popd
  echo Seed failed.
  pause
  exit /b 1
)

popd

echo.
echo Database setup complete.
echo You can now run start-local.cmd.
echo.
pause

