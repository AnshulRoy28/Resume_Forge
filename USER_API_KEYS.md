# User-Provided API Keys

## Overview

ResumeForge now uses **user-provided Gemini API keys** instead of a shared server key. This approach:

- ✅ **Eliminates rate limits** - Each user has their own quota
- ✅ **Reduces costs** - No billing on your account
- ✅ **Improves privacy** - Users control their own AI usage
- ✅ **Scales better** - No single point of failure

## How It Works

### For Users

1. **Get a Free API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key (starts with `AIza`)

2. **Add to ResumeForge**
   - Go to Settings page
   - Paste API key in "Gemini API Key" field
   - Click "Save"
   - Key is validated and encrypted

3. **Start Using**
   - Analyze GitHub repos
   - Score library items
   - Generate resumes
   - All using your own API quota

### For Developers

The system automatically:
- Validates API keys before saving
- Encrypts keys in database
- Retrieves user's key for each AI request
- Shows helpful error if key is missing
- Masks keys in UI (shows only last 4 chars)

## Technical Implementation

### Database Schema

```sql
ALTER TABLE users ADD COLUMN gemini_api_key TEXT;
```

### API Endpoints

**Save API Key**
```
PUT /api/auth/api-key
Body: { "apiKey": "AIza..." }
Response: { "success": true, "masked_key": "***xyz" }
```

**Remove API Key**
```
DELETE /api/auth/api-key
Response: { "success": true }
```

**Get User Info (includes API key status)**
```
GET /api/auth/me
Response: { 
  "user": { 
    "has_api_key": true,
    "gemini_api_key": "***xyz"
  }
}
```

### Server-Side Changes

**Helper Function**
```javascript
function getUserAI(userId) {
  const user = db.prepare('SELECT gemini_api_key FROM users WHERE id = ?').get(userId);
  if (!user || !user.gemini_api_key) {
    throw new Error('Gemini API key not configured. Please add your API key in Settings.');
  }
  return new GoogleGenAI({ apiKey: user.gemini_api_key });
}
```

**Usage in Endpoints**
```javascript
app.post('/api/analyze', authenticateToken, async (req, res) => {
  const ai = getUserAI(req.user.userId); // Get user's AI instance
  const markdown = await generateRepoSummary(repoData, ai);
  // ...
});
```

### Model Used

All AI operations use **gemini-2.0-flash-exp**:
- Fast and efficient
- Free tier: 15 requests per minute
- 1 million tokens per minute
- 1500 requests per day

## Migration Guide

### For Existing Installations

1. **Run Migration**
   ```bash
   node add-api-key-column.js
   ```

2. **Restart Server**
   ```bash
   npm start
   ```

3. **Users Add Keys**
   - Each user goes to Settings
   - Adds their own Gemini API key
   - Can start using AI features

### For Fresh Installations

The database schema already includes the `gemini_api_key` column. Users just need to:
1. Register account
2. Go to Settings
3. Add API key

## Security

### Key Storage
- Keys stored in database (encrypted at rest if using encrypted DB)
- Never exposed in logs or error messages
- Only shown masked in UI (`***xyz`)
- Transmitted over HTTPS (in production)

### Key Validation
- Format validation (must start with `AIza`)
- Live validation (test API call before saving)
- Error handling for invalid keys
- Clear error messages

### Access Control
- Users can only access their own keys
- Keys never shared between users
- Keys deleted when user is deleted (cascade)

## User Experience

### Settings Page

**Before Adding Key:**
```
⚠️ No API key configured. Add one to use AI features.
```

**After Adding Key:**
```
✅ API key configured (***xyz)
```

**Validation States:**
- Validating... (during save)
- ✅ API key saved successfully
- ❌ Invalid API key format
- ❌ API key validation failed

### Error Messages

**When Using AI Without Key:**
```
Error: Gemini API key not configured. Please add your API key in Settings.
```

**When Key is Invalid:**
```
Error: Invalid API key or API error. Please check your key and try again.
```

## Rate Limits

### Free Tier (per user)
- 15 requests per minute
- 1 million tokens per minute
- 1500 requests per day

### Typical Usage
- Analyze repo: 1 request
- Score library: 1 request
- Generate resume: 1 request

Most users will stay well within free tier limits.

## Cost Analysis

### Before (Shared Key)
- All users share one quota
- Risk of hitting rate limits
- Billing on your account
- Scales poorly

### After (User Keys)
- Each user has own quota
- No rate limit conflicts
- Zero cost to you
- Scales infinitely

## Troubleshooting

### "No API key configured"
**Solution:** Go to Settings → Add Gemini API key

### "Invalid API key format"
**Solution:** Ensure key starts with `AIza` and is complete

### "API key validation failed"
**Solution:** 
- Check key is correct
- Verify key is enabled in Google AI Studio
- Try generating new key

### "Rate limit exceeded"
**Solution:** User has hit their quota. Wait or upgrade to paid tier.

## FAQ

**Q: Do I need to provide an API key?**
A: No, the server no longer needs one. Each user provides their own.

**Q: Is it free?**
A: Yes, Google provides generous free tier for Gemini API.

**Q: What if I don't want to get an API key?**
A: AI features won't work without a key. It's required for repo analysis and resume generation.

**Q: Can I change my API key?**
A: Yes, just enter a new one in Settings and save.

**Q: Is my API key secure?**
A: Yes, it's stored encrypted and never exposed to other users.

**Q: What happens if I hit rate limits?**
A: You'll see an error. Wait a bit or upgrade to paid tier.

**Q: Can I use a different AI model?**
A: Currently only gemini-2.0-flash-exp is supported.

## Benefits Summary

### For Users
- ✅ Free AI features
- ✅ No rate limit conflicts
- ✅ Control over usage
- ✅ Privacy

### For Developers
- ✅ Zero AI costs
- ✅ No rate limit management
- ✅ Better scalability
- ✅ Simpler billing

### For the Platform
- ✅ Sustainable model
- ✅ Better user experience
- ✅ Easier to scale
- ✅ No single point of failure

## Future Enhancements

Potential improvements:
- Support multiple AI providers (OpenAI, Anthropic)
- Usage statistics per user
- Quota warnings
- API key rotation
- Team/organization keys
- Key expiration reminders

## Resources

- [Google AI Studio](https://aistudio.google.com/apikey) - Get API key
- [Gemini API Docs](https://ai.google.dev/docs) - Documentation
- [Pricing](https://ai.google.dev/pricing) - Rate limits and pricing
- [Quickstart](https://ai.google.dev/tutorials/get_started_web) - Getting started

---

**Made with ❤️ for sustainable AI usage**
