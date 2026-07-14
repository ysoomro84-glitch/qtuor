# Qtuor Mobile App Assets

Place these image files here before building:

## Required Assets

1. **icon.png** (1024×1024) — App icon (the Qtuor "Q" logo)
2. **splash.png** (1284×2778) — Splash screen image (Q logo on navy background)
3. **adaptive-icon.png** (1024×1024) — Android adaptive icon foreground
4. **favicon.png** (48×48) — Web favicon
5. **notification-icon.png** (96×96) — Small icon for push notifications (white Q on transparent)

## How to Generate

Use the Qtuor logo from the web project (`public/brand/qtuor-logo.png`):

```bash
# From the project root
cp public/brand/qtuor-logo.png mobile/assets/icon.png

# Or use the favicon
cp public/favicon-180.png mobile/assets/icon.png
cp public/favicon-64.png mobile/assets/notification-icon.png
```

For the splash screen, create a 1284×2778 PNG with the Q logo centered on #0B2545 background.
