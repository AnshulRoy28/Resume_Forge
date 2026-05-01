# Docker Quick Reference Card 🐳

## 🚀 Start/Stop

```bash
# Start application
docker-compose up -d

# Stop application
docker-compose down

# Restart application
docker-compose restart

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

## 📊 Monitoring

```bash
# View logs (live)
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# Check status
docker ps

# Check health
docker inspect --format='{{.State.Health.Status}}' resumeforge-app

# Resource usage
docker stats resumeforge-app
```

## 🔧 Maintenance

```bash
# Rebuild after code changes
docker-compose up -d --build

# Access container shell
docker-compose exec resumeforge sh

# Run commands in container
docker-compose exec resumeforge npm run migrate

# View environment variables
docker-compose exec resumeforge env
```

## 💾 Database

```bash
# Backup
docker cp resumeforge-app:/app/data/resumeforge.db ./backup.db

# Restore
docker cp ./backup.db resumeforge-app:/app/data/resumeforge.db
docker-compose restart

# Reset (⚠️ deletes all data)
docker-compose exec resumeforge npm run reset-db
docker-compose restart

# Check database
docker-compose exec resumeforge ls -lh /app/data/
```

## 🐛 Troubleshooting

```bash
# View errors
docker-compose logs resumeforge

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build

# Check if port is in use (Windows)
netstat -ano | findstr :3000

# Check if port is in use (Linux/Mac)
lsof -i :3000

# Remove all containers and images
docker system prune -a
```

## 🌐 Access

```
Application: http://localhost:3000
API Health: http://localhost:3000/api/auth/me
```

## 📁 Files

```
Dockerfile              - Production container
Dockerfile.dev          - Development container
docker-compose.yml      - Production orchestration
docker-compose.dev.yml  - Development orchestration
.dockerignore          - Build exclusions
.env                   - Environment variables
```

## 🔑 Environment Variables

```env
JWT_SECRET=<64-char-hex>     # Required
GITHUB_TOKEN=<token>         # Optional
PORT=3000                    # Optional
NODE_ENV=production          # Optional
```

## 📦 Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect amd_resumeforge-data

# Backup volume
docker run --rm -v amd_resumeforge-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Restore volume
docker run --rm -v amd_resumeforge-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```

## 🚀 Development Mode

```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up

# Stop dev mode
docker-compose -f docker-compose.dev.yml down

# Rebuild dev
docker-compose -f docker-compose.dev.yml up --build
```

## 🔒 Security

```bash
# Scan for vulnerabilities
docker scan amd-resumeforge

# Check for updates
docker pull node:20-alpine
docker-compose up -d --build

# View security info
docker inspect amd-resumeforge
```

## 📈 Scaling

```bash
# Scale to 3 instances
docker-compose up -d --scale resumeforge=3

# Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml resumeforge
docker service scale resumeforge_resumeforge=3
```

## 🌍 Deploy to Cloud

### AWS ECS
```bash
docker build -t resumeforge .
docker tag resumeforge:latest <account>.dkr.ecr.<region>.amazonaws.com/resumeforge:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/resumeforge:latest
```

### Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/<project>/resumeforge
gcloud run deploy resumeforge --image gcr.io/<project>/resumeforge
```

### Azure
```bash
az acr build --registry <registry> --image resumeforge:latest .
az container create --resource-group <rg> --name resumeforge --image <registry>.azurecr.io/resumeforge:latest
```

## 📚 Documentation

- [DOCKER_SUCCESS.md](./DOCKER_SUCCESS.md) - Success guide
- [DOCKER_FIXES.md](./DOCKER_FIXES.md) - Technical fixes
- [README_DOCKER.md](./README_DOCKER.md) - Quick start
- [docs/DOCKER_GUIDE.md](./docs/DOCKER_GUIDE.md) - Complete guide
- [docs/DOCKER_ARCHITECTURE.md](./docs/DOCKER_ARCHITECTURE.md) - Architecture

## 🆘 Help

```bash
# Docker help
docker --help
docker-compose --help

# Container help
docker-compose exec resumeforge npm run --help

# View all commands
docker-compose exec resumeforge npm run
```

---

**Quick Access:** http://localhost:3000
**Status Check:** `docker ps`
**View Logs:** `docker-compose logs -f`
