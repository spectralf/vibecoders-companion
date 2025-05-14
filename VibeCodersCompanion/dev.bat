@echo off
setlocal enabledelayedexpansion
title Vibe Coder's Companion - Developer Console
color 0A

:: Set the virtual environment path
set VENV_PATH=venv

:MENU
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║             VIBE CODER'S COMPANION - DEV CONSOLE             ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo  [1] Setup Environment
echo  [2] Run Application
echo  [3] Install/Update Dependencies
echo  [4] Build Installer Package
echo  [5] Build Standalone Executable
echo  [6] Clean Build Files
echo  [7] Git Operations
echo  [8] Exit
echo.
echo ══════════════════════════════════════════════════════════════
echo.
set /p CHOICE="Enter your choice (1-8): "

if "%CHOICE%"=="1" goto SETUP
if "%CHOICE%"=="2" goto RUN
if "%CHOICE%"=="3" goto DEPENDENCIES
if "%CHOICE%"=="4" goto BUILD_INSTALLER
if "%CHOICE%"=="5" goto BUILD_STANDALONE
if "%CHOICE%"=="6" goto CLEAN
if "%CHOICE%"=="7" goto GIT
if "%CHOICE%"=="8" goto EXIT

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto MENU

:SETUP
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    SETUP ENVIRONMENT                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/
    echo.
    pause
    goto MENU
)

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    goto MENU
)

:: Check if virtual environment exists
if not exist %VENV_PATH% (
    echo Creating virtual environment...
    python -m venv %VENV_PATH%
    if %ERRORLEVEL% neq 0 (
        echo Failed to create virtual environment.
        pause
        goto MENU
    )
    echo Virtual environment created successfully.
) else (
    echo Virtual environment already exists.
)

:: Activate virtual environment
call %VENV_PATH%\Scripts\activate

:: Install basic Python dependencies
echo Installing basic Python dependencies...
pip install pyinstaller
pip install -U pyinstaller

echo Environment setup complete!
echo.
pause
goto MENU

:RUN
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    RUNNING APPLICATION                       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Activate virtual environment if it exists
if exist %VENV_PATH% (
    call %VENV_PATH%\Scripts\activate
)

:: Check if node_modules exists
if not exist node_modules (
    echo Node modules not found. Installing dependencies first...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Failed to install dependencies.
        pause
        goto MENU
    )
)

echo Starting the application...
echo.
echo The application will start in a new window.
echo You can close that window to return to this menu.
echo.
start cmd /c "npm start && pause"
echo.
pause
goto MENU

:DEPENDENCIES
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                 INSTALL/UPDATE DEPENDENCIES                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Activate virtual environment if it exists
if exist %VENV_PATH% (
    call %VENV_PATH%\Scripts\activate
)

echo [1] Install/Update Node.js dependencies
echo [2] Install/Update Python dependencies
echo [3] Install all dependencies
echo [4] Back to main menu
echo.
set /p DEP_CHOICE="Enter your choice (1-4): "

if "%DEP_CHOICE%"=="1" (
    echo Installing/Updating Node.js dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Failed to install Node.js dependencies.
    ) else (
        echo Node.js dependencies installed/updated successfully.
    )
    pause
    goto DEPENDENCIES
)

if "%DEP_CHOICE%"=="2" (
    echo Installing/Updating Python dependencies...
    pip install -U pyinstaller
    if %ERRORLEVEL% neq 0 (
        echo Failed to install Python dependencies.
    ) else (
        echo Python dependencies installed/updated successfully.
    )
    pause
    goto DEPENDENCIES
)

if "%DEP_CHOICE%"=="3" (
    echo Installing all dependencies...
    
    echo Installing Node.js dependencies...
    call npm install
    
    echo Installing Python dependencies...
    pip install -U pyinstaller
    
    echo All dependencies installed/updated.
    pause
    goto DEPENDENCIES
)

if "%DEP_CHOICE%"=="4" goto MENU

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto DEPENDENCIES

:BUILD_INSTALLER
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  BUILD INSTALLER PACKAGE                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Activate virtual environment if it exists
if exist %VENV_PATH% (
    call %VENV_PATH%\Scripts\activate
)

echo Building installer package...
echo This may take a few minutes, please be patient...
echo.

:: Check if node_modules exists
if not exist node_modules (
    echo Node modules not found. Installing dependencies first...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Failed to install dependencies.
        pause
        goto MENU
    )
)

:: Build the application
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error: Build failed.
    pause
    goto MENU
)

echo.
echo ===================================================
echo  SUCCESS! Installer package created!
echo ===================================================
echo.

:: Find the exact path of the created installer
set "INSTALLER_EXE="
for /f "delims=" %%i in ('dir /b /s "release\*Setup*.exe" 2^>nul') do set "INSTALLER_EXE=%%i"

if defined INSTALLER_EXE (
    echo File location: %INSTALLER_EXE%
    echo.
) else (
    echo Installer file not found. Please check the release directory manually.
    echo.
)

pause
goto MENU

:BUILD_STANDALONE
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                 BUILD STANDALONE EXECUTABLE                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Activate virtual environment if it exists
if exist %VENV_PATH% (
    call %VENV_PATH%\Scripts\activate
)

echo Building standalone executable...
echo This may take a few minutes, please be patient...
echo.

:: Create a temporary package.json with portable target configuration and remove custom icon
echo Creating temporary build configuration...
copy package.json package.json.backup >nul
node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); if (!pkg.build) pkg.build = {}; if (!pkg.build.win) pkg.build.win = {}; pkg.build.win.target = ['portable']; pkg.build.portable = { artifactName: '${productName}-Portable-${version}.${ext}' }; delete pkg.build.icon; delete pkg.build.win.icon; delete pkg.build.mac.icon; delete pkg.build.linux.icon; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

:: Build the application
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error: Build failed.
    :: Restore original package.json
    copy package.json.backup package.json >nul
    del package.json.backup >nul
    pause
    goto MENU
)

:: Restore original package.json
copy package.json.backup package.json >nul
del package.json.backup >nul

echo.
echo ===================================================
echo  SUCCESS! Standalone executable created!
echo ===================================================
echo.

:: Find the exact path of the created executable
set "PORTABLE_EXE="
for /f "delims=" %%i in ('dir /b /s "release\*Portable*.exe" 2^>nul') do set "PORTABLE_EXE=%%i"
if not defined PORTABLE_EXE for /f "delims=" %%i in ('dir /b /s "release\win-unpacked\*.exe" 2^>nul') do set "PORTABLE_EXE=%%i"

if defined PORTABLE_EXE (
    echo File location: %PORTABLE_EXE%
    echo.
) else (
    echo Executable file not found. Please check the release directory manually.
    echo.
)

pause
goto MENU

:CLEAN
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                     CLEAN BUILD FILES                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Select files to clean:
echo [1] Clean dist folder
echo [2] Clean release folder
echo [3] Clean build folder
echo [4] Clean all build files
echo [5] Back to main menu
echo.
set /p CLEAN_CHOICE="Enter your choice (1-5): "

if "%CLEAN_CHOICE%"=="1" (
    echo Cleaning dist folder...
    if exist dist (
        rmdir /s /q dist
        echo Dist folder cleaned.
    ) else (
        echo Dist folder not found.
    )
    pause
    goto CLEAN
)

if "%CLEAN_CHOICE%"=="2" (
    echo Cleaning release folder...
    if exist release (
        rmdir /s /q release
        echo Release folder cleaned.
    ) else (
        echo Release folder not found.
    )
    pause
    goto CLEAN
)

if "%CLEAN_CHOICE%"=="3" (
    echo Cleaning build folder...
    if exist build (
        rmdir /s /q build
        echo Build folder cleaned.
    ) else (
        echo Build folder not found.
    )
    pause
    goto CLEAN
)

if "%CLEAN_CHOICE%"=="4" (
    echo Cleaning all build files...
    if exist dist rmdir /s /q dist
    if exist release rmdir /s /q release
    if exist build rmdir /s /q build
    echo All build files cleaned.
    pause
    goto CLEAN
)

if "%CLEAN_CHOICE%"=="5" goto MENU

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto CLEAN

:GIT
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      GIT OPERATIONS                          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/
    echo.
    pause
    goto MENU
)

echo [1] Initialize Git repository
echo [2] Add and commit changes
echo [3] Push to remote repository
echo [4] Pull from remote repository
echo [5] Check Git status
echo [6] Back to main menu
echo.
set /p GIT_CHOICE="Enter your choice (1-6): "

if "%GIT_CHOICE%"=="1" (
    echo Initializing Git repository...
    git init
    echo Git repository initialized.
    pause
    goto GIT
)

if "%GIT_CHOICE%"=="2" (
    echo Adding and committing changes...
    echo.
    echo Enter a commit message:
    set /p COMMIT_MSG="> "
    
    if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update application files
    
    git add .
    git commit -m "%COMMIT_MSG%"
    echo Changes committed.
    pause
    goto GIT
)

if "%GIT_CHOICE%"=="3" (
    echo Pushing to remote repository...
    git push
    echo Push completed.
    pause
    goto GIT
)

if "%GIT_CHOICE%"=="4" (
    echo Pulling from remote repository...
    git pull
    echo Pull completed.
    pause
    goto GIT
)

if "%GIT_CHOICE%"=="5" (
    echo Git status:
    echo.
    git status
    echo.
    pause
    goto GIT
)

if "%GIT_CHOICE%"=="6" goto MENU

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto GIT

:EXIT
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║                THANK YOU FOR USING DEV CONSOLE               ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Exiting...
timeout /t 2 >nul
exit

:EOF
