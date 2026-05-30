@echo off
echo ==========================================
echo Starting Deployment for Petek Expense (Next.js)
echo ==========================================

echo [1/6] Pulling latest code from git...
git pull origin main

echo [2/6] Stopping PM2 processes...
@REM Menghentikan proses yang lama agar tidak ada file Prisma yang di-lock di Windows
call pm2 stop ecosystem.config.js 2>nul

echo [3/6] Installing dependencies...
call npm install

echo [4/6] Generating Prisma Client ^& Syncing Database Schema...
call npx prisma generate
call npx prisma db push --accept-data-loss

echo [5/6] Building the Next.js project...
call npm run build

echo [6/6] Starting PM2 processes...
@REM Memulai semua proses melalui ecosystem config (lebih aman untuk Windows)
call pm2 start ecosystem.config.js
call pm2 save

echo ==========================================
echo Deployment Completed Successfully!
echo ==========================================
echo.
echo NOTE: Pastikan file .env (terutama DATABASE_URL dan PORT) 
echo sudah disetting dengan benar di server production.
pause
