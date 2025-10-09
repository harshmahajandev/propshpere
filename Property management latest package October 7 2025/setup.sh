#!/bin/bash

# Diyar Property Management System - Quick Setup Script

echo "🏗️  Setting up Diyar Property Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ $NODE_VERSION -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating environment configuration..."
    cp .env .env.local 2>/dev/null || true
fi

echo "✅ Environment configuration ready"

# Create necessary directories
mkdir -p public/uploads
mkdir -p backend/logs

echo "✅ Directory structure created"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
echo ""
echo "📱 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🔐 Demo Login Credentials:"
echo "   Sales Manager: admin@diyar.bh / password123"
echo "   Sales Rep:     sales@diyar.bh / password123"
echo ""
echo "📚 For more information, see README.md"
echo ""