# 🚀 Deploy to Render NOW - 5 Minute Guide

Quick deployment guide to get your app live in 5 minutes!

## ✅ Pre-Deployment Checklist

Before deploying, make sure:
- [ ] Your code is working locally (test with `npm start` or Docker)
- [ ] You have a GitHub account
- [ ] Your code is pushed to GitHub
- [ ] You have a Render account (free)

## 🎯 Quick Deploy (5 Minutes)

### Step 1: Push to GitHub (2 minutes)

```bash
# If not already done
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render (3 minutes)

#### Option A: One-Click Deploy (Easiest!)

1. Click this button:

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

2. Sign in with GitHub
3. Select your repository
4. Click "Apply"
5. Done! 🎉

#### Option B: Manual Deploy

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Fill in:
   ```
   Name: resumeforge
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
7. Click "Create Web Service"

### Step 3: Wait for Deployment

- Watch the logs in Render dashboard
- Usually takes 2-5 minutes
- Look for: `🚀 ResumeForge running at http://localhost:3000`

### Step 4: Access Your App!

Your app will be live at:
```
https://your-app-name.onrender.com
```

## 🎊 You're Live!

Share your URL with others:
```
https://your-app-name.onrender.com
```

## ⚠️ Important Notes

### Free Tier Limitations
- **Spins down after 15 minutes** of inactivity
- First request after inactivity takes 30-60 seconds (cold start)
- 750 hours/month (enough for 1 app)

### Keep It Awake (Optional)
Use [UptimeRobot](https://uptimerobot.com) to ping your app every 14 minutes:
1. Sign up for free
2. Add monitor: `https://your-app-name.onrender.com`
3. Set interval: 14 minutes

### Upgrade to Always-On ($7/month)
- No cold starts
- Always responsive
- Better for production use

## 🐛 Troubleshooting

### Deployment Failed?
1. Check logs in Render dashboard
2. Verify `render.yaml` is in your repo
3. Ensure all dependencies are in `package.json`

### App Not Loading?
1. Check if JWT_SECRET is set
2. Verify disk is mounted at `/app/data`
3. Check logs for errors

### Database Resets?
1. Verify persistent disk is added
2. Check mount path: `/app/data`
3. Ensure disk size is at least 1GB

## 📚 Full Documentation

For detailed instructions, see:
- [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) - Complete guide
- [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) - All deployment options

## 🆘 Need Help?

1. Check [Render Status](https://status.render.com)
2. View [Render Docs](https://render.com/docs)
3. Ask in [Render Community](https://community.render.com)

## ✅ Post-Deployment Checklist

After deployment:
- [ ] App is accessible via URL
- [ ] Can create an account
- [ ] Can login
- [ ] Can add Gemini API key in Settings
- [ ] Can add items to library
- [ ] Can generate resume
- [ ] Database persists after redeploy

## 🎯 Next Steps

1. **Test your app** - Create account, generate resume
2. **Share the URL** - Send to friends/colleagues
3. **Add custom domain** (optional)
4. **Set up monitoring** (optional)
5. **Upgrade to paid tier** for always-on (optional)

---

**Ready to deploy?** Click the button below!

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Or follow the manual steps above.**

**Your app will be live in 5 minutes! 🚀**
