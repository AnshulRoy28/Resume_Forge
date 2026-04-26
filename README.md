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

## 🔒 Security & Privacy

- ✅ **Passwords encrypted** with bcrypt
- ✅ **JWT authentication** with secure tokens
- ✅ **Rate limiting** on auth endpoints
- ✅ **API keys stored client-side** - never in database
- ✅ **Data isolation** - users can only access their own data
- ✅ **SQL injection protection** - parameterized queries

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- SQLite (better-sqlite3)
- JWT authentication
- bcrypt password hashing

**Frontend:**
- Vanilla JavaScript
- Tailwind CSS
- Iconify icons

**AI:**
- Google Gemini 2.0 Flash (user-provided API keys)

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deploy to production
- [Authentication Setup](./AUTH_SETUP.md) - User authentication details
- [Session-Based API Keys](./SESSION_BASED_API_KEYS.md) - Security model
- [How to Get API Key](./HOW_TO_GET_API_KEY.md) - Step-by-step guide
- [Quick Reference](./QUICK_REFERENCE.md) - Quick commands and tips

## 🚀 Deployment

### Deploy to Render (Recommended)

1. Fork this repository
2. Create account on [Render](https://render.com)
3. Create new Web Service
4. Connect your GitHub repo
5. Add environment variable: `JWT_SECRET` (32+ chars)
6. Deploy!

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### Other Platforms

- Railway
- Heroku
- Vercel
- Any Node.js hosting

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
JWT_SECRET=your-secure-32-char-secret
PORT=3000
NODE_ENV=production
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Scripts

```bash
npm start              # Start server
npm run dev            # Development mode
npm run reset-db       # Reset database
npm run migrate        # Migrate existing data
```

## 📊 Features in Detail

### GitHub Repository Analysis
- Fetches repo metadata, languages, and structure
- Analyzes README and config files
- Generates comprehensive project summaries
- Auto-extracts relevant tags and technologies

### Smart Resume Generation
- Analyzes job descriptions
- Scores your projects for relevance
- Selects best-matching experiences
- Generates tailored LaTeX resumes
- Uses action verbs and quantifiable achievements

### Template System
- Default Jake's Resume template included
- Upload custom LaTeX templates
- Set default template per user
- Global templates for all users

### Library Management
- Store projects and experiences
- Tag and categorize items
- Search and filter
- Edit and update anytime

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- [Jake's Resume](https://github.com/jakegut/resume) - Default LaTeX template
- [Google Gemini](https://ai.google.dev/) - AI model
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Iconify](https://iconify.design/) - Icons

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/AnshulRoy28/Resume_Forge/issues)
- **Discussions:** [GitHub Discussions](https://github.com/AnshulRoy28/Resume_Forge/discussions)

## 🌟 Star History

If you find this project helpful, please give it a star! ⭐

## 📈 Roadmap

- [ ] Multiple AI provider support (OpenAI, Anthropic)
- [ ] PDF preview in browser
- [ ] Resume templates marketplace
- [ ] Team/organization accounts
- [ ] Resume version control
- [ ] Export to multiple formats
- [ ] Browser extension
- [ ] Mobile app

## 💡 Tips

- Use descriptive project titles
- Add comprehensive tags
- Keep library organized
- Update projects regularly
- Test different templates
- Tailor for each job

## 🔗 Links

- **Live Demo:** Coming soon
- **Documentation:** [Docs](./DEPLOYMENT_GUIDE.md)
- **API Reference:** See code comments
- **Changelog:** [CHANGELOG_API_KEYS.md](./CHANGELOG_API_KEYS.md)

---

**Made with ❤️ for job seekers everywhere**

**Get your free Gemini API key:** https://aistudio.google.com/apikey
