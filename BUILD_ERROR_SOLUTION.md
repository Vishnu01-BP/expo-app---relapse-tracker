# Fix Build Error - Step by Step

## The Problem
The tar extraction error is caused by **spaces in your project path**: `C:\Users\VARSHA B P\...`

EAS has trouble with spaces when creating the tar archive.

## ✅ Solution 1: Move Project (Quick Fix)

I've created `C:\projects` for you. Now copy your project:

### Option A: Manual Copy (Easiest)
1. **Open File Explorer**
2. **Navigate to:** `C:\Users\VARSHA B P\OneDrive\Desktop\project005\relapse-tracker`
3. **Select all files** (Ctrl+A)
4. **Copy** (Ctrl+C)
5. **Navigate to:** `C:\projects`
6. **Create folder:** `relapse-tracker`
7. **Paste** (Ctrl+V)
8. **Open terminal in new location:**
   ```powershell
   cd C:\projects\relapse-tracker
   npm install
   eas build --profile preview --platform android
   ```

### Option B: PowerShell Copy
```powershell
# Copy project (excluding large folders)
$source = "C:\Users\VARSHA B P\OneDrive\Desktop\project005\relapse-tracker"
$dest = "C:\projects\relapse-tracker"

# Copy files
Copy-Item -Path "$source\*" -Destination $dest -Recurse -Exclude node_modules,.expo,web-build

# Navigate and install
cd C:\projects\relapse-tracker
npm install

# Try build
eas build --profile preview --platform android
```

---

## ✅ Solution 2: Use GitHub (Recommended - Best Practice)

This is the **best long-term solution** and avoids all path issues.

### Step 1: Initialize Git
```bash
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `relapse-tracker`
3. **Don't** initialize with README
4. Click "Create repository"

### Step 3: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/relapse-tracker.git
git branch -M main
git push -u origin main
```

### Step 4: Build from GitHub
EAS can build directly from GitHub! This completely avoids local path issues.

**In EAS Dashboard:**
- Go to https://expo.dev
- Create new build
- Select "GitHub" as source
- Enter your repo URL

Or use CLI:
```bash
eas build --profile preview --platform android --repo-url https://github.com/YOUR_USERNAME/relapse-tracker.git
```

---

## 🎯 Recommended: Use GitHub

**Why GitHub is better:**
- ✅ No path issues
- ✅ Version control
- ✅ Easy collaboration
- ✅ EAS builds directly from GitHub
- ✅ No need to move files

---

## Quick Test After Moving

Once you've moved the project:

```bash
# 1. Navigate to new location
cd C:\projects\relapse-tracker

# 2. Verify files
dir

# 3. Install dependencies
npm install

# 4. Test build
eas build --profile preview --platform android
```

---

## Which Solution Should You Use?

- **Quick fix:** Move project to `C:\projects\relapse-tracker`
- **Best practice:** Push to GitHub and build from there

I recommend **GitHub** - it's the standard way to deploy with EAS and avoids all these issues!

