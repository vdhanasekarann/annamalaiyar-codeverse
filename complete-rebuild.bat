@echo off
echo ========================================
echo Complete Rebuild Process for CodeVerse
echo ========================================
echo.

echo Step 1: Building web assets with latest fixes...
call npm run build
echo.

echo Step 2: Deploying to Vercel (optional)...
echo Run 'vercel --prod' manually if needed
echo.

echo Step 3: Syncing to mobile with Node.js 22...
"C:\Program Files\nodejs\node.exe" "C:\Users\admin\Annamalayar-site\node_modules\@capacitor\cli\dist\index.js" sync
echo.

echo Step 4: Building APK with all fixes...
cd android
gradlew.bat assembleDebug
echo.

echo ========================================
echo BUILD COMPLETE!
echo ========================================
echo.
echo Your new APK with all fixes is at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Fixes included:
echo - Mobile Status Bar Fix
echo - Google OAuth Mobile Fix  
echo - TopBar Layout Fix
echo - Security & Performance Updates
echo.
pause
