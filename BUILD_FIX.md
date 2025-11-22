# Fixing EAS Build Tar Extraction Error

## Error
```
tar -C /home/expo/workingdir/build --strip-components 1 -zxf /home/expo/workingdir/project.tar.gz exited with non-zero code: 2
```

## Common Causes & Solutions

### ✅ Solution 1: Created .easignore File
I've created a `.easignore` file to exclude unnecessary files from the build.

### ✅ Solution 2: Check Your Project Path
Your project is in: `C:\Users\VARSHA B P\OneDrive\Desktop\project005\relapse-tracker`

**Issue:** Spaces in path ("VARSHA B P") and OneDrive sync can cause problems.

**Fix Options:**

#### Option A: Move Project (Recommended)
Move project to a path without spaces:
```bash
# Move to simpler path
C:\projects\relapse-tracker
```

#### Option B: Use Git (Better)
1. Initialize git in current location
2. Push to GitHub
3. Clone to simpler path
4. Build from there

### ✅ Solution 3: Clean Build
```bash
# Clear Expo cache
npx expo start --clear

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Try build again
eas build --profile preview --platform android
```

### ✅ Solution 4: Check File Permissions
OneDrive might be syncing files incorrectly. Try:
1. Pause OneDrive sync temporarily
2. Run the build
3. Resume sync after

### ✅ Solution 5: Use Git Repository
Instead of uploading from OneDrive folder:

1. **Initialize Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub:**
   ```bash
   # Create repo on GitHub, then:
   git remote add origin https://github.com/yourusername/relapse-tracker.git
   git push -u origin main
   ```

3. **Build from GitHub:**
   EAS can build directly from GitHub, avoiding path issues.

### ✅ Solution 6: Update EAS Config
Add to `eas.json`:
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  }
}
```

## Quick Fix Steps

1. **Try building again with .easignore:**
   ```bash
   eas build --profile preview --platform android
   ```

2. **If still fails, move project:**
   ```bash
   # Create new directory
   mkdir C:\projects
   
   # Copy project (not from OneDrive)
   xcopy "C:\Users\VARSHA B P\OneDrive\Desktop\project005\relapse-tracker" "C:\projects\relapse-tracker" /E /I
   
   # Navigate to new location
   cd C:\projects\relapse-tracker
   
   # Install dependencies
   npm install
   
   # Try build
   eas build --profile preview --platform android
   ```

3. **Alternative: Use GitHub:**
   - Push code to GitHub
   - EAS can build from GitHub URL
   - Avoids local path issues

## What I Fixed

✅ Created `.easignore` to exclude:
- node_modules
- Large files
- Build artifacts
- Documentation files
- OneDrive sync files

## Next Steps

1. **Try build again:**
   ```bash
   eas build --profile preview --platform android
   ```

2. **If it still fails:**
   - Move project to path without spaces
   - Or push to GitHub and build from there

3. **Check build logs:**
   ```bash
   eas build:list
   ```

Let me know if the build succeeds or if you see a different error!

