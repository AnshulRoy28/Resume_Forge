# Quick Reference - User API Keys

## For Users

### Getting Started
1. **Get API Key:** https://aistudio.google.com/apikey
2. **Add to ResumeForge:** Settings → Gemini API Key → Save
3. **Start Using:** Analyze repos, generate resumes

### Free Tier Limits
- 15 requests/minute
- 1500 requests/day
- More than enough for typical usage

### Troubleshooting
| Error | Solution |
|-------|----------|
| "No API key configured" | Go to Settings → Add key |
| "Invalid API key format" | Key must start with `AIza` |
| "API key validation failed" | Check key is correct and enabled |
| "Rate limit exceeded" | Wait a bit or upgrade to paid tier |

## For Developers

### Migration (Existing Installation)
```bash
node add-api-key-column.js  # Add column to database
npm start                    # Restart server
```

### Fresh Installation
```bash
npm install                  # Install dependencies
npm run reset-db            # Create database
npm start                   # Start server
```

### Environment Variables
```env
JWT_SECRET=your-32-char-secret  # Required
GITHUB_TOKEN=ghp_xxx           # Optional
# GEMINI_API_KEY removed - users provide their own
```

### API Endpoints
```javascript
// Save API key
PUT /api/auth/api-key
Body: { "apiKey": "AIza..." }

// Remove API key
DELETE /api/auth/api-key

// Get user info (includes API key status)
GET /api/auth/me
```

### Using User's AI Instance
```javascript
// In any endpoint
const ai = getUserAI(req.user.userId);
const result = await generateRepoSummary(repoData, ai);
```

## Key Changes

### What Changed
- ❌ Removed: Server-side GEMINI_API_KEY
- ✅ Added: User-provided API keys
- ✅ Added: API key management in Settings
- ✅ Changed: Model to gemini-2.0-flash-exp

### Benefits
- Zero AI costs for server
- No rate limit conflicts
- Better scalability
- Improved privacy

## Files to Know

### Documentation
- `USER_API_KEYS.md` - Complete guide
- `CHANGELOG_API_KEYS.md` - Detailed changes
- `IMPLEMENTATION_COMPLETE.md` - Implementation summary

### Scripts
- `add-api-key-column.js` - Database migration
- `reset-db.js` - Fresh database setup

### Code
- `server.js` - Backend logic
- `public/pages/settings.html` - Settings UI
- `public/js/settings.js` - Settings logic

## Quick Commands

```bash
# Start server
npm start

# Migrate database
node add-api-key-column.js

# Reset database (fresh start)
npm run reset-db

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Testing Checklist

- [ ] Register new user
- [ ] Try AI without key (should error)
- [ ] Add API key in Settings
- [ ] Analyze GitHub repo (should work)
- [ ] Generate resume (should work)
- [ ] Logout and login (key persists)

## Support

**Users:** Settings page has link to get API key
**Developers:** See documentation files above
**Issues:** Check error messages for actionable steps

---

**Quick Links:**
- Get API Key: https://aistudio.google.com/apikey
- Gemini Docs: https://ai.google.dev/docs
- Pricing: https://ai.google.dev/pricing
