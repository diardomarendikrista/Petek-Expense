@echo off
echo ==========================================
echo Starting Deployment for Petek Expense (Next.js)
echo ==========================================

echo [1/6] Pulling latest code from git...
git pull origin main

echo [2/6] Stopping PM2 process...
@REM Menghentikan proses yang lama agar tidak ada file Prisma yang di-lock di Windows
call pm2 stop petek-expense 2>nul

echo [3/6] Installing dependencies...
call npm install

echo [4/6] Generating Prisma Client ^& Syncing Database Schema...
call npx prisma generate
call npx prisma db push --accept-data-loss

echo [5/6] Building the Next.js project...
call npm run build

echo [6/6] Starting PM2 process...
@REM Memulai proses baru via npm start
call pm2 start npm --name "petek-expense" -- start
call pm2 save

echo ==========================================
echo Deployment Completed Successfully!
echo ==========================================
echo.
echo NOTE: Pastikan file .env (terutama DATABASE_URL dan PORT) 
echo sudah disetting dengan benar di server production.
pause
