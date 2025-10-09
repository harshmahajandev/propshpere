#!/bin/bash

# Diyar Property Management System - Quick Start Script

echo "🏗️  Starting Diyar Property Management System..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies first..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
    echo ""
fi

echo "🚀 Starting development servers..."
echo ""
echo "📱 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🔐 Demo Login Credentials:"
echo "   Sales Manager: admin@diyar.bh / password123"
echo "   Sales Rep:     sales@diyar.bh / password123"
echo ""
echo "⚡ Starting servers (Press Ctrl+C to stop)..."
echo ""

# Start the application
npm run dev