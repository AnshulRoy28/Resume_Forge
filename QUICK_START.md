# ResumeForge Quick Start Guide 🚀

Choose your deployment method and get started in minutes!

## 🐳 Option 1: Docker (Local Development)

**Best for:** Testing locally, development

```bash
# Windows
docker-start.bat

# Linux/Mac
chmod +x docker-start.sh
./docker-start.sh

# Or manually
docker-compose up -d
```

**Access:** http://localhost:3000

**Commands:**
- View logs: `docker-compose logs -f`
- Stop: `docker-compose down`
- Rebuild: `docker-compose up -d --build`

---

## ☁️ Option 2: Deploy to Render (Production)

**Best for:** Sharing with others, production use

### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AnshulRoy28/Resume_Forge)

**Steps:**
1. Click button above
2. Sign in to Render (free)
3. Click "Apply"
4. Wait 5 minutes
5. Get your live URL!

### Manual Deploy

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   ```
   Build Command: npm install && npm run reset-db
   Start Command: npm start
   ```
5. Add environment variable:
   ```
   JWT_SECRET = <click Generate>
   ```
6. Add Disk:
   ```
   Name: resumeforge-data
   Mount Path: /app/data
   Size: 1 GB
   ```
7. Deploy!

**Your URL:** `https://your-app-name.onrender.com`

---

## 📝 After Deployment

### 1. Create Account
- Open your app URL
- Click "Register"
- Enter email and password

### 2. Add Gemini API Key
- Go to Settings
- Get free key: https://aistudio.google.com/apikey
- Paste and save

### 3. Build Your Library
- Add projects (GitHub or manual)
- Add work experience
- Add education, skills, certifications

### 4. Generate Resume
- Go to Generate page
- Paste job description
- Click "Generate Resume"
- Edit in LaTeX editor
- Download!

---

## 🐛 Troubleshooting

### Docker Issues
- **Container won't start:** `docker-compose logs resumeforge`
- **Port in use:** Change port in `docker-compose.yml`
- **Database issues:** `docker-compose exec resumeforge npm run reset-db`

### Render Issues
- **Deployment fails:** Check logs in Render dashboard
- **App won't start:** Verify JWT_SECRET is set
- **Database resets:** Ensure disk is mounted at `/app/data`
- **GitHub rate limit:** Provide your own token in the UI

### GitHub Rate Limits
- **Error:** "GitHub API rate limit exceeded"
- **Solution:** Get free token at https://github.com/settings/tokens
- **Usage:** Paste in "Optional: GitHub Token" field when analyzing repos

---

## 📚 Documentation

- **[README.md](README.md)** - Full application documentation
- **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - All deployment options
- **[docs/DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md)** - Complete Docker guide

---

## 🆘 Need Help?

- **Render Status:** [status.render.com](https://status.render.com)
- **GitHub Issues:** [Report a bug](https://github.com/AnshulRoy28/Resume_Forge/issues)
- **Documentation:** Check the docs folder

---

**Ready to start? Pick an option above and deploy in 5 minutes!**
