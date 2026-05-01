# ResumeForge Docker Quick Start 🐳

Run ResumeForge in Docker with one command!

## 🚀 Quick Start

### Option 1: Automated Script (Easiest)

**Linux/Mac:**
```bash
# Make script executable
chmod +x docker-start.sh

# Run the script
./docker-start.sh
```

**Windows:**
```cmd
# Run the batch script
docker-start.bat
```

The script will:
- ✅ Check Docker installation
- ✅ Generate `.env` file with secure JWT secret
- ✅ Let you choose production or development mode
- ✅ Build and start the containers
- ✅ Show you how to access the app

### Option 2: Manual Setup

```bash
# 1. Create .env file
cat > .env << EOF
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
GITHUB_TOKEN=your_token_optional
EOF

# 2. Start the application
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Access at http://localhost:3000
```

## 📋 Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

**Install Docker:**
- Windows/Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)

## 🎯 What's Included

- ✅ **Production-ready** Dockerfile with optimized Node.js image
- ✅ **Development** Dockerfile with hot reload
- ✅ **Docker Compose** for easy orchestration
- ✅ **Persistent database** using Docker volumes
- ✅ **Health checks** for container monitoring
- ✅ **Automatic restart** on failure
- ✅ **Environment variables** for configuration

## 🛠️ Common Commands

```bash
# Start in production mode
docker-compose up -d

# Start in development mode (hot reload)
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Check container status
docker-compose ps

# Access container shell
docker-compose exec resumeforge sh

# Backup database
docker cp resumeforge-app:/app/data/resumeforge.db ./backup.db

# Restore database
docker cp ./backup.db resumeforge-app:/app/data/resumeforge.db
docker-compose restart
```

## 🔧 Configuration

### Environment Variables

Edit `.env` file:

```env
# Required: JWT secret for authentication
JWT_SECRET=your-secure-32-char-secret

# Optional: GitHub token for private repos
GITHUB_TOKEN=github_pat_your_token

# Optional: Change port
PORT=3000

# Optional: Environment
NODE_ENV=production
```

### Change Port

Edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Access on port 8080 instead
```

## 📊 Monitoring

```bash
# View real-time logs
docker-compose logs -f

# Check container health
docker ps

# View resource usage
docker stats resumeforge-app

# Check health status
docker inspect --format='{{.State.Health.Status}}' resumeforge-app
```

## 🗄️ Database Management

```bash
# Backup database
docker-compose exec resumeforge sh -c 'sqlite3 /app/data/resumeforge.db ".backup /tmp/backup.db"'
docker cp resumeforge-app:/tmp/backup.db ./backup-$(date +%Y%m%d).db

# Restore database
docker cp ./backup.db resumeforge-app:/app/data/resumeforge.db
docker-compose restart

# Reset database
docker-compose exec resumeforge npm run reset-db
docker-compose restart

# Run migrations
docker-compose exec resumeforge npm run migrate
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs resumeforge

# Check if port is already in use
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Database issues

```bash
# Check database file
docker-compose exec resumeforge ls -lh /app/data/

# Reset database
docker-compose exec resumeforge npm run reset-db
docker-compose restart
```

### Permission issues

```bash
# Fix permissions
docker-compose exec resumeforge chown -R node:node /app
```

## 🚀 Production Deployment

### Deploy to Cloud

**AWS ECS:**
```bash
# Build and push to ECR
docker build -t resumeforge:latest .
docker tag resumeforge:latest <account-id>.dkr.ecr.<region>.amazonaws.com/resumeforge:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/resumeforge:latest
```

**Google Cloud Run:**
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/<project-id>/resumeforge
gcloud run deploy resumeforge --image gcr.io/<project-id>/resumeforge --platform managed
```

**Azure Container Instances:**
```bash
# Build and push to ACR
az acr build --registry <registry-name> --image resumeforge:latest .
az container create --resource-group <rg> --name resumeforge --image <registry-name>.azurecr.io/resumeforge:latest
```

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml resumeforge

# Scale service
docker service scale resumeforge_resumeforge=3
```

### Kubernetes

```bash
# Create deployment
kubectl create deployment resumeforge --image=resumeforge:latest

# Expose service
kubectl expose deployment resumeforge --type=LoadBalancer --port=80 --target-port=3000

# Scale
kubectl scale deployment resumeforge --replicas=3
```

## 📚 Documentation

- [Complete Docker Guide](./docs/DOCKER_GUIDE.md) - Detailed documentation
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Other deployment options
- [Main README](./README.md) - Application documentation

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/AnshulRoy28/Resume_Forge/issues)
- **Docker Docs:** [docs/DOCKER_GUIDE.md](./docs/DOCKER_GUIDE.md)

## 📝 What's Next?

1. ✅ Start the container: `./docker-start.sh`
2. ✅ Access at http://localhost:3000
3. ✅ Create your account
4. ✅ Add your Gemini API key in Settings
5. ✅ Start building resumes!

---

**Made with ❤️ for containerized deployments**
