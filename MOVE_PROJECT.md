# Move Project to Fix Build Error

## The Problem
Your project path has spaces: `C:\Users\VARSHA B P\OneDrive\Desktop\...`

This causes tar extraction errors in EAS builds.

## Solution: Move Project

### Step 1: Create New Directory
```powershell
New-Item -ItemType Directory -Path "C:\projects" -Force
```

### Step 2: Copy Project Files
```powershell
# Copy everything except node_modules and .expo
robocopy "C:\Users\VARSHA B P\OneDrive\Desktop\project005\relapse-tracker" "C:\projects\relapse-tracker" /E /XD node_modules .expo .git /XF package-lock.json
```

### Step 3: Navigate to New Location
```powershell
cd C:\projects\relapse-tracker
```

### Step 4: Install Dependencies
```powershell
npm install
```

### Step 5: Try Build Again
```powershell
eas build --profile preview --platform android
```

## Alternative: Use GitHub (Recommended)

This is the best long-term solution:

1. **Initialize Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repo:**
   - Go to github.com
   - Create new repository
   - Don't initialize with README

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/relapse-tracker.git
   git branch -M main
   git push -u origin main
   ```

4. **Build from GitHub:**
   EAS can build directly from GitHub, avoiding all path issues.

