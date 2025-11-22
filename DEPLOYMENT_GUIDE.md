# Deployment Guide for Relapse Tracker

## Quick Start - Choose Your Platform

### 🚀 Option 1: EAS Build (Recommended - Easiest)

Deploy to app stores using Expo's cloud build service.

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo
```bash
eas login
```

#### Step 3: Configure Project
```bash
eas build:configure
```

This creates `eas.json` with build configurations.

#### Step 4: Build for Android
```bash
# Development build (for testing)
eas build --profile development --platform android

# Production build (for Play Store)
eas build --profile production --platform android
```

#### Step 5: Build for iOS (Mac required)
```bash
eas build --profile production --platform ios
```

#### Step 6: Submit to Stores
```bash
# Android - Google Play Store
eas submit --platform android

# iOS - App Store
eas submit --platform ios
```

---

### 🌐 Option 2: Web Deployment

Deploy your app as a web application.

#### Using Expo Web
```bash
# Build for web
npx expo export:web

# This creates a 'web-build' folder
```

#### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=web-build
```

#### Deploy to GitHub Pages
1. Build: `npx expo export:web`
2. Push `web-build` folder to GitHub
3. Enable GitHub Pages in repository settings

---

### 📱 Option 3: Manual Android Build (Advanced)

Build APK/AAB locally without EAS.

#### Prerequisites
- Android Studio installed
- Android SDK configured
- Java JDK installed

#### Steps
```bash
# 1. Generate native Android project
npx expo prebuild --platform android

# 2. Build APK (for testing)
cd android
./gradlew assembleRelease

# 3. Build AAB (for Play Store)
./gradlew bundleRelease

# APK location: android/app/build/outputs/apk/release/
# AAB location: android/app/build/outputs/bundle/release/
```

---

## Pre-Deployment Checklist

### ✅ Environment Variables
Make sure your `.env` file has production keys:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_key
EXPO_PUBLIC_OPENROUTER_API_KEY=your_key
```

### ✅ Update app.json
```json
{
  "expo": {
    "version": "1.0.0",  // Update version number
    "android": {
      "versionCode": 1,  // Increment for each release
      "package": "com.yourcompany.relapsetracker"  // Unique package name
    },
    "ios": {
      "buildNumber": "1",  // Increment for each release
      "bundleIdentifier": "com.yourcompany.relapsetracker"
    }
  }
}
```

### ✅ Test Production Build
```bash
# Test production build locally
eas build --profile production --platform android --local
```

### ✅ Update Version
Before each release:
1. Update `version` in `app.json`
2. Update `versionCode` (Android) or `buildNumber` (iOS)
3. Update `version` in `package.json`

---

## EAS Build Configuration

After running `eas build:configure`, edit `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## Google Play Store Submission

### 1. Create Google Play Console Account
- Go to https://play.google.com/console
- Pay $25 one-time fee
- Create app listing

### 2. Build Production AAB
```bash
eas build --profile production --platform android
```

### 3. Submit to Play Store
```bash
eas submit --platform android
```

### 4. Complete Store Listing
- App name, description, screenshots
- Privacy policy URL
- Content rating questionnaire
- App icon and feature graphic

---

## Apple App Store Submission

### 1. Apple Developer Account
- Go to https://developer.apple.com
- Pay $99/year fee
- Enroll in Apple Developer Program

### 2. Build for iOS
```bash
eas build --profile production --platform ios
```

### 3. Submit to App Store
```bash
eas submit --platform ios
```

### 4. Complete App Store Connect
- App information
- Screenshots for different device sizes
- Privacy policy
- App Store review information

---

## Web Deployment Steps

### Vercel (Easiest)
```bash
# 1. Build web version
npx expo export:web

# 2. Install Vercel CLI
npm install -g vercel

# 3. Deploy
cd web-build
vercel --prod
```

### Netlify
```bash
# 1. Build
npx expo export:web

# 2. Deploy
netlify deploy --prod --dir=web-build
```

### Custom Server
```bash
# Build static files
npx expo export:web

# Upload 'web-build' folder to your server
# Configure server to serve index.html for all routes
```

---

## Environment-Specific Builds

### Development
```bash
eas build --profile development --platform android
```

### Staging/Preview
```bash
eas build --profile preview --platform android
```

### Production
```bash
eas build --profile production --platform android
```

---

## Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm install -g eas-cli
      - run: eas build --profile production --platform android --non-interactive
```

---

## Troubleshooting

### Build Fails
- Check `eas.json` configuration
- Verify environment variables
- Check build logs: `eas build:list`

### App Crashes on Launch
- Test development build first
- Check error logs
- Verify all native modules are compatible

### Store Rejection
- Follow store guidelines
- Provide privacy policy
- Complete all required information

---

## Quick Commands Reference

```bash
# Configure EAS
eas build:configure

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios

# Build web
npx expo export:web

# Deploy web to Vercel
vercel --prod
```

---

## Recommended Workflow

1. **Development**: Use `eas build --profile development`
2. **Testing**: Use `eas build --profile preview`
3. **Production**: Use `eas build --profile production`
4. **Submit**: Use `eas submit` after testing

---

## Cost Estimates

- **EAS Build**: Free tier includes limited builds, then pay-per-build
- **Google Play**: $25 one-time fee
- **Apple App Store**: $99/year
- **Vercel/Netlify**: Free tier available, paid for custom domains

---

## Next Steps

1. Run `eas build:configure` to get started
2. Update `app.json` with your app details
3. Set production environment variables
4. Build and test preview build
5. Submit to stores when ready

Need help with any specific step? Let me know!

