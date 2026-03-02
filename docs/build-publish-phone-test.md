# Build + Publish + Phone Test

## One-command flows
- Vercel publish + PWA phone test + APK build:
  - `npm run release:vercel`
- Firebase publish + PWA phone test + APK build:
  - `npm run release:firebase`
- Build only guidance, no publish:
  - `npm run release:all`

## Fast phone-only tests
- PWA test instructions only:
  - `npm run test:phone:pwa`
- APK build test only:
  - `npm run test:phone:apk`

## What the flow does
1. Runs `npm run build` (unless skipped).
2. Publishes web app (Vercel or Firebase, unless skipped).
3. Shows mobile PWA install test steps.
4. Builds Android debug APK and prints expected output path.

## Requirements
- For Vercel:
  - Install CLI: `npm i -g vercel`
  - Login once: `vercel login`
- For Firebase:
  - Configure Hosting in `firebase.json` (must include `hosting` block).
  - Install CLI: `npm i -g firebase-tools`
  - Login once: `firebase login`
- For APK install via USB:
  - Android platform-tools (`adb`) installed and available in PATH.

## Output locations
- Web build: `dist/`
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`
