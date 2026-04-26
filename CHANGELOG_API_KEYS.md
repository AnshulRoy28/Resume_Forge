# Changelog - User-Provided API Keys

## What Changed

### Before
- Server used a single shared Gemini API key
- All users shared the same rate limits
- Billing costs on server operator
- Risk of hitting rate limits with multiple users

### After
- Each user provides their own Gemini API key
- Users have independent rate limits
- Zero AI costs for server operator
- Better scalability and privacy

## Changes Made

### Backend (server.js)

1. **Removed Global AI Instance**
   ```javascript
   // REMOVED: const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
   ```

2. **Added Helper Function**
   ```javascript
   function getUserAI(userId) {
     const user = db.prepare('SELECT gemini_api_key FROM users WHERE id = ?').get(userId);
     if (!user || !user.gemini_api_key) {
       throw new Error('Gemini API key not configured. Please add your API key in Settings.');
     }
     return new GoogleGenAI({ apiKey: user.gemini_api_key });
   }
   ```

3. **Updated All AI Functions**
   - `generateRepoSummary(repoData, ai)` - Now takes AI instance
   - `generateResume(jobDescription, markdownFiles, templateContent, ai)` - Now takes AI instance
   - `scoreMarkdownFiles(jobDescription, markdownFiles, ai)` - Now takes AI instance

4. **Updated All AI Endpoints**
   - `/api/analyze` - Gets user's AI instance
   - `/api/score` - Gets user's AI instance
   - `/api/generate` - Gets user's AI instance

5. **Added API Key Management Endpoints**
   - `PUT /api/auth/api-key` - Save/update API key
   - `DELETE /api/auth/api-key` - Remove API key
   - `GET /api/auth/me` - Returns API key status

6. **Changed Model**
   - From: `gemini-2.5-flash`
   - To: `gemini-2.0-flash-exp`

### Database

1. **Added Column to Users Table**
   ```sql
   ALTER TABLE users ADD COLUMN gemini_api_key TEXT;
   ```

### Frontend

1. **Updated Settings Page** (public/pages/settings.html)
   - Added Gemini API key input field
   - Added save button with validation
   - Added status indicators
   - Added link to Google AI Studio
   - Removed server-side key management

2. **Updated Settings Module** (public/js/settings.js)
   - Added `saveApiKey()` function
   - Added API key validation
   - Added status display
   - Shows masked key after saving

### Configuration

1. **Environment Variables**
   - REMOVED: `GEMINI_API_KEY` (no longer needed)
   - KEPT: `JWT_SECRET` (still required)
   - KEPT: `GITHUB_TOKEN` (optional)

### Scripts

1. **Added Migration Script**
   - `add-api-key-column.js` - Adds column to existing database
   - `npm run add-api-key-column` - Run migration

### Documentation

1. **New Files**
   - `USER_API_KEYS.md` - Complete guide to user API keys
   - `CHANGELOG_API_KEYS.md` - This file

2. **Updated Files**
   - `README_AUTH.md` - Updated requirements and setup
   - `QUICKSTART.md` - Added API key setup step

## Migration Path

### For Server Operators

1. **Update Code**
   ```bash
   git pull  # or copy updated files
   npm install  # dependencies unchanged
   ```

2. **Migrate Database**
   ```bash
   node add-api-key-column.js
   ```

3. **Update .env**
   ```bash
   # Remove GEMINI_API_KEY line (no longer needed)
   # Keep JWT_SECRET
   ```

4. **Restart Server**
   ```bash
   npm start
   ```

5. **Notify Users**
   - Users need to add their own API keys
   - Send link to Google AI Studio
   - Point to Settings page

### For Users

1. **Get API Key**
   - Visit https://aistudio.google.com/apikey
   - Sign in with Google
   - Create API key
   - Copy key

2. **Add to ResumeForge**
   - Login to ResumeForge
   - Go to Settings
   - Paste API key
   - Click Save

3. **Verify**
   - Should see "✅ API key configured"
   - Try analyzing a repo or generating resume

## Breaking Changes

### ⚠️ Users Must Add API Keys

**Impact:** Users cannot use AI features until they add their own API key

**Migration:** 
- Existing users: Add key in Settings
- New users: Add key after registration

**Timeline:** Immediate (no grace period)

### ⚠️ Model Changed

**Impact:** Responses may differ slightly due to model change

**From:** gemini-2.5-flash
**To:** gemini-2.0-flash-exp

**Reason:** Newer, faster, better free tier

## Benefits

### For Server Operators
- ✅ Zero AI costs
- ✅ No rate limit management
- ✅ Better scalability
- ✅ Simpler infrastructure

### For Users
- ✅ Free AI features (Google's free tier)
- ✅ No rate limit conflicts
- ✅ Control over usage
- ✅ Better privacy

### For the Platform
- ✅ Sustainable business model
- ✅ Better user experience
- ✅ Easier to scale
- ✅ No single point of failure

## Testing

### Test Checklist

- [ ] Register new user
- [ ] Try AI feature without key (should show error)
- [ ] Go to Settings
- [ ] Add invalid API key (should show error)
- [ ] Add valid API key (should save successfully)
- [ ] Analyze GitHub repo (should work)
- [ ] Score library items (should work)
- [ ] Generate resume (should work)
- [ ] Logout and login (key should persist)
- [ ] Remove API key (should work)
- [ ] Try AI feature again (should show error)

### Error Messages to Test

1. **No API Key**
   ```
   Gemini API key not configured. Please add your API key in Settings.
   ```

2. **Invalid Format**
   ```
   Invalid Gemini API key format
   ```

3. **Invalid Key**
   ```
   Invalid API key or API error. Please check your key and try again.
   ```

## Rollback Plan

If issues arise:

1. **Revert Code**
   ```bash
   git revert <commit-hash>
   ```

2. **Restore .env**
   ```env
   GEMINI_API_KEY=your-old-key
   JWT_SECRET=your-secret
   ```

3. **Restart Server**
   ```bash
   npm start
   ```

4. **Note:** User API keys will remain in database but won't be used

## Support

### Common Issues

**"No API key configured"**
- User needs to add key in Settings
- Point to Google AI Studio link

**"Invalid API key"**
- Check key format (starts with AIza)
- Verify key is enabled
- Try generating new key

**"Rate limit exceeded"**
- User hit their quota
- Wait or upgrade to paid tier
- Not a server issue

### Documentation

- [USER_API_KEYS.md](./USER_API_KEYS.md) - Complete guide
- [README_AUTH.md](./README_AUTH.md) - Updated setup guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick start with API keys

## Timeline

- **Development:** Completed
- **Testing:** Ready for testing
- **Deployment:** Ready to deploy
- **User Migration:** Immediate (users add keys as needed)

## Metrics to Monitor

Post-deployment:
- Number of users with API keys configured
- API key validation success rate
- Error rates for "no API key" errors
- User feedback on setup process

## Future Enhancements

Potential improvements:
- Support multiple AI providers
- Usage statistics per user
- Quota warnings
- API key rotation
- Team/organization keys

---

**Version:** 2.0.0
**Date:** 2026-04-26
**Author:** ResumeForge Team
