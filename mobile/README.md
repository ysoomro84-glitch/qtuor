# Qtuor Mobile App (React Native + Expo)

Cross-platform mobile application for Android & iOS that syncs seamlessly with the Qtuor web platform.

## Features

- **Same Login System**: Users registered on the web can log in on mobile instantly
- **Student Dashboard**: Stats, upcoming classes, current plan, lesson progress
- **Tutor Marketplace**: Browse verified tutors, filter by category/search, view ratings
- **Subscription Plans**: View and subscribe to monthly plans
- **Virtual Classroom**: Live class via Secure WebView (WebRTC video + Quran canvas)
- **Push Notifications**: Class reminders, booking confirmations, payment alerts via FCM
- **Brand UI**: Premium Deep Navy Blue (#0B2545) + Gold (#D4AF37) Islamic theme
- **Tablet Optimized**: Responsive layout for phones (6") and tablets (10" iPads/Android)

## Tech Stack

- **Framework**: React Native + Expo (SDK 52)
- **Language**: TypeScript
- **Navigation**: React Navigation 6 (Stack + Bottom Tabs)
- **Backend**: Connects to the Qtuor web API (same database, same endpoints)
- **Push Notifications**: Firebase Cloud Messaging (FCM) via expo-notifications
- **Classroom**: WebView (reuses web WebRTC + Quran canvas)

## Quick Start

### Prerequisites
1. Install [Node.js](https://nodejs.org) (LTS)
2. Install Expo CLI: `npm install -g expo-cli`
3. Install [Expo Go](https://expo.dev/client) on your phone (for testing without building)

### Install & Run

```bash
cd mobile
npm install
npx expo start
```

This opens the Expo dev server. Scan the QR code with Expo Go (Android) or Camera app (iOS).

### Configure API URL

Edit `lib/api.ts` and set `API_BASE_URL`:
```typescript
// For Android emulator (connects to host machine)
export const API_BASE_URL = 'http://10.0.2.2:3000'

// For iOS simulator
export const API_BASE_URL = 'http://localhost:3000'

// For physical device testing (use your computer's IP)
export const API_BASE_URL = 'http://192.168.1.100:3000'

// For production
export const API_BASE_URL = 'https://www.qtuor.com'
```

## Building for App Stores

### Android (Google Play Store)

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Configure: `eas build:configure`
4. Build AAB (for Play Store): `eas build -p android --profile production`
5. Build APK (for testing): `eas build -p android --profile preview`

### iOS (Apple App Store)

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Build: `eas build -p ios --profile production`
4. Submit: `eas submit -p ios`

## Push Notifications Setup (FCM)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project named "Qtuor"

### 2. Add Android App
1. Click "Add app" → Android
2. Package name: `com.qtuor.app`
3. Download `google-services.json` → place in `mobile/`

### 3. Add iOS App
1. Click "Add app" → iOS
2. Bundle ID: `com.qtuor.app`
3. Download `GoogleService-Info.plist` → place in `mobile/`
4. Upload your APNs key from Apple Developer to Firebase

### 4. Configure EAS Project ID
1. Run `eas build:configure`
2. Copy the project ID from the output
3. Update `app.json` → `extra.eas.projectId` with your project ID
4. Update `lib/notifications.ts` → `projectId` in `getExpoPushTokenAsync`

## Project Structure

```
mobile/
├── App.tsx                      # Main entry + navigation
├── app.json                     # Expo config (splash, icons, permissions)
├── package.json
├── babel.config.js
├── tsconfig.json
├── lib/
│   ├── api.ts                   # API client (connects to web backend)
│   ├── theme.ts                 # Brand colors, spacing, shadows
│   └── notifications.ts         # FCM push notification setup
├── screens/
│   ├── SplashScreen.tsx         # Animated Q logo entrance
│   ├── LoginScreen.tsx          # Login form (syncs with web accounts)
│   ├── StudentDashboardScreen.tsx  # Student stats + upcoming classes
│   ├── MarketplaceScreen.tsx    # Browse/search tutors
│   ├── PlansScreen.tsx          # Subscription plans
│   └── ClassroomScreen.tsx      # Virtual classroom (WebView)
├── assets/                      # App icons + splash images
└── google-services.json         # (Add from Firebase — Android)
```

## Demo Accounts

- **Admin**: admin@qtuor.com / admin123
- **Student**: qaida.student@qtuor.com / qaida123
- **Tutor**: abdullah@qtuor.com / tutor123

## Virtual Classroom Approach

The mobile app uses a **Secure WebView** to load the web classroom. This reuses:
- WebRTC video streaming
- Interactive Quran canvas (word-by-word sync)
- Noorani Qaida lessons
- Whiteboard
- Live chat

For production, you can optionally upgrade to **native WebRTC** using `react-native-webrtc` for better performance on older devices. The WebView approach works well on modern phones and tablets.

## License

Proprietary — © Qtuor
