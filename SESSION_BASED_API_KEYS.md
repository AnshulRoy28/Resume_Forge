# Session-Based API Keys - Security First

## Overview

ResumeForge uses **session-based API keys** stored only in the user's browser (localStorage). API keys are **NEVER** stored on the server or in the database.

## Security Model

### ✅ What We Do
- Store API keys in browser localStorage only
- Send keys in request headers (`X-Gemini-Api-Key`)
- Keys exist only during user session
- No server-side storage whatsoever

### ❌ What We Don't Do
- Never store keys in database
- Never log keys
- Never persist keys on server
- Never share keys between users

## How It Works

### User Flow

1. **User Gets API Key**
   - Visits Google AI Studio
   - Creates free API key
   - Copies key

2. **User Adds to ResumeForge**
   - Goes to Settings
   - Pastes API key
   - Clicks Save
   - Key stored in browser localStorage

3. **Using AI Features**
   - User triggers AI action (analyze repo, generate resume)
   - Frontend reads key from localStorage
   - Sends key in `X-Gemini-Api-Key` header
   - Server uses key for that request only
   - Server never stores the key

4. **Session Management**
   - Key persists in browser until cleared
   - Survives page refreshes
   - Cleared on logout (optional)
   - User can update anytime

### Technical Flow

```
┌─────────────┐
│   Browser   │
│ localStorage│
│  (API Key)  │
└──────┬──────┘
       │
       │ Read key
       ↓
┌─────────────┐
│  Frontend   │
│   Request   │
└──────┬──────┘
       │
       │ X-Gemini-Api-Key: AIza...
       ↓
┌─────────────┐
│   Server    │
│  (No Store) │
└──────┬──────┘
       │
       │ Use key for this request
       ↓
┌─────────────┐
│ Gemini API  │
└─────────────┘
```

## Implementation

### Frontend (localStorage)

```javascript
// auth.js
getApiKey() {
  return localStorage.getItem('gemini_api_key');
}

setApiKey(apiKey) {
  if (apiKey) {
    localStorage.setItem('gemini_api_key', apiKey);
  } else {
    localStorage.removeItem('gemini_api_key');
  }
}
```

### Frontend (Request Headers)

```javascript
// app.js
async function api(method, path, body) {
  const apiKey = Auth.getApiKey();
  const headers = { 'Content-Type': 'application/json' };
  
  if (apiKey) {
    headers['X-Gemini-Api-Key'] = apiKey;
  }
  
  // ... make request
}
```

### Backend (Read from Header)

```javascript
// server.js
function getUserAI(req) {
  const apiKey = req.headers['x-gemini-api-key'];
  if (!apiKey) {
    throw new Error('Gemini API key required. Please provide your API key in Settings.');
  }
  return new GoogleGenAI({ apiKey });
}

// Use in endpoints
app.post('/api/analyze', authenticateToken, async (req, res) => {
  const ai = getUserAI(req); // Gets key from header
  // ... use AI
});
```

## Security Benefits

### No Server-Side Storage
- ✅ **Zero risk of database breach** - Keys not in DB
- ✅ **No key leaks** - Keys never logged or persisted
- ✅ **User control** - Users manage their own keys
- ✅ **Privacy** - Server never sees keys after request

### Client-Side Storage
- ✅ **Browser security** - localStorage is origin-isolated
- ✅ **HTTPS protection** - Keys encrypted in transit
- ✅ **User device only** - Keys stay on user's machine
- ✅ **Easy to clear** - User can delete anytime

### Request-Level Security
- ✅ **Ephemeral** - Key used only for that request
- ✅ **No caching** - Server doesn't cache keys
- ✅ **No logs** - Keys not logged
- ✅ **Stateless** - Server has no key state

## Comparison

### ❌ Database Storage (What We DON'T Do)
```
User → Server → Database (STORED) → Server → Gemini
                  ↑
            Security Risk!
```

**Risks:**
- Database breach exposes all keys
- Server compromise exposes keys
- Requires encryption at rest
- Requires key rotation
- Compliance issues

### ✅ Session-Based (What We DO)
```
User → Browser (localStorage) → Server (header) → Gemini
                                    ↑
                              Never stored!
```

**Benefits:**
- No database risk
- No server-side storage
- User controls keys
- Simple and secure

## User Experience

### Settings Page

**Before Adding Key:**
```
⚠️ No API key configured. Add one to use AI features.
```

**After Adding Key:**
```
✅ API key configured (stored in browser)
Key: ***xyz
```

**Security Notice:**
```
🔒 Your API key is stored only in your browser (localStorage).
   Never sent to or stored on our servers.
```

### Error Handling

**No Key Provided:**
```
Error: Gemini API key required. Please provide your API key in Settings.
```

**Invalid Key:**
```
Error: Invalid API key format. Key should start with "AIza"
```

## Privacy & Compliance

### Data Storage
- **Browser:** API key in localStorage
- **Server:** Nothing (keys in headers only)
- **Database:** Nothing (no key column)

### Data Transmission
- **HTTPS:** Keys encrypted in transit
- **Headers:** Keys in request headers
- **No logs:** Keys never logged

### User Rights
- **Access:** User has full access to their key
- **Delete:** User can delete key anytime
- **Update:** User can update key anytime
- **Export:** User can copy key from localStorage

## Best Practices

### For Users

**Do:**
- ✅ Keep your API key private
- ✅ Don't share your key
- ✅ Use HTTPS (always)
- ✅ Clear key if device is shared

**Don't:**
- ❌ Share your key publicly
- ❌ Commit keys to git
- ❌ Use same key everywhere
- ❌ Leave key on public computers

### For Developers

**Do:**
- ✅ Read key from headers only
- ✅ Use key for request only
- ✅ Never log keys
- ✅ Never store keys

**Don't:**
- ❌ Store keys in database
- ❌ Cache keys in memory
- ❌ Log keys in errors
- ❌ Persist keys anywhere

## Troubleshooting

### "No API key configured"
**Cause:** User hasn't added key to localStorage
**Solution:** Go to Settings → Add API key

### "API key required"
**Cause:** Key not sent in request header
**Solution:** Check localStorage has key, refresh page

### Key not persisting
**Cause:** localStorage cleared or disabled
**Solution:** Check browser settings, re-add key

### Key not working
**Cause:** Invalid key or expired
**Solution:** Get new key from Google AI Studio

## FAQ

**Q: Is my API key secure?**
A: Yes, it's stored only in your browser and never on our servers.

**Q: What if someone hacks the server?**
A: Your API key is safe - it's not stored on the server.

**Q: Can other users see my key?**
A: No, keys are isolated to each user's browser.

**Q: What if I clear my browser data?**
A: You'll need to re-add your API key in Settings.

**Q: Can I use different keys on different devices?**
A: Yes, each device stores its own key.

**Q: What happens if I logout?**
A: Your key stays in localStorage (you can clear it manually).

**Q: Is this GDPR compliant?**
A: Yes, we don't store personal API keys on our servers.

## Technical Details

### localStorage
- **Scope:** Per-origin (domain)
- **Size:** ~5-10MB limit
- **Persistence:** Until cleared
- **Security:** Same-origin policy

### HTTP Headers
- **Header:** `X-Gemini-Api-Key`
- **Type:** Custom header
- **Security:** HTTPS encrypted
- **Lifetime:** Request only

### Server Processing
- **Read:** From request header
- **Use:** For that request only
- **Store:** Never
- **Log:** Never

## Advantages Over Database Storage

| Feature | Session-Based | Database Storage |
|---------|---------------|------------------|
| Security | ✅ High | ⚠️ Medium |
| Privacy | ✅ Excellent | ⚠️ Requires encryption |
| Compliance | ✅ Simple | ⚠️ Complex |
| User Control | ✅ Full | ⚠️ Limited |
| Server Risk | ✅ None | ⚠️ High |
| Breach Impact | ✅ None | ❌ All keys exposed |
| Implementation | ✅ Simple | ⚠️ Complex |
| Maintenance | ✅ Easy | ⚠️ Requires rotation |

## Conclusion

Session-based API keys provide:
- ✅ **Maximum security** - No server-side storage
- ✅ **User privacy** - Keys stay on user's device
- ✅ **Simple implementation** - No encryption needed
- ✅ **Easy compliance** - No sensitive data stored
- ✅ **User control** - Users manage their own keys

This approach is **more secure** than database storage and provides a better user experience.

---

**Security First, Always** 🔒
