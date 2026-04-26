# ResumeForge Deployment Guide

## Repository
https://github.com/AnshulRoy28/Resume_Forge

## Pre-Deployment Checklist

### 1. Environment Configuration

Create `.env` file (DO NOT commit this):
```env
JWT_SECRET=your-production-secret-min-32-chars
PORT=3000
NODE_ENV=production
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Update .gitignore

Ensure these are in `.gitignore`:
```
node_modules/
.env
*.db
*.db-*
.DS_Store
```

### 3. Database Setup

For fresh deployment:
```bash
npm run reset-db
```

For existing data migration:
```bash
node add-api-key-column.js
```

## Deployment Steps

### Option 1: Deploy to Render.com (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add user authentication and session-based API keys"
   git push origin main
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `Resume_Forge` repository

4. **Configure Service**
   - **Name:** resumeforge
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. **Add Environment Variables**
   - Click "Environment" tab
   - Add:
     - `JWT_SECRET` = (your generated secret)
     - `NODE_ENV` = production

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your app will be at: `https://resumeforge.onrender.com`

### Option 2: Deploy to Railway.app

1. **Push to GitHub** (same as above)

2. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

3. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `Resume_Forge`

4. **Configure**
   - Railway auto-detects Node.js
   - Add environment variables:
     - `JWT_SECRET` = (your secret)
     - `NODE_ENV` = production

5. **Deploy**
   - Railway deploys automatically
   - Get your URL from dashboard

### Option 3: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create resumeforge
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your-secret-here
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Open App**
   ```bash
   heroku open
   ```

### Option 4: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   - Go to Vercel dashboard
   - Select your project
   - Settings → Environment Variables
   - Add `JWT_SECRET`

5. **Redeploy**
   ```bash
   vercel --prod
   ```

## Post-Deployment

### 1. Test the Deployment

- [ ] Visit your deployed URL
- [ ] Register a new account
- [ ] Login successfully
- [ ] Go to Settings
- [ ] Add Gemini API key
- [ ] Test analyzing a GitHub repo
- [ ] Test generating a resume

### 2. Configure Custom Domain (Optional)

**Render:**
- Settings → Custom Domain → Add your domain
- Update DNS records as shown

**Railway:**
- Settings → Domains → Add custom domain
- Update DNS records

**Heroku:**
```bash
heroku domains:add yourdomain.com
```

**Vercel:**
- Settings → Domains → Add domain
- Follow DNS instructions

### 3. Enable HTTPS

All platforms provide free HTTPS automatically:
- ✅ Render: Auto HTTPS
- ✅ Railway: Auto HTTPS
- ✅ Heroku: Auto HTTPS
- ✅ Vercel: Auto HTTPS

### 4. Monitor Application

**Render:**
- Dashboard → Logs
- Dashboard → Metrics

**Railway:**
- Project → Deployments → Logs

**Heroku:**
```bash
heroku logs --tail
```

**Vercel:**
- Dashboard → Deployments → Logs

## Database Persistence

### SQLite in Production

**Important:** SQLite database will reset on each deployment on some platforms.

**Solutions:**

1. **Use Persistent Storage (Render)**
   - Add a disk in Render dashboard
   - Mount at `/data`
   - Update database path in code

2. **Use PostgreSQL (Recommended for Production)**
   - Add PostgreSQL addon
   - Update code to use PostgreSQL
   - Better for production

3. **Use Railway Volumes**
   - Railway provides persistent volumes
   - Database persists across deployments

## Environment Variables

### Required
- `JWT_SECRET` - 32+ character secret for JWT tokens

### Optional
- `PORT` - Port number (auto-set by platforms)
- `NODE_ENV` - Set to "production"
- `GITHUB_TOKEN` - For higher GitHub API limits

## Security Checklist

- [ ] JWT_SECRET is strong (32+ chars)
- [ ] .env file not committed to git
- [ ] HTTPS enabled (auto on all platforms)
- [ ] Rate limiting enabled (already in code)
- [ ] API keys stored client-side only
- [ ] No sensitive data in logs

## Troubleshooting

### "Application Error"
- Check logs for errors
- Verify environment variables set
- Ensure database initialized

### "Cannot connect to database"
- Run `npm run reset-db` locally
- Commit the database file
- Or use persistent storage

### "JWT_SECRET error"
- Ensure JWT_SECRET is set in environment
- Must be 32+ characters

### "Port already in use"
- Platform sets PORT automatically
- Don't hardcode port in production

## Updating Deployment

### Push Updates
```bash
git add .
git commit -m "Your update message"
git push origin main
```

All platforms auto-deploy on push to main branch.

### Manual Redeploy
- **Render:** Dashboard → Manual Deploy
- **Railway:** Automatic on push
- **Heroku:** `git push heroku main`
- **Vercel:** `vercel --prod`

## Scaling

### Free Tier Limits
- **Render:** 750 hours/month, sleeps after 15 min inactivity
- **Railway:** $5 free credit/month
- **Heroku:** 550-1000 hours/month
- **Vercel:** Unlimited hobby projects

### Upgrade for Production
- More memory
- No sleep/downtime
- Custom domains
- Better performance

## Backup Strategy

### Database Backups
```bash
# Download database from server
scp user@server:/path/to/resumeforge.db ./backup/

# Or use platform CLI
heroku pg:backups:capture
heroku pg:backups:download
```

### Code Backups
- GitHub is your backup
- Tag releases: `git tag v1.0.0`
- Push tags: `git push --tags`

## Monitoring

### Health Checks
Add to `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

### Uptime Monitoring
- Use UptimeRobot (free)
- Ping `/health` endpoint every 5 minutes

## Cost Estimates

### Free Tier (Good for Testing)
- Render: Free
- Railway: $5 credit/month
- Heroku: Free (with limits)
- Vercel: Free

### Production (Paid)
- Render: $7/month
- Railway: ~$5-10/month
- Heroku: $7/month
- Vercel: $20/month

## Support

### Platform Documentation
- Render: https://render.com/docs
- Railway: https://docs.railway.app
- Heroku: https://devcenter.heroku.com
- Vercel: https://vercel.com/docs

### ResumeForge Issues
- GitHub Issues: https://github.com/AnshulRoy28/Resume_Forge/issues

## Quick Deploy Commands

### Render (via CLI)
```bash
# Install Render CLI
npm install -g @render/cli

# Deploy
render deploy
```

### Railway (via CLI)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### One-Click Deploy Buttons

Add to README.md:

**Render:**
```markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
```

**Railway:**
```markdown
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)
```

**Heroku:**
```markdown
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
```

## Next Steps

1. Choose deployment platform
2. Set up environment variables
3. Deploy application
4. Test thoroughly
5. Configure custom domain (optional)
6. Set up monitoring
7. Share with users!

---

**Ready to deploy!** 🚀
