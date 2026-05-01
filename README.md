# ResumeForge 🚀

AI-powered resume generation platform that analyzes your GitHub repositories and creates tailored resumes for specific job applications.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AnshulRoy28/Resume_Forge)

**🎉 Ready to deploy? Click the button above to deploy in 5 minutes!**

See [DEPLOY_INSTRUCTIONS.md](./DEPLOY_INSTRUCTIONS.md) for step-by-step guide.

## ✨ Features

- 🤖 **AI-Powered Analysis** - Automatically analyzes GitHub repositories using Gemini AI
- 📝 **Smart Resume Generation** - Creates tailored LaTeX resumes for specific job descriptions
- ✏️ **Integrated LaTeX Editor** - Edit and preview resumes in real-time with split-view mode
- 🎯 **2026 ATS Optimization** - Implements latest strategies to beat Applicant Tracking Systems
- ✅ **Verification System** - Two-stage fact-checking prevents AI hallucinations and ensures accuracy
- 📚 **Project Library** - Store and manage your projects, experiences, skills, and certifications
- 🎲 **Job Matching** - Scores your items against job descriptions using AI
- 📄 **Custom Templates** - Use or create your own LaTeX resume templates
- 📜 **Generation History** - Track all your generated resumes
- 🔐 **Secure Authentication** - User accounts with JWT authentication
- 🔒 **Privacy First** - API keys stored client-side only, never on server

## 🎯 ATS Optimization (2026 Standards)

ResumeForge implements cutting-edge ATS optimization strategies:

- ✅ **Keyword Optimization** - Uses both acronyms and full forms (e.g., "Machine Learning (ML)")
- ✅ **Exact Title Matching** - Matches job titles from posting (10x more likely to get interview)
- ✅ **Power Language** - Enforces action verbs, forbids passive language
- ✅ **Quantification** - Every bullet point includes measurable impact
- ✅ **Halo Effect Ordering** - Most impressive items first for strong first impression
- ✅ **Single-Column Layout** - ATS-friendly formatting that parses correctly
- ✅ **File Naming Hack** - Automatic `FirstName_LastName_JobTitle_Year` format
- ✅ **Skill Frequency** - Repeats top 5 skills 2-3 times for ATS ranking

See [ATS_OPTIMIZATION_GUIDE.md](./docs/ATS_OPTIMIZATION_GUIDE.md) for complete details.

## 🚀 Quick Start

**See [QUICK_START.md](QUICK_START.md) for detailed instructions.**

### Docker (Local)

```bash
# Windows
docker-start.bat

# Linux/Mac
./docker-start.sh
```

### Deploy to Render (Production)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AnshulRoy28/Resume_Forge)

Click button → Sign in → Deploy → Done in 5 minutes!

## 🔑 Getting Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your key (starts with `AIza`)
5. In ResumeForge, go to Settings and paste your key
6. Your key is stored only in your browser - never on our servers!

## 📖 How It Works

1. **Register & Login** - Create your secure account with profile information
2. **Add API Key** - Provide your Gemini API key in Settings (stored in browser only)
3. **Build Library** - Add projects, experiences, skills, certifications, and education
4. **Analyze Repos** - Optionally paste GitHub repo URLs to auto-generate project summaries
5. **Generate Resumes** - Paste job descriptions and get ATS-optimized tailored resumes
6. **Edit & Preview** - Use the integrated LaTeX editor with live preview to refine your resume
7. **Download & Apply** - Get LaTeX source or HTML with optimized file naming for ATS systems

## ✏️ Integrated LaTeX Editor

ResumeForge includes a powerful LaTeX editor similar to Overleaf:

**Editor Modes:**
- **Editor Mode** - Full-screen LaTeX editing with syntax highlighting
- **Split View** - Side-by-side editor and live preview with auto-update
- **Preview Mode** - Full-screen rendered preview for final review
- **Sources Mode** - View library items used in generation

**Features:**
- ✅ Real-time preview updates (1-second delay in split view)
- ✅ Auto-sync between editor and split view
- ✅ Monospace font with proper indentation
- ✅ Copy, download .TEX, or download .HTML
- ✅ Edit generated resumes directly in browser
- ✅ No need for external LaTeX editors

See [LATEX_EDITOR_GUIDE.md](./docs/LATEX_EDITOR_GUIDE.md) for complete editor documentation.

### Two-Stage Verification Process

ResumeForge uses an advanced **three-stage generation with verification** to ensure accuracy:

**Stage 1: Generate with Strict Fact-Checking**
- Score and generate sections in parallel (projects, experience, skills)
- Each section includes strict "DO NOT invent" instructions
- Source content clearly marked as "GROUND TRUTH"
- Conservative interpretation of vague metrics

**Stage 2: Integrate into Final Resume**
- Insert contact information and metadata
- Enforce single-column ATS-friendly layout
- Apply 2026 optimization guidelines
- Ensure valid LaTeX syntax

**Stage 3: Verify Accuracy**
- AI-powered fact-checking against source library items
- Detects hallucinated metrics, technologies, or achievements
- Classifies issues by severity (high/medium/low)
- Automatically regenerates if critical issues found
- Ensures 100% accuracy to source content

**What's Verified:**
- ✅ Metrics and percentages (no exaggeration)
- ✅ Technologies and tools (no invention)
- ✅ Achievements and responsibilities (no fabrication)
- ✅ Dates, organizations, locations (no errors)
- ✅ Paraphrasing allowed (same facts, different words)

See [VERIFICATION_SYSTEM.md](./docs/VERIFICATION_SYSTEM.md) for complete technical details.

## 🚀 Deployment

### Docker (Recommended) 🐳

```bash
docker-compose up -d
```

See [QUICK_START.md](QUICK_START.md) for detailed instructions.

### Deploy to Render (Free)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AnshulRoy28/Resume_Forge)

One-click deployment to production. See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for details.

### Other Platforms
- Docker (any cloud provider)
- Railway
- Heroku  
- Vercel
- AWS ECS / Google Cloud Run / Azure Container Instances

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

### Quick Guides
- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md)** - Docker commands cheat sheet
- **[GITHUB_RATE_LIMIT_FIX.md](GITHUB_RATE_LIMIT_FIX.md)** - Fix GitHub API rate limits

### Complete Guides
- **[docs/DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md)** - Complete Docker documentation
- **[docs/DOCKER_ARCHITECTURE.md](docs/DOCKER_ARCHITECTURE.md)** - Architecture diagrams
- **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - All deployment options
- **[docs/LATEX_EDITOR_GUIDE.md](docs/LATEX_EDITOR_GUIDE.md)** - LaTeX editor documentation
- **[docs/VERIFICATION_SYSTEM.md](docs/VERIFICATION_SYSTEM.md)** - AI verification system
- **[docs/ATS_OPTIMIZATION_GUIDE.md](docs/ATS_OPTIMIZATION_GUIDE.md)** - 2026 ATS strategies

### Feature Guides
- **[docs/HOW_TO_GET_API_KEY.md](docs/HOW_TO_GET_API_KEY.md)** - Get Gemini API key
- **[docs/LIBRARY_TYPES.md](docs/LIBRARY_TYPES.md)** - Understanding item types
- **[docs/ADDING_ITEMS_GUIDE.md](docs/ADDING_ITEMS_GUIDE.md)** - Add projects & experiences

## 📁 Project Structure

```
Resume_Forge/
├── server.js              # Main server application
├── package.json           # Dependencies and scripts
├── public/                # Frontend files
│   ├── index.html        # Main HTML
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript modules
│   └── pages/            # Page templates
├── templates/             # Resume templates
│   └── jake_resume.md    # Default LaTeX template
├── scripts/               # Utility scripts
│   ├── reset-db.js       # Database initialization
│   ├── migrate-db.js     # Data migration
│   └── deploy.sh         # Deployment helper
├── docs/                  # Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   └── HOW_TO_GET_API_KEY.md
├── Procfile              # Heroku config
├── render.yaml           # Render config
└── vercel.json           # Vercel config
```

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
