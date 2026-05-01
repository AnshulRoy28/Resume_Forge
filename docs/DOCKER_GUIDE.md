# Docker Deployment Guide 🐳

Complete guide for running ResumeForge in Docker containers.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Production Deployment](#production-deployment)
- [Development Setup](#development-setup)
- [Configuration](#configuration)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Run with Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/AnshulRoy28/Resume_Forge.git
cd Resume_Forge

# 2. Create .env file
cat > .env << EOF
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
GITHUB_TOKEN=your_github_token_optional
EOF

# 3. Start the application
docker-compose up -d

# 4. Check logs
docker-compose logs -f

# 5. Access the application
# Open http://localhost:3000
```

### Run with Docker CLI

```bash
# 1. Build the image
docker build -t resumeforge:latest .

# 2. Run the container
docker run -d \
  --name resumeforge \
  -p 3000:3000 \
  -e JWT_SECRET="your-secure-32-char-secret" \
  -v resumeforge-data:/app/data \
  resumeforge:latest

# 3. Check logs
docker logs -f resumeforge

# 4. Access the application
# Open http://localhost:3000
```

## 🏭 Production Deployment

### Using Docker Compose (Production)

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f resumeforge

# Stop the application
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Required
JWT_SECRET=your-secure-32-char-secret-here

# Optional
GITHUB_TOKEN=github_pat_your_token_here
PORT=3000
NODE_ENV=production
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Health Checks

The container includes automatic health checks:

```bash
# Check container health
docker ps

# Manual health check
docker exec resumeforge-app node -e "require('http').get('http://localhost:3000/api/auth/me', (r) => {console.log('Status:', r.statusCode)})"
```

### Persistent Data

Database is stored in a Docker volume:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect resumeforge_resumeforge-data

# Backup database
docker cp resumeforge-app:/app/resumeforge.db ./backup-$(date +%Y%m%d).db

# Restore database
docker cp ./backup.db resumeforge-app:/app/resumeforge.db
docker-compose restart
```

## 🛠️ Development Setup

### Using Development Compose File

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Features in Development Mode

- ✅ Hot reload on code changes
- ✅ Source code mounted as volume
- ✅ All dependencies installed (including dev)
- ✅ Logs visible in console
- ✅ Separate database volume

### Development Workflow

```bash
# 1. Start development container
docker-compose -f docker-compose.dev.yml up

# 2. Make code changes (auto-reloads)

# 3. Run database migrations
docker-compose -f docker-compose.dev.yml exec resumeforge-dev npm run migrate

# 4. Reset database
docker-compose -f docker-compose.dev.yml exec resumeforge-dev npm run reset-db

# 5. Access shell
docker-compose -f docker-compose.dev.yml exec resumeforge-dev sh
```

## ⚙️ Configuration

### Port Mapping

Change the exposed port in `docker-compose.yml`:

```yaml
services:
  resumeforge:
    ports:
      - "8080:3000"  # Access on port 8080
```

### Resource Limits

Add resource constraints:

```yaml
services:
  resumeforge:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Networking

Connect to existing networks:

```yaml
networks:
  resumeforge-network:
    external: true
    name: my-existing-network
```

## 🗄️ Database Management

### Backup Database

```bash
# Backup to local file
docker-compose exec resumeforge sh -c 'sqlite3 resumeforge.db ".backup /tmp/backup.db"'
docker cp resumeforge-app:/tmp/backup.db ./backup-$(date +%Y%m%d).db

# Or use volume backup
docker run --rm \
  -v resumeforge_resumeforge-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/resumeforge-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Database

```bash
# Restore from local file
docker cp ./backup.db resumeforge-app:/app/resumeforge.db
docker-compose restart

# Or restore volume
docker run --rm \
  -v resumeforge_resumeforge-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/resumeforge-backup.tar.gz"
docker-compose restart
```

### Reset Database

```bash
# Reset to fresh state
docker-compose exec resumeforge npm run reset-db
docker-compose restart
```

### Run Migrations

```bash
# Run database migrations
docker-compose exec resumeforge npm run migrate
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs resumeforge

# Check container status
docker ps -a

# Inspect container
docker inspect resumeforge-app

# Check environment variables
docker-compose exec resumeforge env
```

### Database Issues

```bash
# Check database file
docker-compose exec resumeforge ls -lh resumeforge.db

# Check database integrity
docker-compose exec resumeforge sqlite3 resumeforge.db "PRAGMA integrity_check;"

# Reset database
docker-compose exec resumeforge npm run reset-db
docker-compose restart
```

### Permission Issues

```bash
# Fix file permissions
docker-compose exec resumeforge chown -R node:node /app

# Check user
docker-compose exec resumeforge whoami
```

### Network Issues

```bash
# Check network
docker network ls
docker network inspect resumeforge_resumeforge-network

# Test connectivity
docker-compose exec resumeforge wget -O- http://localhost:3000/api/auth/me
```

### Build Issues

```bash
# Clean build
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Remove all containers and volumes
docker-compose down -v
docker system prune -a
```

### Performance Issues

```bash
# Check resource usage
docker stats resumeforge-app

# Check logs for errors
docker-compose logs --tail=100 resumeforge

# Restart container
docker-compose restart
```

## 🔧 Advanced Usage

### Multi-Stage Builds

Optimize image size with multi-stage builds (already implemented in Dockerfile):

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["npm", "start"]
```

### Docker Secrets

Use Docker secrets for sensitive data:

```bash
# Create secret
echo "your-jwt-secret" | docker secret create jwt_secret -

# Use in compose
services:
  resumeforge:
    secrets:
      - jwt_secret
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret

secrets:
  jwt_secret:
    external: true
```

### Reverse Proxy (Nginx)

Add Nginx reverse proxy:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - resumeforge
    networks:
      - resumeforge-network
```

### Docker Swarm

Deploy to Docker Swarm:

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml resumeforge

# Check services
docker service ls

# Scale service
docker service scale resumeforge_resumeforge=3

# Remove stack
docker stack rm resumeforge
```

## 📊 Monitoring

### Container Logs

```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f resumeforge
```

### Health Status

```bash
# Check health
docker inspect --format='{{.State.Health.Status}}' resumeforge-app

# Health log
docker inspect --format='{{json .State.Health}}' resumeforge-app | jq
```

### Resource Usage

```bash
# Real-time stats
docker stats resumeforge-app

# Export stats
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" > stats.txt
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t resumeforge:latest .
      
      - name: Run tests
        run: docker run resumeforge:latest npm test
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push resumeforge:latest
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best Practices for Node.js in Docker](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose exec resumeforge env`
3. Check database: `docker-compose exec resumeforge ls -lh resumeforge.db`
4. Open an issue: [GitHub Issues](https://github.com/AnshulRoy28/Resume_Forge/issues)

---

**Made with ❤️ for containerized deployments**
