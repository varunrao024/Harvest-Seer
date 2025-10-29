@echo off
echo ===================================
echo  Harvest Seer - GitHub Upload Guide
echo ===================================
echo.
echo This guide will help you upload your Harvest Seer project to GitHub
echo.

echo Step 1: Install Git (if not already installed)
echo ================================================
echo 1. Go to: https://git-scm.com/download/win
echo 2. Download and install Git for Windows
echo 3. Restart your command prompt after installation
echo.

echo Step 2: Create GitHub Account (if needed)
echo ==========================================
echo 1. Go to: https://github.com
echo 2. Click "Sign up" and create your account
echo 3. Verify your email address
echo.

echo Step 3: Upload Your Project
echo ============================
echo Choose ONE of these methods:
echo.
echo METHOD A: Using GitHub Desktop (EASIEST)
echo -----------------------------------------
echo 1. Download GitHub Desktop: https://desktop.github.com/
echo 2. Install and sign in to your GitHub account
echo 3. Click "Add an Existing Repository from your Hard Drive"
echo 4. Select this folder: %CD%
echo 5. Click "Publish repository"
echo 6. Choose repository name (e.g., "harvest-seer")
echo 7. Make it public or private
echo 8. Click "Publish Repository"
echo.

echo METHOD B: Using Command Line
echo -----------------------------
echo 1. Open Command Prompt in this folder
echo 2. Run these commands one by one:
echo.
echo    git init
echo    git add .
echo    git commit -m "Initial commit - Harvest Seer project"
echo.
echo 3. Go to GitHub.com and create a new repository
echo 4. Copy the repository URL (e.g., https://github.com/username/harvest-seer.git)
echo 5. Run these commands (replace URL with your actual repository URL):
echo.
echo    git remote add origin https://github.com/username/harvest-seer.git
echo    git branch -M main
echo    git push -u origin main
echo.

echo Step 4: Verify Upload
echo =====================
echo 1. Go to your GitHub profile
echo 2. Find your new repository
echo 3. Check that all files are uploaded correctly
echo 4. The README.md should display on the main page
echo.

echo ===================================
echo  Troubleshooting
echo ===================================
echo.
echo If you get "git is not recognized":
echo - Make sure Git is installed
echo - Restart Command Prompt
echo - Try using GitHub Desktop instead
echo.
echo If upload fails:
echo - Check your internet connection
echo - Verify GitHub credentials
echo - Try creating repository manually on GitHub first
echo.

echo ===================================
echo  Your Project is Ready!
echo ===================================
echo.
echo Files created for GitHub:
echo - README.md (project documentation)
echo - .gitignore (excludes unnecessary files)
echo - All your Harvest Seer source code
echo.
echo After uploading, your project will be available at:
echo https://github.com/yourusername/harvest-seer
echo.
pause
