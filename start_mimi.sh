#!/bin/bash

# Navigate to Project Root
cd ~/Documents/GitHub/mimi

echo "🚀 Launching Mimi Finance System..."

# Tab 1: Start Backend (FastAPI on Port 8000)
osascript -e 'tell application "Terminal" to do script "cd ~/Documents/GitHub/mimi/server && python3 -m uvicorn app.main:app --reload --port 8000"'

# Tab 2: Start Frontend (React on Port 3000)
osascript -e 'tell application "Terminal" to do script "cd ~/Documents/GitHub/mimi/client && npm start"'

echo "✅ Terminals started! Check the new windows."
