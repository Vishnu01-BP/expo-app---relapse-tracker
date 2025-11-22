# Quick Fix for Android Connection

## The Problem
Your project has `newArchEnabled: true` which means Expo Go won't work. You need a development build OR disable new architecture temporarily.

## Quick Solutions (Choose One)

### Solution 1: Use Tunnel Mode (Easiest - Works Now)
This bypasses network issues:

```bash
npx expo start --tunnel
```

Then scan the QR code with Expo Go. Tunnel mode works even on different networks.

### Solution 2: Disable New Architecture Temporarily
Edit `app.json` and change:
```json
"newArchEnabled": true,
```
to:
```json
"newArchEnabled": false,
```

Then restart:
```bash
npx expo start --clear
```

⚠️ **Note:** Some features might not work perfectly, but you can test the app.

### Solution 3: Use Android Emulator
If you have Android Studio:
```bash
npx expo start --android
```

### Solution 4: Network Troubleshooting
1. Make sure phone and computer are on **same Wi-Fi**
2. Try LAN mode:
   ```bash
   npx expo start --lan
   ```
3. Check Windows Firewall - allow Node.js
4. Manually enter URL in Expo Go:
   - Look for `exp://192.168.x.x:8081` in terminal
   - In Expo Go: "Enter URL manually"

## Recommended: Create Development Build
For full compatibility with all features:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for Android
eas build --profile development --platform android
```

This creates a custom app that supports everything.

