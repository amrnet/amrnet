#!/bin/bash

# AMRnet Development Startup Script
echo "🚀 Starting AMRnet Development Environment"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this script from the AMRnet root directory"
    exit 1
fi

# Function to kill processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down AMRnet..."

    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "🔚 Backend server stopped"
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "🔚 Frontend server stopped"
    fi

    echo "👋 AMRnet shutdown complete"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

echo "🔧 Starting backend server..."
# Start the server in background
node server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo "🎨 Starting frontend development server..."
# Start the frontend in background
cd client
npm run start:no-lint &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

echo ""
echo "✅ AMRnet is now running!"
echo "📊 Backend API: http://localhost:8080"
echo "🌐 Frontend App: http://localhost:3000"
echo "🔍 Health Check: http://localhost:8080/api/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=========================================="

# Keep script running until interrupted
wait
