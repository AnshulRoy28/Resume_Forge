# Quick Start Guide - User Authentication

## For New Users (Fresh Install)

1. **Update JWT Secret** (REQUIRED)
   ```bash
   # Edit .env file and replace the JWT_SECRET with a secure random string (32+ chars)
   # Generate one with:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Reset database to new schema**
   ```bash
   npm run reset-db
   ```
   This creates a fresh database with the authentication schema.

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - You'll see the login/register page
   - Click "Register" tab
   - Create your account

5. **Start using ResumeForge**
   - All your data is now private and secure
   - Library items, templates, and history are saved to your account

## For Existing Users (with data)

1. **Update JWT Secret** (REQUIRED)
   ```bash
   # Edit .env file and replace the JWT_SECRET
   ```

2. **Run migration**
   ```bash
   npm run migrate
   ```
   - Follow the prompts to create your account
   - All existing data will be associated with this account

3. **Start the server**
   ```bash
   npm start
   ```

4. **Login**
   - Use the email and password you created during migration

## What Changed?

### Security
- ✅ Passwords are encrypted (bcrypt)
- ✅ JWT token authentication
- ✅ Rate limiting on login attempts
- ✅ Data isolation per user

### User Experience
- Login/Register page on first visit
- User name displayed in header
- Logout button
- Session persists for 7 days

### Data
- All library items are private to your account
- Templates are private (except global ones like Jake's template)
- History is private to your account
- No data sharing between users

## Testing

Try these scenarios:

1. **Register a new account**
   - Email: test@example.com
   - Password: testpassword123

2. **Add some library items**
   - Analyze a GitHub repo
   - Manually add a project

3. **Generate a resume**
   - Add a job description
   - Select library items
   - Generate LaTeX output

4. **Logout and login again**
   - Verify your data persists

5. **Try registering with same email**
   - Should show error: "Email already registered"

## Troubleshooting

**Server won't start**
- Check JWT_SECRET is at least 32 characters
- Verify all dependencies installed: `npm install`

**Can't login**
- Check email/password are correct
- Wait 15 minutes if rate limited
- Clear browser localStorage and try again

**Data not showing**
- Verify you're logged in (check header for user name)
- Check browser console for errors
- Verify token in localStorage

**Migration failed**
- Ensure database file exists
- Check you have write permissions
- Try deleting resumeforge.db and starting fresh

## Next Steps

- Read [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed documentation
- Update JWT_SECRET to a production-grade secret
- Consider adding HTTPS for production deployment
- Set up regular database backups
