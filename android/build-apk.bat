@echo off
echo Building Android APK with Node.js 22...
cd ..
"C:\Program Files\nodejs\node.exe" "C:\Users\admin\Annamalayar-site\node_modules\@capacitor\cli\dist\index.js" sync android
cd android
gradlew.bat assembleDebug
echo APK Build completed!
echo Find your APK at: android\app\build\outputs\apk\debug\app-debug.apk
pause
