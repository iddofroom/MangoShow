@echo off
chcp 65001 > nul
echo ================================================
echo 🥭 מנגו דרור - התקנה אוטומטית
echo ================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js לא מותקן!
    pause
    exit /b 1
)

echo ✅ Node.js מותקן
node -v
echo.

echo 📦 מתקין תלויות...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ ההתקנה נכשלה!
    pause
    exit /b 1
)

echo.
echo ✅ ההתקנה הושלמה!
echo 🚀 להפעלה: npm run dev
pause
