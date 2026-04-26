# ResumeForge Authentication Setup

## Overview

ResumeForge now includes secure user authentication and data persistence. Each user's data (library items, templates, and history) is isolated and protected.

## Security Features

✅ **Password Security**: Passwords are hashed using bcrypt (10 rounds)  
✅ **JWT Authentication**: Secure token-based authentication with 7-day expiry  
✅ **Rate Limiting**: Login/register endpoints limited to 5 attempts per 15 minutes  
✅ **Data Isolation**: Users can only access their own data  
✅ **SQL Injection Protection**: Parameterized queries throughout  
✅ **Environment Variables**: Sensitive keys stored in .env file  

## Setup Instructions

### 1. Configure JWT Secret

**IMPORTANT**: Before running the server, update your `.env` file with a secure JWT secret:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

Generate a secure random secret (minimum 32 characters):

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use a password generator
```

### 2. Install Dependencies

```bash
npm install
```

New dependencies added:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `express-rate-limit` - Rate limiting for security

### 3. Migrate Existing Data (Optional)

If you have existing data in your database, run the migration script:

```bash
node migrate-db.js
```

This will:
- Create a user account
- Associate all existing library items, templates, and history with that account
- Allow you to continue using your existing data

### 4. Start the Server

```bash
npm start
```

## Database Schema Changes

### New Tables

**users**
- `id` - Primary key
- `email` - Unique, required
- `password_hash` - Bcrypt hashed password
- `name` - Optional display name
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp

### Modified Tables

All data tables now include:
- `user_id` - Foreign key to users table
- Cascade delete on user deletion

**templates** table additions:
- `is_global` - Flag for system-wide templates (like Jake's template)

## API Changes

### New Endpoints

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe" // optional
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**GET /api/auth/me**
- Returns current user info
- Requires authentication

### Protected Endpoints

All existing endpoints now require authentication:
- `/api/library/*`
- `/api/templates/*`
- `/api/history/*`
- `/api/analyze`
- `/api/score`
- `/api/generate`

Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Frontend Changes

### Authentication Flow

1. User visits the app
2. If not authenticated, redirected to login/register page
3. After successful login, token stored in localStorage
4. Token automatically included in all API requests
5. Logout clears token and reloads app

### User Interface

- Login/Register page with tab switcher
- User name/email displayed in header
- Logout button in header
- Automatic redirect on auth failure

## Security Best Practices

### For Production

1. **Change JWT Secret**: Use a strong, random 32+ character secret
2. **Use HTTPS**: Always use HTTPS in production
3. **Rotate Secrets**: Periodically rotate JWT secrets
4. **Monitor Rate Limits**: Adjust rate limiting based on usage patterns
5. **Backup Database**: Regular backups of resumeforge.db
6. **Environment Variables**: Never commit .env to version control

### Password Requirements

- Minimum 8 characters
- Email validation enforced
- Passwords hashed with bcrypt (cost factor 10)

### Token Management

- Tokens expire after 7 days
- Expired tokens automatically trigger logout
- No refresh token (user must re-login)

## Troubleshooting

### "JWT_SECRET must be at least 32 characters"

Update your `.env` file with a longer secret key.

### "Authentication required" errors

- Check if token is present in localStorage
- Verify token hasn't expired
- Try logging out and back in

### Migration issues

- Ensure database file exists
- Check file permissions
- Verify no schema conflicts

## Data Privacy

- User passwords are never stored in plain text
- Each user can only access their own data
- User deletion cascades to all associated data
- No data sharing between users

## Future Enhancements

Potential improvements:
- Email verification
- Password reset functionality
- Two-factor authentication
- OAuth integration (Google, GitHub)
- Session management dashboard
- Account deletion with confirmation
