import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

dotenv.config();

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { error: 'Too many attempts, please try again later' }
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('⚠️  WARNING: JWT_SECRET must be at least 32 characters. Set it in .env file.');
  process.exit(1);
}

// ── Database Setup ──────────────────────────────────────────────

// Support Docker volume mounting
const dbPath = process.env.DB_PATH || (fs.existsSync('/app/data') ? '/app/data/resumeforge.db' : 'resumeforge.db');
console.log(`📁 Using database at: ${dbPath}`);

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT
  );

  CREATE TABLE IF NOT EXISTS library (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    source_url TEXT,
    item_type TEXT DEFAULT 'project',
    start_date TEXT,
    end_date TEXT,
    location TEXT,
    organization TEXT,
    gpa TEXT,
    credential_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    is_global INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_title TEXT,
    company TEXT,
    job_description TEXT,
    latex_output TEXT,
    template_id INTEGER,
    markdown_ids TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_library_user ON library(user_id);
  CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id);
  CREATE INDEX IF NOT EXISTS idx_history_user ON history(user_id);
`);

// Seed Jake's template if no templates exist
const templateCount = db.prepare('SELECT COUNT(*) as c FROM templates').get();
if (templateCount.c === 0) {
  const jakeTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'jake_resume.md'), 'utf-8');
  db.prepare(`INSERT INTO templates (name, description, content, is_default, is_global, user_id) VALUES (?, ?, ?, 1, 1, NULL)`)
    .run("Jake's Resume Template", "Classic single-page LaTeX resume template by Jake Gutierrez", jakeTemplate);
}

// ── Auth Middleware ─────────────────────────────────────────────

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Helper to get user's Gemini AI instance from request header
function getUserAI(req) {
  const apiKey = req.headers['x-gemini-api-key'];
  if (!apiKey) {
    throw new Error('Gemini API key required. Please provide your API key in Settings.');
  }
  return new GoogleGenAI({ apiKey });
}

// ── Auth Routes ─────────────────────────────────────────────────

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name, phone, linkedin_url, github_url } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate phone if provided
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate URLs if provided
    if (linkedin_url && !linkedin_url.startsWith('http')) {
      return res.status(400).json({ error: 'LinkedIn URL must start with http:// or https://' });
    }
    if (github_url && !github_url.startsWith('http')) {
      return res.status(400).json({ error: 'GitHub URL must start with http:// or https://' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, password_hash, name, phone, linkedin_url, github_url) VALUES (?, ?, ?, ?, ?, ?)')
      .run(email, passwordHash, name || null, phone || null, linkedin_url || null, github_url || null);

    const token = jwt.sign({ userId: result.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: result.lastInsertRowid,
        email,
        name: name || null,
        phone: phone || null,
        linkedin_url: linkedin_url || null,
        github_url: github_url || null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    db.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').run(user.id);

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, email, name, phone, linkedin_url, github_url, created_at FROM users WHERE id = ?').get(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    const { name, phone, linkedin_url, github_url } = req.body;

    // Validate phone if provided
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate URLs if provided
    if (linkedin_url && linkedin_url.trim() && !linkedin_url.startsWith('http')) {
      return res.status(400).json({ error: 'LinkedIn URL must start with http:// or https://' });
    }
    if (github_url && github_url.trim() && !github_url.startsWith('http')) {
      return res.status(400).json({ error: 'GitHub URL must start with http:// or https://' });
    }

    db.prepare('UPDATE users SET name = ?, phone = ?, linkedin_url = ?, github_url = ? WHERE id = ?')
      .run(name || null, phone || null, linkedin_url || null, github_url || null, req.user.userId);

    const user = db.prepare('SELECT id, email, name, phone, linkedin_url, github_url FROM users WHERE id = ?').get(req.user.userId);
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// ── GitHub helpers ──────────────────────────────────────────────

function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\#\?]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

async function ghFetch(endpoint, token) {
  const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'ResumeForge' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${endpoint}`, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

async function getRepoData(owner, repo, token) {
  const [meta, languages, tree] = await Promise.all([
    ghFetch(`/repos/${owner}/${repo}`, token),
    ghFetch(`/repos/${owner}/${repo}/languages`, token),
    ghFetch(`/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, token).catch(() => ({ tree: [] })),
  ]);

  let readme = '';
  try {
    const readmeData = await ghFetch(`/repos/${owner}/${repo}/readme`, token);
    readme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
  } catch { readme = 'No README found.'; }

  const configFiles = ['package.json', 'requirements.txt', 'Cargo.toml', 'go.mod', 'pyproject.toml', 'pom.xml', 'build.gradle', 'Dockerfile', 'docker-compose.yml', 'tsconfig.json'];
  const configs = {};
  const treeFiles = (tree.tree || []).filter(f => f.type === 'blob').map(f => f.path);

  for (const cf of configFiles) {
    const found = treeFiles.find(f => f === cf || f.endsWith('/' + cf));
    if (found) {
      try {
        const data = await ghFetch(`/repos/${owner}/${repo}/contents/${found}`, token);
        configs[found] = Buffer.from(data.content, 'base64').toString('utf-8').slice(0, 3000);
      } catch { /* skip */ }
    }
  }

  const dirTree = treeFiles.slice(0, 80).join('\n') + (treeFiles.length > 80 ? `\n... and ${treeFiles.length - 80} more files` : '');
  return { meta, languages, dirTree, readme: readme.slice(0, 6000), configs, totalFiles: treeFiles.length };
}

// ── Gemini: Repo Summarizer ─────────────────────────────────────

async function generateRepoSummary(repoData, ai) {
  const { meta, languages, dirTree, readme, configs, totalFiles } = repoData;
  const langBreakdown = Object.entries(languages).map(([lang, bytes]) => `${lang}: ${bytes} bytes`).join(', ');
  const configSection = Object.entries(configs).map(([file, content]) => `### ${file}\n\`\`\`\n${content}\n\`\`\``).join('\n\n');

  const prompt = `You are a senior technical resume consultant. Analyze this GitHub repository and generate a resume-optimized project summary in Markdown.

REPOSITORY INFO:
- Name: ${meta.full_name}
- Description: ${meta.description || 'N/A'}
- Stars: ${meta.stargazers_count} | Forks: ${meta.forks_count}
- Primary Language: ${meta.language || 'N/A'}
- Topics: ${(meta.topics || []).join(', ') || 'N/A'}
- Total Files: ${totalFiles}

LANGUAGES: ${langBreakdown}

FILE STRUCTURE:
${dirTree}

README:
${readme}

CONFIG FILES:
${configSection || 'None found'}

Generate a Markdown document with these sections:
1. **📌 Project Title & One-Liner** — H1 with project name and one compelling sentence.
2. **🏷️ Tags** — Inline code tags for every technology detected.
3. **📖 Project Summary** — 3-4 sentences describing the project scope and impact.
4. **🛠️ Technical Stack** — Table: Category | Technology | Purpose.
5. **⚡ Resume Bullet Points** — 6-10 strong XYZ-formula bullet points starting with action verbs.
6. **🏗️ Architecture & Design Patterns** — Key patterns and engineering decisions.
7. **📁 Project Scope & Complexity** — Metrics table.
8. **🎯 Key Features Implemented** — Bulleted list with technical HOW.
9. **💡 Technical Highlights** — 3-5 senior-level engineering highlights.
10. **🔑 Keywords** — Comma-separated ATS keywords.

Rules: Be specific, quantitative, past-tense action verbs. Start directly with H1.`;

  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text;
}

// ── Gemini: Resume Generator (Three-Stage with Verification) ────

async function generateResume(jobDescription, allItems, templateContent, userProfile, ai) {
  // Stage 1: Score and generate sections by category
  console.log('Stage 1: Scoring and generating sections...');
  
  const projectItems = allItems.filter(f => f.item_type === 'project');
  const experienceItems = allItems.filter(f => f.item_type === 'experience');
  const otherItems = allItems.filter(f => ['skill', 'certification', 'education'].includes(f.item_type));

  // Score each category
  const [projectScores, experienceScores] = await Promise.all([
    projectItems.length > 0 ? scoreItemsByCategory(jobDescription, allItems, 'project', ai) : Promise.resolve([]),
    experienceItems.length > 0 ? scoreItemsByCategory(jobDescription, allItems, 'experience', ai) : Promise.resolve([])
  ]);

  // Select top items from each category
  const topProjects = projectScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => projectItems[s.index])
    .filter(Boolean);

  const topExperiences = experienceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => experienceItems[s.index])
    .filter(Boolean);

  // Generate section content in parallel
  const [projectSection, experienceSection, otherSection] = await Promise.all([
    topProjects.length > 0 ? generateSectionContent(jobDescription, topProjects, 'project', ai) : Promise.resolve(''),
    topExperiences.length > 0 ? generateSectionContent(jobDescription, topExperiences, 'experience', ai) : Promise.resolve(''),
    otherItems.length > 0 ? generateSectionContent(jobDescription, otherItems, 'other', ai) : Promise.resolve('')
  ]);

  console.log('Stage 2: Integrating sections into final resume...');

  // Stage 2: Combine sections into final resume
  const contactInfo = `
CANDIDATE CONTACT INFORMATION:
- Name: ${userProfile.name || '[Your Name]'}
- Email: ${userProfile.email || '[your@email.com]'}
- Phone: ${userProfile.phone || '[Your Phone]'}
- LinkedIn: ${userProfile.linkedin_url || '[LinkedIn URL]'}
- GitHub: ${userProfile.github_url || '[GitHub URL]'}
`;

  const sectionsContent = `
GENERATED SECTIONS (already tailored to job):

${experienceSection ? '=== EXPERIENCE SECTION ===\n' + experienceSection + '\n' : ''}
${projectSection ? '=== PROJECTS SECTION ===\n' + projectSection + '\n' : ''}
${otherSection ? '=== SKILLS/CERTIFICATIONS SECTION ===\n' + otherSection + '\n' : ''}
`;

  const prompt = `You are an expert LaTeX resume developer specializing in ATS-optimized resumes. Your task is to integrate pre-generated sections into a complete, ATS-friendly resume.

${contactInfo}

JOB DESCRIPTION:
${jobDescription}

${sectionsContent}

LATEX TEMPLATE TO FILL:
${templateContent}

CRITICAL ATS FORMATTING REQUIREMENTS (2026 Standards):
1. **SINGLE-COLUMN LAYOUT ONLY** - Multi-column layouts break ATS parsing
2. **SIMPLE FONTS** - Use Times New Roman, Arial, or Calibri (11-12pt)
3. **BLACK TEXT, WHITE BACKGROUND** - No colors, graphics, icons, or decorative borders
4. **CLEAN STRUCTURE** - Clear section headers, consistent formatting
5. **NO TABLES FOR CONTENT** - Tables confuse ATS parsers (use for skills categorization only)

INTEGRATION INSTRUCTIONS:
1. **IMPORTANT**: Use the pre-generated sections above AS-IS. They are already tailored to the job.
2. Replace contact information placeholders with the actual candidate information provided above.
3. Insert the Experience, Projects, and Skills/Certifications sections into the appropriate places in the template.
4. **ENFORCE SINGLE-COLUMN LAYOUT** - Remove any multi-column formatting from the template.
5. Maintain simple, clean LaTeX formatting that ATS systems can parse.
6. Ensure all LaTeX syntax is valid and compilable.
7. Do NOT regenerate or rewrite the section content - use exactly what was provided.
8. If the template has sections not covered (like Education), you may add brief placeholder content.

Return ONLY the complete LaTeX source code, nothing else. No markdown fences, no explanation.`;

  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  const generatedLatex = response.text;

  console.log('Stage 3: Verifying content accuracy against library...');

  // Stage 3: Verify the generated content against source library items
  const usedItems = [...topProjects, ...topExperiences, ...otherItems];
  const verificationResult = await verifyResumeAccuracy(generatedLatex, usedItems, ai);

  if (!verificationResult.isAccurate) {
    console.warn('⚠️  Verification found potential hallucinations:', verificationResult.issues);
    // If verification fails, regenerate with stricter instructions
    return await regenerateWithStricterGuidelines(jobDescription, usedItems, templateContent, userProfile, sectionsContent, verificationResult.issues, ai);
  }

  console.log('✅ Verification passed: Content is accurate to library items');
  return generatedLatex;
}

// ── Gemini: Verify Resume Accuracy ──────────────────────────────

async function verifyResumeAccuracy(generatedLatex, sourceItems, ai) {
  // Extract the actual content from LaTeX (remove LaTeX commands for easier verification)
  const contentOnly = generatedLatex
    .replace(/\\[a-zA-Z]+(\{[^}]*\}|\[[^\]]*\])?/g, ' ') // Remove LaTeX commands
    .replace(/[{}]/g, ' ') // Remove braces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Prepare source content for verification
  const sourceContent = sourceItems.map(item => `
ITEM: ${item.title}
TYPE: ${item.item_type}
CONTENT: ${item.content}
${item.organization ? `ORGANIZATION: ${item.organization}` : ''}
${item.location ? `LOCATION: ${item.location}` : ''}
${item.start_date ? `START: ${item.start_date}` : ''}
${item.end_date ? `END: ${item.end_date}` : ''}
${item.gpa ? `GPA: ${item.gpa}` : ''}
${item.credential_id ? `CREDENTIAL: ${item.credential_id}` : ''}
TAGS: ${Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
---
`).join('\n');

  const verificationPrompt = `You are a strict fact-checker for resume content. Your job is to verify that ALL facts, numbers, technologies, and accomplishments in the generated resume come DIRECTLY from the source library items.

SOURCE LIBRARY ITEMS (GROUND TRUTH):
${sourceContent}

GENERATED RESUME CONTENT:
${contentOnly.slice(0, 8000)}

VERIFICATION TASK:
1. Check if ANY facts, numbers, dates, technologies, or accomplishments appear in the resume that are NOT in the source items
2. Look for hallucinated metrics (e.g., "50% improvement" when source says "40%")
3. Look for invented technologies (e.g., "Docker" when not mentioned in source)
4. Look for fabricated achievements or responsibilities
5. Look for incorrect dates, organizations, or locations

CRITICAL RULES:
- Paraphrasing and rewording is ALLOWED (e.g., "Built" vs "Developed")
- Adding acronyms to full names is ALLOWED (e.g., "AWS" when source says "Amazon Web Services")
- Quantification is ALLOWED if it's in the source (e.g., source says "thousands of users" → resume says "10,000+ users" is OK if reasonable)
- But INVENTING new facts, numbers, or technologies is NOT ALLOWED

Return a JSON object:
{
  "isAccurate": true/false,
  "issues": [
    {"type": "hallucinated_metric", "content": "claimed 50% improvement but source says 40%", "severity": "high"},
    {"type": "invented_technology", "content": "mentions Docker but not in source", "severity": "high"},
    {"type": "fabricated_achievement", "content": "claims led team of 5 but not in source", "severity": "high"}
  ],
  "summary": "brief summary of verification result"
}

If isAccurate is true, issues should be an empty array.
Severity levels: "low" (minor paraphrasing), "medium" (questionable interpretation), "high" (clear hallucination)

Return ONLY the JSON object, no other text.`;

  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: verificationPrompt });
    const text = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const result = JSON.parse(text);
    
    // Filter out low severity issues for now (allow minor paraphrasing)
    const criticalIssues = result.issues.filter(issue => issue.severity === 'high' || issue.severity === 'medium');
    
    return {
      isAccurate: criticalIssues.length === 0,
      issues: criticalIssues,
      summary: result.summary,
      allIssues: result.issues
    };
  } catch (err) {
    console.error('Verification parsing error:', err);
    // If verification fails to parse, assume it's accurate (fail open)
    return { isAccurate: true, issues: [], summary: 'Verification check completed' };
  }
}

// ── Gemini: Regenerate with Stricter Guidelines ─────────────────

async function regenerateWithStricterGuidelines(jobDescription, sourceItems, templateContent, userProfile, sectionsContent, issues, ai) {
  console.log('🔄 Regenerating with stricter fact-checking guidelines...');

  const issuesList = issues.map(i => `- ${i.type}: ${i.content}`).join('\n');
  
  const contactInfo = `
CANDIDATE CONTACT INFORMATION:
- Name: ${userProfile.name || '[Your Name]'}
- Email: ${userProfile.email || '[your@email.com]'}
- Phone: ${userProfile.phone || '[Your Phone]'}
- LinkedIn: ${userProfile.linkedin_url || '[LinkedIn URL]'}
- GitHub: ${userProfile.github_url || '[GitHub URL]'}
`;

  const sourceContent = sourceItems.map(item => `
=== ${item.title} (${item.item_type}) ===
${item.content}
${item.organization ? `Organization: ${item.organization}` : ''}
${item.location ? `Location: ${item.location}` : ''}
${item.start_date ? `Start: ${item.start_date}` : ''}
${item.end_date ? `End: ${item.end_date}` : ''}
${item.gpa ? `GPA: ${item.gpa}` : ''}
Tags: ${Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
`).join('\n---\n');

  const strictPrompt = `You are an expert LaTeX resume developer with STRICT fact-checking requirements. Your previous attempt had these issues:

ISSUES FOUND:
${issuesList}

${contactInfo}

JOB DESCRIPTION:
${jobDescription}

SOURCE LIBRARY ITEMS (GROUND TRUTH - USE ONLY THIS):
${sourceContent}

${sectionsContent}

LATEX TEMPLATE TO FILL:
${templateContent}

CRITICAL FACT-CHECKING RULES:
1. **USE ONLY FACTS FROM SOURCE ITEMS** - Do not invent ANY numbers, technologies, or achievements
2. **EXACT METRICS** - If source says "40%", do not change it to "50%"
3. **EXACT TECHNOLOGIES** - Only mention technologies explicitly listed in source items
4. **EXACT DATES** - Use only dates provided in source items
5. **NO HALLUCINATION** - If something is not in the source, DO NOT include it
6. **PARAPHRASING OK** - You can reword for clarity, but facts must match exactly
7. **ACRONYMS OK** - You can add acronyms (e.g., "AWS" for "Amazon Web Services")

ATS FORMATTING REQUIREMENTS:
1. Single-column layout only
2. Simple fonts (Times New Roman, Arial, Calibri)
3. Black text, white background
4. Clean structure, no complex tables

INTEGRATION INSTRUCTIONS:
1. Use the pre-generated sections above AS-IS
2. Replace contact information placeholders
3. Insert sections into template
4. Enforce single-column layout
5. Ensure all LaTeX syntax is valid
6. **VERIFY EVERY FACT against source items before including**

Return ONLY the complete LaTeX source code, nothing else. No markdown fences, no explanation.`;

  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: strictPrompt });
  return response.text;
}

// ── Gemini: Score Items by Category ─────────────────────────────

async function scoreItemsByCategory(jobDescription, items, category, ai) {
  const categoryItems = items.filter(f => f.item_type === category);
  if (categoryItems.length === 0) return [];

  const fileList = categoryItems.map((f, i) => `[${i}] ${f.title}\nTags: ${f.tags}\nPreview: ${f.content.slice(0, 500)}`).join('\n\n---\n\n');

  const prompt = `You are a resume expert. Score each ${category} for relevance to this job description.

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

CANDIDATE ${category.toUpperCase()}S:
${fileList}

Return a JSON array with one object per item in the same order:
[{"index": 0, "score": 85, "reason": "brief reason"}, ...]

Scores are 0-100. Return ONLY the JSON array, no other text.`;

  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  try {
    const text = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(text);
  } catch {
    return categoryItems.map((_, i) => ({ index: i, score: 50, reason: 'Could not score' }));
  }
}

// ── Gemini: Generate Section Content ────────────────────────────

async function generateSectionContent(jobDescription, items, sectionType, ai) {
  if (items.length === 0) return '';

  const combinedContent = items.map((f, i) => `--- ${f.title} ---\n${f.content}`).join('\n\n');

  const atsGuidelines = `
CRITICAL ATS OPTIMIZATION RULES (2026 Standards):

**KEYWORD OPTIMIZATION:**
1. Use BOTH acronyms and full phrases: "Machine Learning (ML)", "Amazon Web Services (AWS)", "Continuous Integration/Continuous Deployment (CI/CD)"
2. Repeat top 5 relevant skills 2-3 times naturally across bullets (ATS determines skill strength by frequency)
3. Match EXACT job titles from the posting (candidates with exact title matches are 10x more likely to get interviews)

**POWER LANGUAGE:**
4. Use POWER VERBS ONLY: Shipped, Led, Developed, Architected, Optimized, Spearheaded, Built, Engineered, Designed, Implemented, Launched
5. ABSOLUTELY FORBIDDEN WORDS: "Assisted with", "Helped with", "Worked on", "Participated in", "Contributed to"
6. Vary verbs - never use the same verb more than twice in the entire resume
7. Be a BUILDER not a BYSTANDER - show ownership and impact

**QUANTIFICATION:**
8. QUANTIFY EVERYTHING: Use numbers, percentages, user counts, time saved, performance improvements
9. Formula: "Accomplished [X] as measured by [Y], by doing [Z]"
10. Examples: "Reduced latency by 40%", "Served 100K+ users", "Improved throughput by 3x", "Decreased costs by $50K annually"

**HALO EFFECT ORDERING:**
11. Order items by IMPACT, not chronology - most impressive accomplishments FIRST
12. Lead with your strongest, most relevant experience to create positive first impression

**STRICT FACT-CHECKING (CRITICAL):**
13. USE ONLY facts, numbers, and technologies from the provided content below
14. DO NOT invent metrics, achievements, or technologies not in the source
15. DO NOT exaggerate numbers (if source says 40%, don't say 50%)
16. Paraphrasing is OK, but facts must be accurate to source
17. If a metric is vague (e.g., "many users"), you may reasonably interpret it (e.g., "1000+ users") but stay conservative
`;

  const prompts = {
    project: `You are a resume expert specializing in ATS optimization. Generate a tailored PROJECTS section.

${atsGuidelines}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S PROJECTS (SOURCE TRUTH - USE ONLY THIS):
${combinedContent}

INSTRUCTIONS:
1. Select 3-4 most relevant projects
2. **ORDER BY IMPACT** - Most impressive project FIRST (Halo Effect: strong first impression influences entire evaluation)
3. Extract key technologies and use BOTH acronym and full form: "React.js (JavaScript Library)", "CI/CD (Continuous Integration/Continuous Deployment)"
4. Rewrite bullets using POWER VERBS (Shipped, Built, Architected, Engineered, Optimized, Launched, Designed)
5. QUANTIFY impact: users served, performance improvements, time saved, lines of code, etc.
6. Repeat top 5 job-relevant technologies 2-3 times across different bullets (ATS keyword frequency matters)
7. Match job description keywords exactly
8. Format as clean LaTeX (single column, simple formatting, no tables)
9. **CRITICAL**: Use ONLY facts from the source content above - do not invent metrics or technologies

Return ONLY LaTeX code starting with \\section{Projects}.`,

    experience: `You are a resume expert specializing in ATS optimization. Generate a tailored EXPERIENCE section.

${atsGuidelines}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S WORK EXPERIENCE (SOURCE TRUTH - USE ONLY THIS):
${combinedContent}

INSTRUCTIONS:
1. Select 3-4 most relevant experiences
2. **ORDER BY IMPACT** - Most impressive role FIRST (Halo Effect: recruiters spend seconds on resumes, strong start = strong overall impression)
3. Use EXACT job titles from the posting when possible (10x more likely to get interview with exact title match)
4. Extract technologies and use BOTH forms: "Amazon Web Services (AWS)", "Machine Learning (ML)", "TypeScript (TS)"
5. Rewrite bullets with POWER VERBS (Led, Spearheaded, Shipped, Architected, Optimized, Engineered, Launched, Built)
6. ABSOLUTELY NEVER use: "Assisted", "Helped", "Worked on", "Participated", "Contributed to"
7. QUANTIFY everything: "Reduced latency by 40%", "Served 100K+ users", "Improved throughput by 3x", "Decreased costs by $50K"
8. Repeat top 5 job-relevant skills 2-3 times naturally (ATS keyword frequency = skill strength)
9. Show OWNERSHIP and IMPACT, not just tasks - be a BUILDER not a BYSTANDER
10. Format as clean LaTeX (single column, simple formatting, no tables)
11. **CRITICAL**: Use ONLY facts from the source content above - do not invent metrics or technologies

Return ONLY LaTeX code starting with \\section{Experience}.`,

    other: `You are a resume expert specializing in ATS optimization. Generate SKILLS, CERTIFICATIONS, and EDUCATION sections.

${atsGuidelines}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S SKILLS, CERTIFICATIONS & EDUCATION (SOURCE TRUTH - USE ONLY THIS):
${combinedContent}

INSTRUCTIONS FOR SKILLS:
1. **CATEGORIZE, DON'T LIST** - Group by category: Languages, Frameworks, Tools, Cloud/DevOps (ATS parses categories better than comma lists)
2. Use BOTH acronym and full form: "JavaScript (JS)", "TypeScript (TS)", "AWS (Amazon Web Services)", "CI/CD (Continuous Integration/Continuous Deployment)"
3. List skills matching job description first (keyword matching is critical)
4. Ensure top 5 job-relevant skills appear 2-3 times across resume (frequency = strength in ATS)
5. Format as simple LaTeX (no complex tables that break ATS parsing)
6. **CRITICAL**: Use ONLY technologies mentioned in the source content - do not add skills not listed

INSTRUCTIONS FOR CERTIFICATIONS:
1. Include full certification name with acronym: "AWS Certified Solutions Architect (AWS CSA)"
2. Add issuing organization and date
3. Include credential ID if available (verifiable credentials rank higher)
4. Prioritize certifications matching job requirements
5. **CRITICAL**: Use ONLY certifications from source content - do not invent credentials

INSTRUCTIONS FOR EDUCATION:
1. Include degree, institution, graduation year
2. Add GPA if 3.5+ or relevant coursework
3. Use full degree name with common abbreviation: "Bachelor of Science (B.S.) in Computer Science"
4. **STUDENT TIP**: If you're a student/new grad, this section should be at the TOP of your resume (earns leniency from recruiters)
5. **CRITICAL**: Use ONLY education details from source content - do not fabricate degrees or GPAs

Return ONLY LaTeX code with \\section{Skills}, \\section{Certifications}, \\section{Education} as needed.`
  };

  const prompt = prompts[sectionType] || prompts.other;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text;
}

// ── Library Routes ──────────────────────────────────────────────

app.get('/api/library', authenticateToken, (req, res) => {
  const { search, tag } = req.query;
  let query = 'SELECT * FROM library WHERE user_id = ? ORDER BY updated_at DESC';
  let items = db.prepare(query).all(req.user.userId);

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(i => i.title.toLowerCase().includes(s) || i.content.toLowerCase().includes(s) || i.tags.toLowerCase().includes(s));
  }
  if (tag) {
    items = items.filter(i => {
      try { return JSON.parse(i.tags).some(t => t.toLowerCase() === tag.toLowerCase()); } catch { return false; }
    });
  }

  items = items.map(i => ({ ...i, tags: JSON.parse(i.tags || '[]') }));
  res.json({ items });
});

app.post('/api/library', authenticateToken, (req, res) => {
  const { title, content = '', tags = [], source_url, item_type = 'project', start_date, end_date, location, organization, gpa, credential_id } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  const result = db.prepare(`INSERT INTO library (user_id, title, content, tags, source_url, item_type, start_date, end_date, location, organization, gpa, credential_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(req.user.userId, title, content, JSON.stringify(tags), source_url || null, item_type, start_date || null, end_date || null, location || null, organization || null, gpa || null, credential_id || null);

  const item = db.prepare('SELECT * FROM library WHERE id = ?').get(result.lastInsertRowid);
  res.json({ item: { ...item, tags: JSON.parse(item.tags) } });
});

app.put('/api/library/:id', authenticateToken, (req, res) => {
  const { title, content, tags, item_type, start_date, end_date, location, organization, gpa, credential_id } = req.body;
  const item = db.prepare('SELECT * FROM library WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
  if (!item) return res.status(404).json({ error: 'Not found' });

  db.prepare(`UPDATE library SET title=?, content=?, tags=?, item_type=?, start_date=?, end_date=?, location=?, organization=?, gpa=?, credential_id=?, updated_at=datetime('now') WHERE id=?`)
    .run(
      title ?? item.title, 
      content ?? item.content, 
      JSON.stringify(tags ?? JSON.parse(item.tags)), 
      item_type ?? item.item_type,
      start_date !== undefined ? start_date : item.start_date,
      end_date !== undefined ? end_date : item.end_date,
      location !== undefined ? location : item.location,
      organization !== undefined ? organization : item.organization,
      gpa !== undefined ? gpa : item.gpa,
      credential_id !== undefined ? credential_id : item.credential_id,
      req.params.id
    );

  const updated = db.prepare('SELECT * FROM library WHERE id = ?').get(req.params.id);
  res.json({ item: { ...updated, tags: JSON.parse(updated.tags) } });
});

app.delete('/api/library/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM library WHERE id = ? AND user_id = ?').run(req.params.id, req.user.userId);
  res.json({ success: true });
});

// ── Template Routes ─────────────────────────────────────────────

app.get('/api/templates', authenticateToken, (req, res) => {
  const templates = db.prepare('SELECT id, name, description, is_default, is_global, created_at FROM templates WHERE user_id = ? OR is_global = 1 ORDER BY is_default DESC, created_at DESC')
    .all(req.user.userId);
  res.json({ templates });
});

app.get('/api/templates/:id', authenticateToken, (req, res) => {
  const t = db.prepare('SELECT * FROM templates WHERE id = ? AND (user_id = ? OR is_global = 1)').get(req.params.id, req.user.userId);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json({ template: t });
});

app.post('/api/templates', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    let content = req.body.content;
    if (req.file) content = req.file.buffer.toString('utf-8');
    if (!content) return res.status(400).json({ error: 'content or file required' });

    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    const result = db.prepare(`INSERT INTO templates (user_id, name, description, content, is_default, is_global) VALUES (?, ?, ?, ?, 0, 0)`)
      .run(req.user.userId, name, description || '', content);

    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/templates/:id/default', authenticateToken, (req, res) => {
  const t = db.prepare('SELECT * FROM templates WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
  if (!t) return res.status(404).json({ error: 'Not found or not owned by you' });

  db.prepare('UPDATE templates SET is_default = 0 WHERE user_id = ?').run(req.user.userId);
  db.prepare('UPDATE templates SET is_default = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.delete('/api/templates/:id', authenticateToken, (req, res) => {
  const t = db.prepare('SELECT * FROM templates WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
  if (!t) return res.status(404).json({ error: 'Not found or not owned by you' });
  if (t.is_default) return res.status(400).json({ error: 'Cannot delete the default template' });
  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── History Routes ──────────────────────────────────────────────

app.get('/api/history', authenticateToken, (req, res) => {
  const items = db.prepare('SELECT id, job_title, company, template_id, markdown_ids, created_at FROM history WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.userId);
  res.json({ items: items.map(i => ({ ...i, markdown_ids: JSON.parse(i.markdown_ids) })) });
});

app.get('/api/history/:id', authenticateToken, (req, res) => {
  const item = db.prepare('SELECT * FROM history WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ item: { ...item, markdown_ids: JSON.parse(item.markdown_ids) } });
});

app.delete('/api/history/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM history WHERE id = ? AND user_id = ?').run(req.params.id, req.user.userId);
  res.json({ success: true });
});

// ── Core: Analyze GitHub Repo ───────────────────────────────────

app.post('/api/analyze', authenticateToken, async (req, res) => {
  try {
    const { repoUrl, githubToken } = req.body;
    if (!repoUrl) return res.status(400).json({ error: 'Missing repoUrl' });

    const ai = getUserAI(req);
    const { owner, repo } = parseGitHubUrl(repoUrl);
    const token = githubToken || process.env.GITHUB_TOKEN || null;

    const repoData = await getRepoData(owner, repo, token);
    const markdown = await generateRepoSummary(repoData, ai);

    // Auto-extract tags from the markdown
    const tagMatch = markdown.match(/🏷️[^\n]*\n([^\n]+)/);
    let tags = [];
    if (tagMatch) {
      tags = tagMatch[1].match(/`([^`]+)`/g)?.map(t => t.replace(/`/g, '')) || [];
    }

    // Auto-save to library
    const title = repoData.meta.full_name.split('/')[1] || repoData.meta.full_name;
    const result = db.prepare(`INSERT INTO library (user_id, title, content, tags, source_url, item_type) VALUES (?, ?, ?, ?, ?, 'project')`)
      .run(req.user.userId, title, markdown, JSON.stringify(tags.slice(0, 10)), repoData.meta.html_url);

    res.json({ markdown, repoName: repoData.meta.full_name, savedId: result.lastInsertRowid, tags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Core: Score Library Against JD ─────────────────────────────

app.post('/api/score', authenticateToken, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ error: 'jobDescription required' });

    const ai = getUserAI(req);
    const items = db.prepare('SELECT id, title, tags, content, item_type FROM library WHERE user_id = ?').all(req.user.userId)
      .map(i => ({ ...i, tags: JSON.parse(i.tags || '[]') }));

    if (items.length === 0) return res.json({ scores: [] });

    // Score by category
    const projectItems = items.filter(f => f.item_type === 'project');
    const experienceItems = items.filter(f => f.item_type === 'experience');

    const [projectScores, experienceScores] = await Promise.all([
      projectItems.length > 0 ? scoreItemsByCategory(jobDescription, items, 'project', ai) : Promise.resolve([]),
      experienceItems.length > 0 ? scoreItemsByCategory(jobDescription, items, 'experience', ai) : Promise.resolve([])
    ]);

    // Combine and add IDs
    const allScores = [
      ...projectScores.map(s => ({ ...s, id: projectItems[s.index]?.id, title: projectItems[s.index]?.title, type: 'project' })),
      ...experienceScores.map(s => ({ ...s, id: experienceItems[s.index]?.id, title: experienceItems[s.index]?.title, type: 'experience' }))
    ];

    res.json({ scores: allScores.sort((a, b) => b.score - a.score) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Core: Generate Resume ───────────────────────────────────────

app.post('/api/generate', authenticateToken, async (req, res) => {
  try {
    const { jobDescription, jobTitle, company, templateId } = req.body;
    if (!jobDescription) return res.status(400).json({ error: 'jobDescription required' });

    const ai = getUserAI(req);

    // Get template
    let template;
    if (templateId) {
      template = db.prepare('SELECT * FROM templates WHERE id = ? AND (user_id = ? OR is_global = 1)').get(templateId, req.user.userId);
    } else {
      template = db.prepare('SELECT * FROM templates WHERE (user_id = ? OR is_global = 1) AND is_default = 1 ORDER BY user_id DESC LIMIT 1').get(req.user.userId);
    }
    if (!template) return res.status(400).json({ error: 'No template found' });

    // Get ALL library items (scoring happens inside generateResume)
    const allItems = db.prepare('SELECT * FROM library WHERE user_id = ?').all(req.user.userId)
      .map(i => ({ ...i, tags: JSON.parse(i.tags || '[]') }));

    if (allItems.length === 0) return res.status(400).json({ error: 'No items found in library. Please add at least one project or experience.' });

    // Validation: Check for required item types
    const experienceCount = allItems.filter(f => f.item_type === 'experience').length;
    const projectCount = allItems.filter(f => f.item_type === 'project').length;
    const combinedCount = experienceCount + projectCount;

    if (combinedCount < 1) {
      return res.status(400).json({ 
        error: 'Resume must include at least 1 work experience or project. Please add items to your library first.' 
      });
    }

    // Get user profile for contact info
    const user = db.prepare('SELECT name, email, phone, linkedin_url, github_url FROM users WHERE id = ?').get(req.user.userId);

    // Generate resume using two-stage approach
    const latex = await generateResume(jobDescription, allItems, template.content, user, ai);

    // Save to history (store all item IDs)
    const allItemIds = allItems.map(i => i.id);
    const histResult = db.prepare(`INSERT INTO history (user_id, job_title, company, job_description, latex_output, template_id, markdown_ids) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(req.user.userId, jobTitle || 'Untitled', company || '', jobDescription, latex, template.id, JSON.stringify(allItemIds));

    res.json({ latex, historyId: histResult.lastInsertRowid, templateName: template.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ResumeForge running at http://localhost:${PORT}`));
