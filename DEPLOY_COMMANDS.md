# Quick Deploy Commands

## Initial Setup

```bash
# 1. Initialize git
git init
git branch -M main

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: ResumeForge with authentication and session-based API keys"

# 4. Add remote
git remote add origin https://github.com/AnshulRoy28/Resume_Forge.git

# 5. Push to GitHub
git push -u origin main
```

## Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your JWT_SECRET.

## Deploy to Render

1. Go to https://render.com
2. Sign up with GitHub
3. New Web Service → Select Resume_Forge
4. Add environment variable:
   - Key: `JWT_SECRET`
   - Value: (paste generated secret)
5. Deploy!

## Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up

# Set environment variable
railway variables set JWT_SECRET=your-secret-here
```

## Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create resumeforge

# Set environment variables
heroku config:set JWT_SECRET=your-secret-here
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variable (in dashboard)
# Then deploy to production
vercel --prod
```

## Local Testing

```bash
# Install dependencies
npm install

# Create database
npm run reset-db

# Start server
npm start

# Visit http://localhost:3000
```

## Update Deployment

```bash
# Make changes
git add .
git commit -m "Your update message"
git push origin main

# Platforms auto-deploy on push
```

## Troubleshooting

```bash
# Check logs (Heroku)
heroku logs --tail

# Restart app (Heroku)
heroku restart

# Check environment variables (Heroku)
heroku config

# Run database migration
npm run reset-db
```

## Quick Links

- **GitHub Repo:** https://github.com/AnshulRoy28/Resume_Forge
- **Render:** https://render.com
- **Railway:** https://railway.app
- **Heroku:** https://heroku.com
- **Vercel:** https://vercel.com
- **Get Gemini API Key:** https://aistudio.google.com/apikey

---

**That's it!** Choose your platform and deploy. 🚀
