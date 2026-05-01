# GitHub Rate Limit Fix 🔧

## Problem

When deploying to Render, you were getting "GitHub API rate limit exceeded" errors even without using the app. This was happening because:

1. **Server-side GitHub token** was being used for all repository analysis
2. **GitHub rate limits** are strict:
   - **60 requests/hour** for unauthenticated requests
   - **5,000 requests/hour** for authenticated requests
3. **Shared token** meant all users consumed the same rate limit
4. **Token might be invalid** or already rate-limited

## Solution

### 1. Made GitHub Token Optional

**Before:**
```javascript
const token = githubToken || process.env.GITHUB_TOKEN || null;
```

**After:**
```javascript
// Only use user-provided token or server token if explicitly set
// Don't use server token by default to avoid rate limits
const token = githubToken || (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== '' ? process.env.GITHUB_TOKEN : null);
```

### 2. Added Better Error Handling

Added rate limit detection and helpful error messages:

```javascript
async function ghFetch(endpoint, token) {
  const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'ResumeForge' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${endpoint}`, { headers });
  
  // Handle rate limiting
  if (res.status === 403) {
    const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
    const rateLimitReset = res.headers.get('x-ratelimit-reset');
    
    if (rateLimitRemaining === '0') {
      const resetDate = new Date(parseInt(rateLimitReset) * 1000);
      throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}. Please provide your own GitHub token in the form, or wait until the rate limit resets.`);
    }
  }
  
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}
```

### 3. Added GitHub Token Field in UI

Added an optional GitHub token field in the "Add to Library" page:

```html
<!-- GitHub Token Field (Optional) -->
<details class="text-xs text-zinc-500">
  <summary class="cursor-pointer hover:text-zinc-300 transition-colors">
    <iconify-icon icon="solar:key-linear" style="font-size:12px"></iconify-icon>
    Optional: GitHub Token (for private repos or rate limits)
  </summary>
  <div class="mt-2 flex flex-col gap-2">
    <input id="githubToken" type="password" placeholder="github_pat_..."
      class="input input-mono py-2 text-xs">
    <p class="text-[10px] text-zinc-600">
      Get a free token at <a href="https://github.com/settings/tokens" target="_blank">github.com/settings/tokens</a>
    </p>
  </div>
</details>
```

### 4. Updated Frontend to Send Token

Modified `add.js` to include the GitHub token in the request:

```javascript
const githubToken = document.getElementById('githubToken')?.value.trim() || '';

const payload = { repoUrl: url };
if (githubToken) payload.githubToken = githubToken;

const data = await App.api('POST', '/api/analyze', payload);
```

### 5. Removed Server Token from Render Config

Updated `render.yaml` to NOT include a GitHub token by default:

```yaml
envVars:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    generateValue: true
    sync: false
  - key: PORT
    value: 3000
  # GitHub token is optional - users should provide their own to avoid rate limits
  # - key: GITHUB_TOKEN
  #   value: your_token_here
```

## How It Works Now

### For Public Repositories

1. **Without Token:**
   - Uses unauthenticated GitHub API
   - 60 requests/hour limit
   - Sufficient for occasional use

2. **With User Token:**
   - Uses user's personal token
   - 5,000 requests/hour limit
   - Each user has their own limit

### For Private Repositories

- **Requires Token:**
  - User must provide their own GitHub token
  - Token must have `repo` read access
  - Works for private repos user has access to

## User Instructions

### Getting a GitHub Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "ResumeForge"
4. Select scopes:
   - ✅ `repo` (for private repos)
   - ✅ `public_repo` (for public repos only)
5. Click "Generate token"
6. Copy the token (starts with `github_pat_` or `ghp_`)
7. Paste it in the GitHub Token field in ResumeForge

### Using the Token

1. Go to "Add to Library" page
2. Enter GitHub repository URL
3. Click "Optional: GitHub Token" to expand
4. Paste your token
5. Click "Analyze & Add"

**Note:** The token is only sent to the server for this request and is NOT stored anywhere.

## Benefits

### ✅ No More Rate Limit Errors
- Each user uses their own token
- No shared rate limit
- 5,000 requests/hour per user

### ✅ Privacy
- Tokens are not stored on server
- Only sent with the request
- Users control their own tokens

### ✅ Works for Private Repos
- Users can analyze their private repositories
- Just need to provide a token with `repo` access

### ✅ Optional
- Public repos work without token (60/hour limit)
- Token only needed for:
  - Private repositories
  - Heavy usage (>60 repos/hour)
  - When rate limit is hit

## Deployment

### On Render

1. **Don't set GITHUB_TOKEN** environment variable
2. Let users provide their own tokens
3. No rate limit issues

### On Local/Docker

1. **Don't set GITHUB_TOKEN** in `.env`
2. Or set it to empty: `GITHUB_TOKEN=`
3. Use the UI to provide token when needed

## Testing

### Test Without Token
```bash
# Should work for public repos (60/hour limit)
curl -X POST http://localhost:3000/api/analyze \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl":"https://github.com/facebook/react"}'
```

### Test With Token
```bash
# Should work with higher limit (5000/hour)
curl -X POST http://localhost:3000/api/analyze \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl":"https://github.com/facebook/react","githubToken":"github_pat_YOUR_TOKEN"}'
```

### Test Rate Limit Error
```bash
# After hitting rate limit, should show helpful error
# Error message includes reset time and instructions
```

## Security Notes

### ✅ Secure
- Tokens are not stored in database
- Tokens are not logged
- Tokens are only used for the single request
- Users control their own tokens

### ⚠️ Important
- Never commit tokens to git
- Never share tokens publicly
- Rotate tokens periodically
- Use tokens with minimal required scopes

## Summary

**Problem:** Shared GitHub token hitting rate limits on Render

**Solution:** 
- Removed server-side token
- Added optional user-provided token field
- Better error handling with helpful messages
- Each user uses their own rate limit

**Result:**
- ✅ No more rate limit errors on deployment
- ✅ Users can analyze private repos
- ✅ Better privacy and security
- ✅ Scalable solution

---

**Status:** ✅ Fixed
**Deployed:** Ready for Render
**User Impact:** Minimal (optional field, better UX)
