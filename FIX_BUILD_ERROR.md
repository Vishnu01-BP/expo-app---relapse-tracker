# Fix Build Error - Tar Extraction Failed

## The Problem
```
tar -C /home/expo/workingdir/build --strip-components 1 -zxf /home/expo/workingdir/project.tar.gz exited with non-zero code: 2
```

This error happens when EAS tries to package your project but encounters issues.

## ✅ Fixes Applied

1. **Created `.easignore`** - Excludes unnecessary files from build
2. **Updated `eas.json`** - Added explicit build types

## 🔧 Main Issue: Project Path

Your project is in: `C:\Users\VARSHA B P\OneDrive\Desktop\...`

**Problems:**
- ❌ Spaces in path ("VARSHA B P")
- ❌ OneDrive sync can interfere
- ❌ Long path can cause issues

## 🚀 Solutions (Try in Order)

### Solution 1: Try Build Again (Quick Test)
The `.easignore` file should help. Try:
```bash
eas build --profile preview --platform android
```

### Solution 2: Move Project (Recommended)
Move to a path without spaces:

```powershell
# 1. Create new directory
New-Item -ItemType Directory -Path "C:\projects" -Force

# 2. Copy project (exclude node_modules)
xcopy "C:\Users\VARSHA B P\OneDrive\Desktop\project005\relapse-tracker" "C:\projects\relapse-tracker" /E /I /EXCLUDE:exclude.txt

# Create exclude.txt with:
# node_modules
# .expo
# .git

# 3. Navigate to new location
cd C:\projects\relapse-tracker

# 4. Install dependencies
npm install

# 5. Try build
eas build --profile preview --platform android
```

### Solution 3: Use GitHub (Best Practice)
1. **Initialize Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub:**
   - Create repo on GitHub
   - Push your code

3. **Build from GitHub:**
   EAS can build directly from GitHub, avoiding local path issues.

### Solution 4: Clean Build
```bash
# Remove node_modules
Remove-Item -Recurse -Force node_modules

# Clear Expo cache
Remove-Item -Recurse -Force .expo

# Reinstall
npm install

# Try build
eas build --profile preview --platform android
```

## 📋 What's in .easignore

The `.easignore` file now excludes:
- ✅ node_modules (will be installed fresh)
- ✅ Build artifacts
- ✅ Large files
- ✅ Documentation
- ✅ OneDrive sync files

## 🎯 Quick Fix Command

Try this first:
```bash
# Clean and rebuild
Remove-Item -Recurse -Force node_modules, .expo -ErrorAction SilentlyContinue
npm install
eas build --profile preview --platform android
```

## ⚠️ If Still Failing

Check the full error log:
```bash
eas build:list
```

Look for more specific error messages in the build logs on expo.dev.

## 💡 Recommended: Use GitHub

The best long-term solution:
1. Push code to GitHub
2. EAS builds from GitHub URL
3. No local path issues
4. Better version control

Would you like help setting up GitHub integration?

