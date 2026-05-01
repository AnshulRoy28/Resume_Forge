#!/bin/bash

# ResumeForge Docker Quick Start Script

set -e

echo "🐳 ResumeForge Docker Setup"
echo "============================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    
    # Generate JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || openssl rand -hex 32)
    
    cat > .env << EOF
# JWT Secret (auto-generated)
JWT_SECRET=${JWT_SECRET}

# Optional: GitHub Token for private repos
GITHUB_TOKEN=

# Port (default: 3000)
PORT=3000

# Environment
NODE_ENV=production
EOF
    
    echo "✅ Created .env file with auto-generated JWT_SECRET"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Ask user which mode to run
echo "Select deployment mode:"
echo "1) Production (recommended)"
echo "2) Development (with hot reload)"
echo ""
read -p "Enter choice [1-2]: " choice

case $choice in
    2)
        echo ""
        echo "🚀 Starting in DEVELOPMENT mode..."
        echo ""
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    *)
        echo ""
        echo "🚀 Starting in PRODUCTION mode..."
        echo ""
        docker-compose up -d --build
        
        echo ""
        echo "✅ ResumeForge is starting!"
        echo ""
        echo "📊 Checking status..."
        sleep 3
        docker-compose ps
        
        echo ""
        echo "📝 View logs with:"
        echo "   docker-compose logs -f"
        echo ""
        echo "🌐 Access the application at:"
        echo "   http://localhost:3000"
        echo ""
        echo "🛑 Stop the application with:"
        echo "   docker-compose down"
        echo ""
        ;;
esac
