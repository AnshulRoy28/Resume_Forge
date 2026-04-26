# ResumeForge 🚀

AI-powered resume generation platform that analyzes your GitHub repositories and creates tailored resumes for specific job applications.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## ✨ Features

- 🤖 **AI-Powered Analysis** - Automatically analyzes GitHub repositories using Gemini AI
- 📝 **Smart Resume Generation** - Creates tailored LaTeX resumes for specific job descriptions
- 📚 **Project Library** - Store and manage your projects and experiences
- 🎯 **Job Matching** - Scores your projects against job descriptions
- 📄 **Custom Templates** - Use or create your own LaTeX resume templates
- 📜 **Generation History** - Track all your generated resumes
- 🔐 **Secure Authentication** - User accounts with JWT authentication
- 🔒 **Privacy First** - API keys stored client-side only, never on server

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/AnshulRoy28/Resume_Forge.git
cd Resume_Forge

# Install dependencies
npm install

# Create database
npm run reset-db

# Start the server
npm start
```

Visit `http://localhost:3000` and create your account!

## 🔑 Getting Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your key (starts with `AIza`)
5. In ResumeForge, go to Settings and paste your key
6. Your key is stored only in your browser - never on our servers!

## 📖 How It Works

1. **Register & Login** - Create your secure account
2. **Add API Key** - Provide your Gemini API key in Settings
3. **Analyze Repos** - Paste GitHub repo URLs to auto-generate project summaries
4. **Build Library** - Collect your projects and experiences
5. **Generate Resumes** - Paste job descriptions and get tailored LaTeX resumes
6. **Download & Apply** - Compile LaTeX and apply to jobs!

## 🚀 Deployment

### Deploy to Render (Recommended - Free)

1. Fork this repository
2. Create account on [Render](https://render.com)
3. Create new Web Service → Connect your GitHub repo
4. Add environment variable: `JWT_SECRET` (generate with command below)
5. Deploy!

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### Other Platforms
- Railway
- Heroku  
- Vercel
- Any Node.js hosting

## 🔧 Configuration

Create `.env` file (don't commit this):

```env
JWT_SECRET=your-secure-32-char-secret
PORT=3000
NODE_ENV=production
```

## 🛠️ Tech Stack

**Backend:** Node.js, Express, SQLite, JWT, bcrypt  
**Frontend:** Vanilla JavaScript, Tailwind CSS  
**AI:** Google Gemini 2.0 Flash (user-provided API keys)

## 🔒 Security

- ✅ Passwords encrypted with bcrypt
- ✅ JWT authentication with secure tokens
- ✅ Rate limiting on auth endpoints
- ✅ API keys stored client-side only (never in database)
- ✅ Data isolation per user
- ✅ SQL injection protection

## 📚 Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [HOW_TO_GET_API_KEY.md](./HOW_TO_GET_API_KEY.md) - Step-by-step API key guide

## 🤝 Contributing

Contributions welcome! Fork the repo, make changes, and submit a pull request.

## 📝 License

MIT License

## 🙏 Acknowledgments

- [Jake's Resume](https://github.com/jakegut/resume) - Default LaTeX template
- [Google Gemini](https://ai.google.dev/) - AI model
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/AnshulRoy28/Resume_Forge/issues)

---

**Made with ❤️ for job seekers everywhere**

**Get your free Gemini API key:** https://aistudio.google.com/apikey
