# Troubleshooting Guide 🔧

Common issues and solutions for ResumeForge.

## Database Issues

### FOREIGN KEY constraint failed

**Error:** `FOREIGN KEY constraint failed`

**Cause:** SQLite foreign key constraints are not properly enabled, or trying to insert NULL values in foreign key columns.

**Solution:**

#### Option 1: Reset Database (Recommended)
```bash
# This will recreate the database with proper constraints
npm run reset-db

# Then restart the server
npm start
```

#### Option 2: Fix Existing Database
```bash
# Run the fix script
npm run fix-foreign-keys

# Then restart the server
npm start
```

#### Option 3: Manual Fix (Docker)
```bash
# Access Docker container
docker-compose exec resumeforge sh

# Run fix script
npm run fix-foreign-keys

# Exit and restart
exit
docker-compose restart
```

---

## GitHub API Issues

### Rate Limit Exceeded

**Error:** `GitHub API rate limit exceeded`

**Cause:** Too many requests to GitHub API without authentication.

**Solution:**

1. Get a free GitHub token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select `repo` or `public_repo` scope
   - Copy the token

2. Use the token in ResumeForge:
   - Go to "Add to Library" page
   - Click "Optional: GitHub Token"
   - Paste your token
   - Analyze repositories

**Limits:**
- Without token: 60 requests/hour
- With token: 5,000 requests/hour

---

## Deployment Issues

### Render: App Won't Start

**Error:** App crashes on startup

**Possible Causes & Solutions:**

1. **Missing JWT_SECRET**
   - Go to Render dashboard → Environment
   - Add `JWT_SECRET` and click "Generate"
   - Redeploy

2. **Missing Persistent Disk**
   - Go to Render dashboard → Disks
   - Add disk:
     - Name: `resumeforge-data`
     - Mount Path: `/app/data`
     - Size: 1 GB
   - Redeploy

3. **Build Command Failed**
   - Check logs in Render dashboard
   - Verify `render.yaml` is correct
   - Try manual deploy

### Render: Database Resets on Deploy

**Problem:** Data disappears after deployment

**Solution:**
- Verify persistent disk is mounted at `/app/data`
- Check logs for: `📁 Using database at: /app/data/resumeforge.db`
- If not, add disk in Render dashboard

### Render: Cold Starts (Free Tier)

**Problem:** First request takes 30-60 seconds

**Explanation:** Free tier spins down after 15 minutes of inactivity

**Solutions:**
1. **Use UptimeRobot (Free)**
   - Sign up at https://uptimerobot.com
   - Add monitor with your Render URL
   - Set interval to 14 minutes
   - Keeps app warm

2. **Upgrade to Starter ($7/month)**
   - Always-on
   - No cold starts
   - Better performance

---

## Docker Issues

### Container Won't Start

**Error:** Container exits immediately

**Solution:**
```bash
# Check logs
docker-compose logs resumeforge

# Common fixes:
# 1. Port already in use
docker-compose down
# Change port in docker-compose.yml
# Then restart

# 2. Database corruption
docker-compose down -v
docker-compose up -d --build

# 3. Permission issues
docker-compose exec resumeforge chown -R node:node /app
```

### Database Issues in Docker

**Error:** Database file not found or corrupted

**Solution:**
```bash
# Reset database
docker-compose exec resumeforge npm run reset-db
docker-compose restart

# Or rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

---

## Authentication Issues

### JWT Token Invalid

**Error:** `Invalid or expired token`

**Cause:** Token expired (7 days) or JWT_SECRET changed

**Solution:**
- Log out and log in again
- If JWT_SECRET changed, all users need to re-login

### Can't Create Account

**Error:** `Email already registered`

**Solution:**
- Use a different email
- Or reset database (loses all data):
  ```bash
  npm run reset-db
  ```

---

## Gemini API Issues

### API Key Required

**Error:** `Gemini API key required`

**Solution:**
1. Get free API key: https://aistudio.google.com/apikey
2. Go to Settings in ResumeForge
3. Paste API key and save
4. Try generating resume again

### API Key Invalid

**Error:** `Invalid API key`

**Solution:**
- Verify key starts with `AIza`
- Generate new key at https://aistudio.google.com/apikey
- Update in Settings

---

## Performance Issues

### Slow Resume Generation

**Cause:** Large library or complex job description

**Solutions:**
- Reduce library items (keep most relevant)
- Shorten job description
- Use faster Gemini model (already using Flash)

### High Memory Usage

**Cause:** Large database or many concurrent users

**Solutions:**
- Clean up old history entries
- Upgrade server resources
- Use database cleanup script

---

## Common Error Messages

### "Authentication required"
- **Solution:** Log in or check if token expired

### "Missing repoUrl"
- **Solution:** Enter a valid GitHub repository URL

### "Invalid GitHub URL"
- **Solution:** Use format: `https://github.com/owner/repo`

### "Gemini API key required"
- **Solution:** Add API key in Settings

### "Database is locked"
- **Solution:** Restart server or check for concurrent writes

---

## Getting Help

### Check Logs

**Local/Docker:**
```bash
# Docker
docker-compose logs -f resumeforge

# Local
# Check terminal where npm start is running
```

**Render:**
- Go to dashboard → Logs tab
- View real-time logs

### Debug Mode

Enable detailed logging:
```bash
# Set environment variable
NODE_ENV=development

# Restart server
npm start
```

### Report Issues

If you can't solve the issue:

1. **Check existing issues:**
   - https://github.com/AnshulRoy28/Resume_Forge/issues

2. **Create new issue with:**
   - Error message (full text)
   - Steps to reproduce
   - Environment (Docker/Render/Local)
   - Logs (relevant parts)

3. **Community help:**
   - Render Community: https://community.render.com
   - GitHub Discussions

---

## Preventive Maintenance

### Regular Backups

**Docker:**
```bash
docker cp resumeforge-app:/app/data/resumeforge.db ./backup-$(date +%Y%m%d).db
```

**Render:**
- Use Render shell to backup
- Download database file
- Store securely

### Database Cleanup

```bash
# Remove old history (optional)
# Connect to database and run:
DELETE FROM history WHERE created_at < datetime('now', '-30 days');
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Rebuild Docker
docker-compose up -d --build
```

---

## Quick Fixes Checklist

- [ ] Restart server/container
- [ ] Check logs for errors
- [ ] Verify environment variables
- [ ] Check database file exists
- [ ] Verify API keys are set
- [ ] Check disk space
- [ ] Try reset-db (last resort)

---

**Still having issues?** Open an issue on GitHub with detailed information!
