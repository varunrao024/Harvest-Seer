# Quick Start Guide - Running Without Shortcut

## Prerequisites
Make sure you have:
- Python 3.8+ installed
- Node.js 18+ installed
- npm installed

## Installation

### 1. Install Python Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

If you encounter issues installing pandas on Windows, try:
```powershell
pip install pandas --prefer-binary
```

### 2. Install Node.js Dependencies
```powershell
cd ..  # Go back to root directory
npm install
```

## Running the Application

### Option 1: Using the Batch File Shortcut (Recommended)

Simply double-click `START_APP.bat` in the root directory. This will:
- Start the backend server in a separate window
- Start the frontend server in the current window
- Display helpful information about optional services

### Option 2: Using Two Terminal Windows

**Terminal 1 - Start Backend:**
```powershell
cd backend
python app.py
```

**Terminal 2 - Start Frontend:**
```powershell
npm run dev
```

### Option 3: Using PowerShell Background Jobs

In a single PowerShell terminal:
```powershell
# Start backend in background
cd backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python app.py"

# Go back to root and start frontend
cd ..
npm run dev
```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Important Notes

### Optional Services
The following services are **optional** and the app will run without them:
- **MongoDB** - Database for storing risk assessments
- **Cassandra** - Alternative database
- **AWS SDK** - Cloud storage and services
- **Google Cloud SDK** - Cloud storage and services

You'll see warnings if these aren't available, but the app will continue to function. These services are only needed for:
- Storing historical data
- Backing up data to cloud storage
- Advanced analytics features

### Core Features (Always Available)
The app will work without optional services for:
- ✅ Risk assessment calculations
- ✅ Crop selection and information
- ✅ Environmental data simulation
- ✅ Risk recommendations
- ✅ Frontend UI and visualizations

## Troubleshooting

### Backend won't start
1. Check if port 5000 is already in use
2. Make sure all Python dependencies are installed
3. Verify you're in the `backend` directory when starting the backend

### Frontend won't start
1. Check if port 3000 is already in use
2. Make sure `npm install` completed successfully
3. Try deleting `node_modules` and running `npm install` again

### MongoDB connection failed (Expected)
This is normal if you don't have MongoDB installed. The app will still work for risk assessments.

### AWS SDK not available (Expected)
This is normal if you don't have boto3 installed. The app will work without cloud backups.

## Stopping the Application

Press `Ctrl+C` in each terminal window to stop the services.
