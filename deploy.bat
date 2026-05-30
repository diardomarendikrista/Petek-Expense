@echo off
echo ==========================================
echo Starting Deployment for Petek Expense (Next.js)
echo ==========================================

echo [1/6] Pulling latest code from git...
@REM git pull origin main

echo [2/6] Installing dependencies...
call npm install

echo [3/6] Generating Prisma Client ^& Syncing Database Schema...
call npx prisma generate
call npx prisma db push --accept-data-loss

echo [4/6] Building the Next.js project...
call npm run build

echo [5/6] Restarting PM2 process...
@REM Menghentikan proses yang lama (jika ada)
call pm2 stop petek-expense 2>nul
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
