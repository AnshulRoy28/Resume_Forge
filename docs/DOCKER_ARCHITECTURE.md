# Docker Architecture 🏗️

Visual guide to ResumeForge's Docker architecture and deployment options.

## 🎯 Container Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Host                               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              resumeforge-app Container                     │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Application Layer                                   │ │ │
│  │  │  ┌────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Node.js 20 Alpine                             │ │ │ │
│  │  │  │  - Express.js Server                           │ │ │ │
│  │  │  │  - JWT Authentication                          │ │ │ │
│  │  │  │  - Rate Limiting                               │ │ │ │
│  │  │  │  - Multer File Upload                          │ │ │ │
│  │  │  └────────────────────────────────────────────────┘ │ │ │
│  │  │                                                      │ │ │
│  │  │  ┌────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Database Layer                                │ │ │ │
│  │  │  │  - SQLite (better-sqlite3)                     │ │ │ │
│  │  │  │  - User accounts                               │ │ │ │
│  │  │  │  - Project library                             │ │ │ │
│  │  │  │  - Resume history                              │ │ │ │
│  │  │  │  - Templates                                   │ │ │ │
│  │  │  └────────────────────────────────────────────────┘ │ │ │
│  │  │                                                      │ │ │
│  │  │  ┌────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Static Files                                  │ │ │ │
│  │  │  │  - HTML/CSS/JS                                 │ │ │ │
│  │  │  │  - LaTeX Editor                                │ │ │ │
│  │  │  │  - UI Components                               │ │ │ │
│  │  │  └────────────────────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  Environment Variables:                                   │ │
│  │  - JWT_SECRET (from .env)                                 │ │
│  │  - GITHUB_TOKEN (optional)                                │ │
│  │  - PORT=3000                                              │ │
│  │  - NODE_ENV=production                                    │ │
│  │                                                            │ │
│  │  Exposed Ports:                                           │ │
│  │  - 3000:3000 (HTTP)                                       │ │
│  │                                                            │ │
│  │  Health Check:                                            │ │
│  │  - GET /api/auth/me (every 30s)                           │ │
│  │  - Timeout: 3s                                            │ │
│  │  - Retries: 3                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Docker Volume: resumeforge-data              │ │
│  │                                                            │ │
│  │  Mounted at: /app/data                                    │ │
│  │  Contains:                                                 │ │
│  │  - resumeforge.db (SQLite database)                       │ │
│  │  - Database journal files                                 │ │
│  │                                                            │ │
│  │  Persistence: Survives container restarts/rebuilds        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Docker Network: resumeforge-network               │ │
│  │                                                            │ │
│  │  Type: Bridge                                             │ │
│  │  Isolation: Container-level                               │ │
│  │  DNS: Automatic service discovery                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Development vs Production

### Development Mode (`docker-compose.dev.yml`)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Development Container                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Source Code (Volume Mounted)                             │ │
│  │  Host: ./  ←→  Container: /app                            │ │
│  │                                                            │ │
│  │  ✅ Hot Reload Enabled                                     │ │
│  │  ✅ All Dependencies (dev + prod)                          │ │
│  │  ✅ Source Maps                                            │ │
│  │  ✅ Debug Mode                                             │ │
│  │  ✅ Logs to Console                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Command: npm run dev                                            │
│  Restart: on-failure                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Production Mode (`docker-compose.yml`)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Production Container                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Optimized Build                                           │ │
│  │                                                            │ │
│  │  ✅ Production Dependencies Only                           │ │
│  │  ✅ Minimal Image Size                                     │ │
│  │  ✅ Health Checks                                          │ │
│  │  ✅ Auto Restart                                           │ │
│  │  ✅ Resource Limits                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Command: npm start                                              │
│  Restart: unless-stopped                                         │
└─────────────────────────────────────────────────────────────────┘
```

## 🌐 Deployment Architectures

### Single Server Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                         Server                                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Nginx Reverse Proxy (Optional)                          │   │
│  │  - SSL/TLS Termination                                   │   │
│  │  - Static File Caching                                   │   │
│  │  - Rate Limiting                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ResumeForge Container                                   │   │
│  │  Port: 3000                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Docker Volume                                           │   │
│  │  Database Storage                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Cloud Platform Deployment (AWS ECS Example)

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Application Load Balancer                               │   │
│  │  - HTTPS (443)                                           │   │
│  │  - Health Checks                                         │   │
│  │  - Auto Scaling Trigger                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ECS Service (Fargate)                                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │  Task 1    │  │  Task 2    │  │  Task 3    │         │   │
│  │  │  Container │  │  Container │  │  Container │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  │  Auto Scaling: 1-10 tasks                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  EFS (Elastic File System)                               │   │
│  │  Shared Database Volume                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Secrets Manager                                         │   │
│  │  - JWT_SECRET                                            │   │
│  │  - GITHUB_TOKEN                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Kubernetes Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Ingress Controller                                      │   │
│  │  - SSL/TLS                                               │   │
│  │  - Path Routing                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Service (LoadBalancer)                                  │   │
│  │  Port: 80 → 3000                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Deployment                                              │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐                     │   │
│  │  │ Pod 1  │  │ Pod 2  │  │ Pod 3  │                     │   │
│  │  │ Resume │  │ Resume │  │ Resume │                     │   │
│  │  │ Forge  │  │ Forge  │  │ Forge  │                     │   │
│  │  └────────┘  └────────┘  └────────┘                     │   │
│  │  Replicas: 3                                             │   │
│  │  Strategy: RollingUpdate                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PersistentVolumeClaim                                   │   │
│  │  Storage: 10Gi                                           │   │
│  │  AccessMode: ReadWriteMany                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PersistentVolume                                        │   │
│  │  - NFS / EBS / Azure Disk                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ConfigMap & Secrets                                     │   │
│  │  - Environment Variables                                 │   │
│  │  - JWT_SECRET (Secret)                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### User Request Flow

```
User Browser
    ↓
    │ HTTPS Request
    ↓
Load Balancer / Reverse Proxy
    ↓
    │ HTTP Request
    ↓
Docker Container (Port 3000)
    ↓
    │ Express.js Router
    ↓
┌───────────────────────────────────┐
│  Authentication Middleware        │
│  - Verify JWT Token               │
│  - Extract User ID                │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│  Route Handler                    │
│  - Process Request                │
│  - Validate Input                 │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│  Database Layer                   │
│  - SQLite Queries                 │
│  - Data Validation                │
└───────────────────────────────────┘
    ↓
    │ Database File
    ↓
Docker Volume (/app/data/resumeforge.db)
    ↓
    │ Response
    ↓
User Browser
```

### Resume Generation Flow

```
User Input (Job Description)
    ↓
Frontend (JavaScript)
    ↓
    │ POST /api/generate
    ↓
Backend (Express)
    ↓
┌───────────────────────────────────┐
│  Fetch Library Items              │
│  - Projects                       │
│  - Experiences                    │
│  - Skills                         │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│  Stage 1: Score & Generate        │
│  - AI Scoring (Gemini)            │
│  - Section Generation             │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│  Stage 2: Integration             │
│  - Combine Sections               │
│  - Apply Template                 │
│  - ATS Optimization               │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│  Stage 3: Verification            │
│  - Fact Checking                  │
│  - Accuracy Validation            │
│  - Regenerate if Needed           │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│  Save to History                  │
│  - Store in Database              │
│  - Link to Library Items          │
└───────────────────────────────────┘
    ↓
    │ LaTeX Output
    ↓
Frontend (LaTeX Editor)
    ↓
User (Edit & Download)
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Layer 1: Network Security                               │   │
│  │  - Docker Network Isolation                              │   │
│  │  - Firewall Rules                                        │   │
│  │  - Rate Limiting                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Layer 2: Application Security                           │   │
│  │  - JWT Authentication                                    │   │
│  │  - Password Hashing (bcrypt)                             │   │
│  │  - Input Validation                                      │   │
│  │  - SQL Injection Prevention                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Layer 3: Data Security                                  │   │
│  │  - Environment Variables                                 │   │
│  │  - No Secrets in Code                                    │   │
│  │  - Client-side API Keys                                  │   │
│  │  - User Data Isolation                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Layer 4: Container Security                             │   │
│  │  - Non-root User                                         │   │
│  │  - Minimal Base Image                                    │   │
│  │  - No Unnecessary Packages                               │   │
│  │  - Health Checks                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Scaling Strategies

### Vertical Scaling (Single Container)

```
┌─────────────────────────────────────┐
│  Small (1 CPU, 512MB RAM)           │
│  - 1-10 concurrent users            │
│  - Development/Testing              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Medium (2 CPU, 2GB RAM)            │
│  - 10-50 concurrent users           │
│  - Small Production                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Large (4 CPU, 4GB RAM)             │
│  - 50-200 concurrent users          │
│  - Medium Production                │
└─────────────────────────────────────┘
```

### Horizontal Scaling (Multiple Containers)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Load Balancer                               │
│                   (Round Robin / Least Connections)              │
└─────────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Container 1     │  │  Container 2     │  │  Container 3     │
│  ResumeForge     │  │  ResumeForge     │  │  ResumeForge     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         ↓                    ↓                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Shared Database Volume                        │
│                    (NFS / EFS / Azure Files)                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Best Practices

### Development
- ✅ Use `docker-compose.dev.yml` for local development
- ✅ Mount source code as volume for hot reload
- ✅ Use separate database for dev/prod
- ✅ Enable debug logging
- ✅ Use `.env.example` as template

### Production
- ✅ Use `docker-compose.yml` for production
- ✅ Set strong JWT_SECRET (64+ characters)
- ✅ Enable health checks
- ✅ Configure automatic restarts
- ✅ Use Docker secrets for sensitive data
- ✅ Implement backup strategy
- ✅ Monitor resource usage
- ✅ Set up logging aggregation
- ✅ Use reverse proxy (Nginx/Traefik)
- ✅ Enable SSL/TLS

### Security
- ✅ Never commit `.env` file
- ✅ Use environment variables for secrets
- ✅ Run as non-root user
- ✅ Keep base image updated
- ✅ Scan for vulnerabilities
- ✅ Limit container resources
- ✅ Use network isolation
- ✅ Enable rate limiting

## 📚 Related Documentation

- [README_DOCKER.md](../README_DOCKER.md) - Quick start guide
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Complete documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment options

---

**Made with ❤️ for containerized deployments**
