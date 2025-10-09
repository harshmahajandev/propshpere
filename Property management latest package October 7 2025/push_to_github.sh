#!/bin/bash

# Diyar Property Management - GitHub Push Script
# This script helps push the project to GitHub repository

echo "🏢 Diyar Property Management System - GitHub Push Script"
echo "======================================================="

# Configuration
REPO_URL="https://github.com/chiragushah/Diyar-Property-Management.git"
TOKEN="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"
USERNAME="chiragushah"

echo "📋 Repository: $REPO_URL"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git is installed"

# Set up Git configuration
echo "🔧 Configuring Git..."
git config --global user.name "$USERNAME"
git config --global user.email "chiragushah@example.com"

# Initialize repository if not already done
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Check current status
echo "📊 Current Git status:"
git status

# Add all files
echo "📁 Adding files to Git..."
git add .

# Create commit
echo "💾 Creating commit..."
read -p "Enter commit message (or press Enter for default): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Initial commit: Diyar Property Management System"
fi

git commit -m "$commit_message"

# Set up remote
echo "🌐 Setting up remote repository..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://$USERNAME:$TOKEN@github.com/chiragushah/Diyar-Property-Management.git"

# Create main branch and push
echo "🚀 Pushing to GitHub..."
git branch -M main

# Push to GitHub
if git push -u origin main; then
    echo ""
    echo "✅ Success! Your code has been pushed to GitHub!"
    echo "🌐 View your repository: https://github.com/chiragushah/Diyar-Property-Management"
    echo ""
    echo "🎉 Next Steps:"
    echo "   1. Visit your repository to verify the upload"
    echo "   2. Consider setting up GitHub Pages for easy deployment"
    echo "   3. Add collaborators if needed"
    echo "   4. Set up branch protection rules (optional)"
else
    echo ""
    echo "❌ Push failed. Please check the following:"
    echo "   1. Your internet connection"
    echo "   2. The personal access token permissions"
    echo "   3. Repository access rights"
    echo ""
    echo "💡 Alternative: Try the manual steps in PUSH_TO_GITHUB.md"
fi

echo ""
echo "📖 For detailed instructions, see: PUSH_TO_GITHUB.md"