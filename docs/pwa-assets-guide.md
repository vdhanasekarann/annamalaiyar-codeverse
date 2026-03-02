# PWA Asset Preparation Guide

## Current status
- Manifest and service worker are configured for installable PWA behavior.
- PNG icon set is now generated in `public/icons` from `public/AICodeverse.png`.

## Source files to maintain
- App icon master: `1024x1024` PNG, transparent background if possible.
- Maskable icon master: `1024x1024` PNG with key content inside center `80%` safe zone.
- Splash/background master: at least `2732x2732` PNG for mobile launch screens.

## Web PWA files (recommended)
- Manifest icons: `48, 72, 96, 128, 192, 256, 384, 512` in PNG.
- Maskable icon: `512x512` PNG (`purpose: maskable`).
- Apple touch icon: `180x180` PNG.
- Favicon: `32x32` PNG (optionally add `.ico` bundle with `16/32/48`).

## Manifest screenshots (next improvement)
Prepare these and add under `screenshots` in `manifest.webmanifest`:
- Mobile portrait screenshot: `720x1280` PNG or WebP.
- Desktop/wide screenshot: `1280x720` PNG or WebP.
- 2 to 5 screenshots total for richer install prompts in Chromium browsers.

## Store/distribution assets (if publishing native wrappers)
- Google Play:
  - App icon: `512x512` PNG
  - Feature graphic: `1024x500` PNG
  - Phone screenshots: minimum 2, JPG or 24-bit PNG
- Apple App Store:
  - App icon source: `1024x1024` PNG (no alpha for final store icon export)
  - iPhone screenshots by device class (6.7-inch, 6.5-inch, 5.5-inch sets are common)

## Commands
- Regenerate PWA icons after logo updates:
  - `npm run pwa:icons`
