# ResumeForge - User Authentication & Data Persistence

## 🎉 What's New

ResumeForge now includes **secure user authentication** and **persistent data storage**! Each user gets their own private workspace where all their library items, templates, and resume history are securely stored and isolated.

## ✨ Key Features

### Security
- 🔐 **Encrypted Passwords** - Bcrypt hashing with 10 rounds
- 🎫 **JWT Authentication** - Secure token-based auth with 7-day expiry
- 🛡️ **Rate Limiting** - Protection against brute force attacks
- 🔒 **Data Isolation** - Users can only access their own data
- 🚫 **SQL Injection Protection** - Parameterized queries throughout

### User Experience
- 👤 **User Accounts** - Register and login with email/password
- 💾 **Persistent Storage** - All your data is saved and private
- 🔄 **Session Management** - Stay logged in for 7 days
- 🎨 **Clean UI** - Beautiful login/register interface
- 📱 **Responsive** - Works on all devices

### Data Privacy
- Each user has their own:
  - 📚 Library items (projects, experiences)
  - 📄 Custom templates
  - 📜 Generation history
  - ⚙️ Settings

## 🚀 Quick Start

### Option 1: Fresh Installation

```bash
# 1. Install dependencies
npm install

# 2. Reset database (creates new schema)
npm run reset-db

# 3. Start server
npm start

# 4. Open browser at http://localhost:3000
# 5. Register your account
# 6. Go to Settings and add your Gemini API key
```

### Option 2: Migrate Existing Data

```bash
# 1. Install dependencies
npm install

# 2. Add API key column to database
node add-api-key-column.js

# 3. Start server
npm start

# 4. Login and add your Gemini API key in Settings
```

## 📋 Requirements

- Node.js 16+
- npm or yarn
- **Gemini API Key** (free from [Google AI Studio](https://aistudio.google.com/apikey))
- Existing dependencies:
  - express
  - better-sqlite3
  - @google/genai
  - dotenv
  - multer

- New dependencies (auto-installed):
  - bcryptjs
  - jsonwebtoken
  - express-rate-limit

## 🔧 Configuration

### Environment Variables

Edit `.env` file:

```env
JWT_SECRET=your-secure-32-char-secret
GITHUB_TOKEN=your-github-token (optional)
PORT=3000 (optional)
```

**Note:** Gemini API keys are now provided by each user in Settings, not in .env file.

**IMPORTANT**: The JWT_SECRET must be at least 32 characters. Generate one:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔑 API Keys

### Gemini API Key (Required)

Each user must provide their own Gemini API key:

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in and create an API key
3. In ResumeForge, go to Settings
4. Paste your API key and save

**Benefits:**
- ✅ Free tier: 15 requests/min, 1500/day
- ✅ No rate limit conflicts between users
- ✅ Zero cost to server operator
- ✅ Better privacy and control

See [USER_API_KEYS.md](./USER_API_KEYS.md) for details.

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Detailed setup and configuration
- **[AUTHENTICATION_SUMMARY.md](./AUTHENTICATION_SUMMARY.md)** - Complete implementation details

## 🔐 Security Features

### Password Security
- Minimum 8 characters required
- Bcrypt hashing (never stored in plain text)
- Email format validation
- Duplicate email prevention

### API Security
- JWT token authentication on all protected routes
- Rate limiting: 5 attempts per 15 minutes on auth endpoints
- Automatic token expiration after 7 days
- Authorization checks on every request

### Data Security
- User data isolation (can't access other users' data)
- Foreign key constraints with cascade delete
- Database indexes for performance
- Parameterized queries (SQL injection protection)

## 🎯 API Endpoints

### Public Endpoints
```
POST /api/auth/register - Create new account
POST /api/auth/login    - Login to account
```

### Protected Endpoints (require JWT token)
```
GET    /api/auth/me           - Get current user
GET    /api/library           - Get user's library
POST   /api/library           - Create library item
PUT    /api/library/:id       - Update library item
DELETE /api/library/:id       - Delete library item
GET    /api/templates         - Get user's templates
POST   /api/templates         - Create template
DELETE /api/templates/:id     - Delete template
GET    /api/history           - Get user's history
DELETE /api/history/:id       - Delete history item
POST   /api/analyze           - Analyze GitHub repo
POST   /api/score             - Score library items
POST   /api/generate          - Generate resume
```

## 🧪 Testing

### Manual Testing Checklist

1. **Registration**
   - [ ] Register with valid email/password
   - [ ] Try duplicate email (should fail)
   - [ ] Try invalid email (should fail)
   - [ ] Try short password (should fail)

2. **Login**
   - [ ] Login with correct credentials
   - [ ] Try wrong password (should fail)
   - [ ] Check token in localStorage
   - [ ] Verify user name in header

3. **Session**
   - [ ] Refresh page (should stay logged in)
   - [ ] Logout (should clear token)
   - [ ] Try accessing app without login (should redirect)

4. **Data Isolation**
   - [ ] Create library items
   - [ ] Logout and register new user
   - [ ] Verify first user's data not visible

5. **API Protection**
   - [ ] Try API call without token (should fail)
   - [ ] Try API call with invalid token (should fail)

## 🛠️ Scripts

```bash
npm start        # Start the server
npm run dev      # Start in development mode
npm run migrate  # Migrate existing data
npm run reset-db # Reset database to new schema
```

## 📁 File Structure

```
.
├── server.js                      # Main server with auth
├── package.json                   # Dependencies
├── .env                          # Environment variables
├── resumeforge.db                # SQLite database
├── migrate-db.js                 # Migration script
├── reset-db.js                   # Database reset script
├── public/
│   ├── index.html               # Main HTML (updated)
│   ├── css/
│   │   └── app.css              # Styles (updated)
│   ├── js/
│   │   ├── app.js               # Main app (updated)
│   │   ├── auth.js              # Auth module (new)
│   │   ├── generate.js
│   │   ├── library.js
│   │   ├── templates.js
│   │   ├── history.js
│   │   └── settings.js
│   └── pages/
│       ├── auth.html            # Login/register page (new)
│       ├── generate.html
│       ├── library.html
│       ├── templates.html
│       ├── history.html
│       └── settings.html
└── docs/
    ├── QUICKSTART.md
    ├── AUTH_SETUP.md
    └── AUTHENTICATION_SUMMARY.md
```

## 🐛 Troubleshooting

### Server won't start
- **Error**: "JWT_SECRET must be at least 32 characters"
  - **Fix**: Update JWT_SECRET in .env file

- **Error**: "no such column: user_id"
  - **Fix**: Run `npm run reset-db` to update database schema

### Can't login
- **Error**: "Invalid credentials"
  - **Fix**: Check email/password are correct
  
- **Error**: "Too many attempts"
  - **Fix**: Wait 15 minutes for rate limit to reset

### Data not showing
- Check you're logged in (user name in header)
- Check browser console for errors
- Verify token exists in localStorage
- Try logout and login again

### Migration issues
- Ensure database file exists before migration
- Check file permissions
- Backup database before migration
- Use `npm run reset-db` for fresh start

## 🔄 Migration from Old Version

If you have existing data:

1. **Backup your database**
   ```bash
   cp resumeforge.db resumeforge.db.backup
   ```

2. **Run migration**
   ```bash
   npm run migrate
   ```

3. **Follow prompts** to create your account

4. **Verify data** after login

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Change JWT_SECRET to production secret
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Review rate limiting settings
- [ ] Set up error logging
- [ ] Test all auth flows
- [ ] Review security headers

### Recommended Security Headers

```javascript
app.use(helmet()); // Add helmet for security headers
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

## 🤝 Contributing

When contributing, ensure:
- All new endpoints are protected with `authenticateToken`
- User data is properly isolated
- Passwords are never logged or exposed
- Input validation is thorough
- Tests cover auth scenarios

## 📝 License

Same as ResumeForge main project.

## 🙏 Acknowledgments

- bcryptjs for password hashing
- jsonwebtoken for JWT implementation
- express-rate-limit for rate limiting
- better-sqlite3 for database

## 📞 Support

For issues:
1. Check documentation files
2. Review troubleshooting section
3. Check browser console for errors
4. Verify environment variables
5. Try fresh database reset

---

**Made with ❤️ for secure resume generation**
