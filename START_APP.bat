@echo off
echo ===================================
echo  Crop Risk Assessment System
echo ===================================
echo.
echo Starting application...
echo.
echo NOTE: The following services are optional:
echo  - MongoDB (will show warning if not available)
echo  - AWS SDK (will show warning if not available)
echo  - Google Cloud SDK (will show warning if not available)
echo.
echo These warnings are NORMAL and the app will still work!
echo.
echo FIRST RUN: Model training will take 30-60 seconds
echo Subsequent runs will be much faster!
echo ===================================
echo.

REM Start backend in a new window
echo Starting backend server on http://localhost:5000...
start "Crop Risk Backend Server" cmd /k "cd backend && python app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in current window
echo Starting frontend development server on http://localhost:3000...
echo.
echo ===================================
echo  Application is starting...
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo ===================================
echo.
echo Press Ctrl+C to stop the frontend server
echo Close the backend window to stop the backend server
echo.

npm run dev

