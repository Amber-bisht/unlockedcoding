#!/bin/bash

# Production Deployment Script for UnlockedCoding

set -e

echo "🚀 Starting production deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp env.production.example .env
    echo "📝 Please edit .env file with your production values before continuing"
    echo "   - Update JWT_SECRET and SESSION_SECRET"
    echo "   - Update MONGODB_URI"
    echo "   - Update OAuth callback URLs"
    exit 1
fi

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t unlockedcoding:prod .

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Start the application
echo "▶️  Starting application..."
docker-compose up -d

# Wait for the application to be ready
echo "⏳ Waiting for application to be ready..."
sleep 10

# Check health
echo "🏥 Checking application health..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Application is healthy!"
    echo "🌐 Your application is running at: http://localhost:5000"
    echo "📊 Health check: http://localhost:5000/health"
else
    echo "❌ Application health check failed"
    echo "📋 Checking logs..."
    docker-compose logs app
    exit 1
fi

echo "🎉 Production deployment completed successfully!" 