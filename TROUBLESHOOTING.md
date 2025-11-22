# Troubleshooting Android Connection Issues

## Common Issues & Solutions

### Issue 1: New Architecture Enabled
Your project has `newArchEnabled: true` in app.json, which means **Expo Go won't work**. You need a development build.

### Solution Options:

#### Option A: Use Tunnel Mode (Quick Fix)
If you just want to test quickly:

```bash
npx expo start --tunnel
```

This creates a tunnel that works even if your phone and computer are on different networks.

#### Option B: Create Development Build (Recommended)
Since you're using the new architecture and custom native modules:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Create development build:**
   ```bash
   eas build --profile development --platform android
   ```

4. **Install on your phone:**
   - Download the APK from the build link
   - Install it on your Android phone
   - Open the app and scan the QR code

#### Option C: Use Android Emulator
If you have Android Studio installed:

```bash
npx expo start --android
```

This will automatically open in the Android emulator.

### Issue 2: Network Connection

**Check these:**

1. **Same Wi-Fi Network:**
   - Phone and computer must be on the same Wi-Fi
   - Some corporate/public networks block device-to-device communication

2. **Firewall:**
   - Windows Firewall might be blocking port 8081
   - Allow Node.js through firewall

3. **Try Tunnel Mode:**
   ```bash
   npx expo start --tunnel
   ```

### Issue 3: Expo Go Compatibility

Some packages in your project might not work with Expo Go:
- `@clerk/clerk-expo` - May need development build
- `expo-secure-store` - Should work but may have limitations
- Custom native modules

### Quick Test Commands:

```bash
# Check if Expo is running
npx expo start

# Try tunnel mode
npx expo start --tunnel

# Try LAN mode (same network)
npx expo start --lan

# Clear cache and restart
npx expo start --clear
```

### Manual Connection:

If QR code doesn't work:

1. Note the IP address shown in terminal (e.g., `exp://192.168.1.100:8081`)
2. In Expo Go app, tap "Enter URL manually"
3. Enter the URL from terminal

### Recommended Solution:

For your project with new architecture and Clerk authentication, **create a development build**:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for Android
eas build --profile development --platform android
```

This will give you a custom development build that supports all your features.

