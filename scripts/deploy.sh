#!/bin/bash

# ResumeForge Deployment Script
# This script helps prepare and deploy ResumeForge

echo "🚀 ResumeForge Deployment Helper"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Initializing..."
    git init
    git branch -M main
fi

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating template..."
    cat > .env << EOF
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
PORT=3000
NODE_ENV=development
EOF
    echo "✅ .env file created with generated JWT_SECRET"
    echo "   Please review and update if needed"
else
    echo "✅ .env file exists"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies installed"
fi

# Check if database exists
if [ ! -f resumeforge.db ]; then
    echo "🗄️  Creating database..."
    npm run reset-db
else
    echo "✅ Database exists"
fi

# Run tests
echo ""
echo "🧪 Testing server..."
timeout 3 npm start &
SERVER_PID=$!
sleep 2

if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server starts successfully"
    kill $SERVER_PID 2>/dev/null
else
    echo "❌ Server failed to start. Check logs above."
    exit 1
fi

# Git status
echo ""
echo "📊 Git Status:"
git status --short

# Prompt for commit
echo ""
read -p "Ready to commit and push? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter commit message: " COMMIT_MSG
    
    git add .
    git commit -m "$COMMIT_MSG"
    
    # Check if remote exists
    if git remote | grep -q origin; then
        echo "📤 Pushing to GitHub..."
        git push origin main
        echo "✅ Pushed to GitHub!"
    else
        echo "⚠️  No remote 'origin' found."
        echo "   Add remote with:"
        echo "   git remote add origin https://github.com/AnshulRoy28/Resume_Forge.git"
        echo "   git push -u origin main"
    fi
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Go to your deployment platform (Render, Railway, Heroku, etc.)"
echo "2. Connect your GitHub repository"
echo "3. Set environment variable: JWT_SECRET"
echo "4. Deploy!"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions."
