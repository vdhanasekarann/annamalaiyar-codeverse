# Mobile Build Guide (APK, iOS, PWA)

## 1) PWA (already enabled in this repo)

PWA assets are configured:
- `public/manifest.webmanifest`
- `public/sw.js`
- `index.html` (manifest + Apple meta tags)
- `src/main.jsx` (service worker registration in production)

Build:

```bash
npm run build
```

Deploy `dist/` to `app.aicodeverse.com`.  
After deployment, open the site on phone/desktop browser and use **Install App**.

## 2) Android APK / AAB (Capacitor)

Capacitor is configured:
- `capacitor.config.ts`
- `android/` native project

Useful commands:

```bash
npm run mobile:sync
npm run mobile:open:android
npm run mobile:build:android:debug
npm run mobile:build:android:release
```

Output paths:
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Required on build machine
- Android Studio + Android SDK
- `ANDROID_HOME` env variable
- `android/local.properties` with `sdk.dir=...` if needed
- Java 17+

## 3) iOS (Capacitor)

iOS project is generated in `ios/`, but native dependency install requires CocoaPods on macOS.

Commands (run on Mac):

```bash
npm run mobile:sync
npm run mobile:open:ios
```

Then in Xcode:
1. Select Team + Bundle Identifier
2. Set signing profile
3. Archive and upload via Xcode Organizer

### Required on build machine
- macOS
- Xcode
- CocoaPods (`pod install`)

## 4) Notes

- On this Windows machine, APK release build is currently blocked by missing Android SDK path.
- iOS binary build is blocked by missing `pod` (CocoaPods) and macOS toolchain.
