==================================
  Crop Risk Assessment System
==================================

QUICK START:
------------
Double-click "START_APP.bat" to launch the application


WHAT YOU NEED:
--------------
✓ Python installed (check with: python --version)
✓ Node.js installed (check with: node --version)
✓ Dependencies installed (see QUICK_START.md)


WHAT TO EXPECT:
---------------
When you run START_APP.bat:

1. Backend window opens (Flask server)
2. Frontend opens in your browser (http://localhost:3000)

⚠️ EXPECTED WARNINGS (Safe to ignore):
   - MongoDB connection failed (Normal - optional service)
   - AWS SDK not available (Normal - optional service)  
   - Google Cloud SDK not available (Normal - optional service)
   - Cassandra driver not available (Normal - Python 3.13 compatibility)

✅ FIRST TIME SETUP:
   On the first run, you'll see "Training new model..." 
   This is normal and will take about 30-60 seconds.
   
   After training completes, the model will be saved
   and subsequent starts will be much faster!

The app will work perfectly for risk assessments even with these warnings!


STOPPING THE APP:
-----------------
1. Press Ctrl+C in the frontend window
2. Close the backend window (or press Ctrl+C in it)


NEED HELP?
----------
See QUICK_START.md for detailed instructions and troubleshooting.

