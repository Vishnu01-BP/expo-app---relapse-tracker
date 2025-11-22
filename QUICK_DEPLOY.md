# Quick Deployment Guide

## 🚀 Fastest Way: EAS Build (Recommended)

Your project is already configured with EAS! You have a project ID: `a6f8aa4f-a70c-429d-bd16-187e1c0e34f8`

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login
```bash
eas login
```
(Create free Expo account if needed)

### Step 3: Build for Android
```bash
# For testing (APK)
eas build --profile preview --platform android

# For Play Store (AAB)
eas build --profile production --platform android
```

### Step 4: Download & Install
- Build takes 10-20 minutes
- Download link will be provided
- Install APK on your Android phone

### Step 5: Submit to Play Store (When Ready)
```bash
eas submit --platform android
```

---

## 🌐 Deploy Web Version (5 Minutes)

### Option A: Vercel (Easiest)
```bash
# 1. Build web
npx expo export:web

# 2. Install Vercel CLI
npm install -g vercel

# 3. Deploy
cd web-build
vercel --prod
```

### Option B: Netlify
```bash
# 1. Build
npx expo export:web

# 2. Deploy
npx netlify-cli deploy --prod --dir=web-build
```

---

## 📋 Before Deploying - Update These

### 1. Update app.json
Add version code for Android:
```json
"android": {
  "versionCode": 1,  // Increment for each release
  "package": "com.vishnu_bp.relapsetracker"
}
```

### 2. Set Production Environment Variables
Make sure your `.env` has production keys (not test keys).

### 3. Test First
```bash
# Build preview version first
eas build --profile preview --platform android
```

---

## 🎯 Recommended First Steps

1. **Test with Preview Build:**
   ```bash
   eas build --profile preview --platform android
   ```

2. **Deploy Web Version:**
   ```bash
   npx expo export:web
   vercel --prod
   ```

3. **When Ready for Production:**
   ```bash
   eas build --profile production --platform android
   eas submit --platform android
   ```

---

## 💰 Costs

- **EAS Build**: Free tier (limited builds), then ~$0.01 per build
- **Google Play**: $25 one-time fee
- **Vercel/Netlify**: Free tier available

---

## ⚡ Quick Commands

```bash
# Build Android APK (testing)
eas build --profile preview --platform android

# Build Android AAB (Play Store)
eas build --profile production --platform android

# Deploy Web
npx expo export:web && vercel --prod

# Submit to Play Store
eas submit --platform android
```

Start with a preview build to test everything works!

