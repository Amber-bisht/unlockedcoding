# Docker Setup Guide for UnlockedCoding

## 🐳 Overview

This guide explains how to use Docker to run the UnlockedCoding application in both development and production environments.

## 📁 Docker Files Structure

```
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── docker-compose.yml      # Production services
├── docker-compose.dev.yml  # Development services
├── .dockerignore           # Files to exclude from build
└── docker/
    ├── nginx.conf          # Nginx reverse proxy configuration
    └── mongo-init.js       # MongoDB initialization script
```

## 🚀 Quick Start

### Development Environment

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Production Environment

```bash
# Start production environment
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop production environment
docker-compose down
```

## 🛠️ Development Setup

### Prerequisites
- Docker Desktop installed
- Docker Compose installed
- At least 4GB RAM available

### Step 1: Clone and Setup
```bash
git clone <repository-url>
cd UnlockedCoding
```

### Step 2: Environment Configuration
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:password123@localhost:27017/unlocked-coding-dev?authSource=admin
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### Step 3: Start Development Environment
```bash
# Build and start all services
docker-compose -f docker-compose.dev.yml up --build

# Or run in background
docker-compose -f docker-compose.dev.yml up -d --build
```

### Step 4: Access the Application
- **Application**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 🏭 Production Setup

### Prerequisites
- Docker and Docker Compose installed
- SSL certificates for HTTPS
- Domain name configured

### Step 1: SSL Certificates
Place your SSL certificates in `docker/ssl/`:
```
docker/ssl/
├── unlockedcoding.com.crt
└── unlockedcoding.com.key
```

### Step 2: Environment Configuration
Create a `.env` file for production:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/unlocked-coding?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=your_secure_jwt_secret_key_here
SESSION_SECRET=your_secure_session_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### Step 3: Start Production Environment
```bash
# Build and start all services
docker-compose up --build -d

# Check service status
docker-compose ps
```

### Step 4: Access the Application
- **Application**: https://unlockedcoding.com
- **Health Check**: https://unlockedcoding.com/health

## 🔧 Docker Commands

### Development Commands
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Execute commands in container
docker-compose -f docker-compose.dev.yml exec app npm run generate-seo
docker-compose -f docker-compose.dev.yml exec app npm run generate-ai

# Access MongoDB shell
docker-compose -f docker-compose.dev.yml exec mongodb mongosh

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Production Commands
```bash
# Start production environment
docker-compose up -d

# Rebuild and start
docker-compose up --build -d

# View logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3

# Backup database
docker-compose exec mongodb mongodump --out /data/backup

# Stop production environment
docker-compose down
```

### General Docker Commands
```bash
# List running containers
docker ps

# View container logs
docker logs <container_name>

# Execute shell in container
docker exec -it <container_name> sh

# Remove all containers and images
docker system prune -a

# View resource usage
docker stats
```

## 📊 Services Overview

### Development Services
- **app**: UnlockedCoding application (development mode)
- **mongodb**: MongoDB database
- **redis**: Redis cache

### Production Services
- **app**: UnlockedCoding application (production mode)
- **mongodb**: MongoDB database
- **redis**: Redis cache
- **nginx**: Reverse proxy with SSL termination

## 🔒 Security Features

### Production Security
- **SSL/TLS**: HTTPS encryption
- **Rate Limiting**: API and auth rate limiting
- **Security Headers**: XSS protection, HSTS, etc.
- **Container Security**: Non-root user execution
- **Network Isolation**: Docker networks

### Environment Variables
- **JWT_SECRET**: Secure JWT signing key
- **SESSION_SECRET**: Secure session encryption
- **MONGODB_URI**: Database connection with authentication
- **REDIS_URL**: Cache connection

## 📈 Performance Optimization

### Production Optimizations
- **Multi-stage Build**: Smaller production images
- **Gzip Compression**: Reduced bandwidth usage
- **Static File Caching**: Better performance
- **Load Balancing**: Multiple app instances
- **Database Indexing**: Optimized queries

### Monitoring
```bash
# Monitor resource usage
docker stats

# View application logs
docker-compose logs -f app

# Check database performance
docker-compose exec mongodb mongosh --eval "db.stats()"
```

## 🗄️ Database Management

### MongoDB Operations
```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh

# Backup database
docker-compose exec mongodb mongodump --out /data/backup

# Restore database
docker-compose exec mongodb mongorestore /data/backup

# View database stats
docker-compose exec mongodb mongosh --eval "db.stats()"
```

### Redis Operations
```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# Monitor Redis
docker-compose exec redis redis-cli monitor

# Clear Redis cache
docker-compose exec redis redis-cli flushall
```

## 🔄 Deployment Workflow

### Development Workflow
1. **Code Changes**: Edit code locally
2. **Hot Reload**: Changes automatically reflected
3. **Testing**: Test in development environment
4. **Commit**: Commit changes to version control

### Production Deployment
1. **Build**: `docker-compose build`
2. **Test**: Run tests in staging environment
3. **Deploy**: `docker-compose up -d`
4. **Monitor**: Check logs and performance
5. **Rollback**: If needed, rollback to previous version

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
docker-compose up -d -p 5001:5000
```

#### Database Connection Issues
```bash
# Check MongoDB status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Restart MongoDB
docker-compose restart mongodb
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Increase Docker memory limit in Docker Desktop
# Settings > Resources > Memory > 4GB
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in docker/ssl/unlockedcoding.com.crt -text -noout

# Verify certificate chain
openssl verify docker/ssl/unlockedcoding.com.crt
```

### Log Analysis
```bash
# View application logs
docker-compose logs app

# View nginx logs
docker-compose logs nginx

# View MongoDB logs
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f
```

## 📚 Additional Resources

### Docker Documentation
- [Docker Official Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### MongoDB with Docker
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [MongoDB Docker Guide](https://docs.mongodb.com/manual/installation/)

### Nginx Configuration
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)

### Security Best Practices
- [Docker Security](https://docs.docker.com/engine/security/)
- [OWASP Docker Security](https://owasp.org/www-project-docker-security/)

## 🎯 Next Steps

1. **Customize Configuration**: Modify environment variables and settings
2. **Add Monitoring**: Implement application monitoring and alerting
3. **Backup Strategy**: Set up automated database backups
4. **CI/CD Pipeline**: Integrate with GitHub Actions or similar
5. **Load Testing**: Test application performance under load
6. **Security Audit**: Regular security assessments

This Docker setup provides a robust foundation for running UnlockedCoding in both development and production environments with proper security, performance, and scalability features. 