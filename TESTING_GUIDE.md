# Testing Your App Without Expo Go

## Option 1: Web Browser (Easiest & Fastest) ⚡

Test your app directly in a web browser - no setup needed!

```bash
npm run web
# or
npx expo start --web
```

**Pros:**
- ✅ Instant testing
- ✅ No additional setup
- ✅ Great for UI/UX testing
- ✅ Works with all your features (Clerk, Supabase, etc.)

**Cons:**
- ⚠️ Some native features won't work (haptics, secure store limitations)
- ⚠️ Different behavior than mobile

**Best for:** Quick UI testing, development workflow

---

## Option 2: Android Emulator (Full Native Testing) 📱

Test on a virtual Android device on your computer.

### Setup Steps:

1. **Install Android Studio:**
   - Download from: https://developer.android.com/studio
   - Install Android SDK and Android Virtual Device (AVD)

2. **Create an Android Emulator:**
   - Open Android Studio
   - Tools → Device Manager → Create Device
   - Choose a device (e.g., Pixel 5)
   - Download a system image (API 33+ recommended)
   - Finish setup

3. **Start Emulator:**
   ```bash
   # Start the emulator first, then:
   npx expo start --android
   # or
   npm run android
   ```

**Pros:**
- ✅ Full native Android experience
- ✅ All features work (haptics, secure store, etc.)
- ✅ No physical device needed
- ✅ Easy debugging

**Cons:**
- ⚠️ Requires Android Studio (large download ~1GB)
- ⚠️ Needs good computer specs (RAM, CPU)

**Best for:** Full feature testing, debugging native issues

---

## Option 3: Development Build (Production-Like) 🚀

Create a custom build of your app that works like production.

### Using EAS Build (Cloud - Recommended):

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure project:**
   ```bash
   eas build:configure
   ```

4. **Build for Android:**
   ```bash
   eas build --profile development --platform android
   ```

5. **Install on your phone:**
   - Download the APK from the build link
   - Enable "Install from unknown sources" on Android
   - Install the APK
   - Open the app and scan QR code from `npx expo start`

**Pros:**
- ✅ Works exactly like production
- ✅ Supports all native modules
- ✅ Works with new architecture
- ✅ Can test on real device

**Cons:**
- ⚠️ Takes 10-20 minutes to build
- ⚠️ Requires Expo account (free)

**Best for:** Production testing, testing on real devices

---

## Option 4: Local Development Build (Advanced) 🔧

Build the app locally on your computer.

### Prerequisites:
- Android Studio installed
- Android SDK configured
- Java JDK installed

### Steps:

1. **Generate native code:**
   ```bash
   npx expo prebuild
   ```

2. **Build APK:**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

3. **Install on device:**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

**Pros:**
- ✅ Full control
- ✅ No cloud needed
- ✅ Faster iteration

**Cons:**
- ⚠️ Complex setup
- ⚠️ Requires Android development knowledge

**Best for:** Advanced developers, custom native code

---

## Option 5: iOS Simulator (Mac Only) 🍎

If you have a Mac, test on iOS simulator.

```bash
npx expo start --ios
# or
npm run ios
```

**Pros:**
- ✅ Native iOS experience
- ✅ All features work

**Cons:**
- ⚠️ Mac only
- ⚠️ Requires Xcode

---

## Quick Comparison

| Method | Speed | Setup | Native Features | Best For |
|--------|-------|-------|------------------|----------|
| **Web** | ⚡⚡⚡ | ✅ None | ⚠️ Limited | Quick UI tests |
| **Emulator** | ⚡⚡ | ⚠️ Medium | ✅ Full | Development |
| **EAS Build** | ⚡ | ✅ Easy | ✅ Full | Production testing |
| **Local Build** | ⚡⚡ | ❌ Hard | ✅ Full | Advanced devs |

---

## Recommended Testing Workflow

1. **During Development:**
   - Use **Web** for quick UI changes
   - Use **Emulator** for native feature testing

2. **Before Release:**
   - Use **EAS Development Build** on real device
   - Test all features end-to-end

3. **For Production:**
   - Use **EAS Production Build**
   - Test on multiple devices

---

## Quick Start Commands

```bash
# Web (instant)
npm run web

# Android Emulator (if Android Studio installed)
npm run android

# iOS Simulator (Mac only)
npm run ios

# Development Build (cloud)
eas build --profile development --platform android
```

---

## Troubleshooting

### Web not working?
- Check if port 19006 is available
- Try: `npx expo start --web --port 3000`

### Emulator not starting?
- Make sure Android Studio is installed
- Check if emulator is running: `adb devices`
- Try: `npx expo start --android`

### Build failing?
- Check your `app.json` configuration
- Ensure all environment variables are set
- Check EAS build logs: `eas build:list`

