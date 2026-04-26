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

const db = new Database('resumeforge.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
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
    project_type TEXT DEFAULT 'project',
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
  const jakeTemplate = fs.readFileSync(path.join(__dirname, 'jake_resume.md'), 'utf-8');
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
    const { email, password, name } = req.body;

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

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
      .run(email, passwordHash, name || null);

    const token = jwt.sign({ userId: result.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: result.lastInsertRowid,
        email,
        name: name || null
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
  const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
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

  const response = await ai.models.generateContent({ model: 'gemini-2.0-flash-exp', contents: prompt });
  return response.text;
}

// ── Gemini: Resume Generator ────────────────────────────────────

async function generateResume(jobDescription, markdownFiles, templateContent, ai) {
  const combinedMarkdown = markdownFiles.map((f, i) => `--- FILE ${i + 1}: ${f.title} ---\n${f.content}`).join('\n\n');

  const prompt = `You are an expert resume writer and LaTeX developer. Your task is to generate a complete, tailored LaTeX resume.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S PROJECT/EXPERIENCE MARKDOWN FILES:
${combinedMarkdown}

LATEX TEMPLATE TO FILL:
${templateContent}

INSTRUCTIONS:
1. Analyze the job description carefully — extract required skills, technologies, and keywords.
2. From the markdown files, select the most relevant experiences, projects, and bullet points.
3. Rewrite and tailor bullet points to match the job description's language and priorities.
4. Fill the LaTeX template with the tailored content. Keep the template structure intact.
5. Prioritize experiences that match the job requirements most closely.
6. Use strong action verbs and quantify impact wherever possible.
7. Ensure all LaTeX syntax is valid and compilable.
8. Replace placeholder names/contact info with realistic placeholders like [Your Name], [your@email.com], [Your Phone].

Return ONLY the complete LaTeX source code, nothing else. No markdown fences, no explanation.`;

  const response = await ai.models.generateContent({ model: 'gemini-2.0-flash-exp', contents: prompt });
  return response.text;
}

// ── Gemini: Score Markdown Files ────────────────────────────────

async function scoreMarkdownFiles(jobDescription, markdownFiles, ai) {
  if (markdownFiles.length === 0) return [];

  const fileList = markdownFiles.map((f, i) => `[${i}] ${f.title}\nTags: ${f.tags}\nPreview: ${f.content.slice(0, 500)}`).join('\n\n---\n\n');

  const prompt = `You are a resume expert. Score each candidate project/experience file for relevance to this job description.

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

CANDIDATE FILES:
${fileList}

Return a JSON array with one object per file in the same order:
[{"index": 0, "score": 85, "reason": "brief reason"}, ...]

Scores are 0-100. Return ONLY the JSON array, no other text.`;

  const response = await ai.models.generateContent({ model: 'gemini-2.0-flash-exp', contents: prompt });
  try {
    const text = response.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(text);
  } catch {
    return markdownFiles.map((_, i) => ({ index: i, score: 50, reason: 'Could not score' }));
  }
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
  const { title, content, tags = [], source_url, project_type = 'project' } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });

  const result = db.prepare(`INSERT INTO library (user_id, title, content, tags, source_url, project_type) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(req.user.userId, title, content, JSON.stringify(tags), source_url || null, project_type);

  const item = db.prepare('SELECT * FROM library WHERE id = ?').get(result.lastInsertRowid);
  res.json({ item: { ...item, tags: JSON.parse(item.tags) } });
});

app.put('/api/library/:id', authenticateToken, (req, res) => {
  const { title, content, tags, project_type } = req.body;
  const item = db.prepare('SELECT * FROM library WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
  if (!item) return res.status(404).json({ error: 'Not found' });

  db.prepare(`UPDATE library SET title=?, content=?, tags=?, project_type=?, updated_at=datetime('now') WHERE id=?`)
    .run(title ?? item.title, content ?? item.content, JSON.stringify(tags ?? JSON.parse(item.tags)), project_type ?? item.project_type, req.params.id);

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
    const result = db.prepare(`INSERT INTO library (user_id, title, content, tags, source_url, project_type) VALUES (?, ?, ?, ?, ?, 'project')`)
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
    const items = db.prepare('SELECT id, title, tags, content FROM library WHERE user_id = ?').all(req.user.userId)
      .map(i => ({ ...i, tags: JSON.parse(i.tags || '[]') }));

    if (items.length === 0) return res.json({ scores: [] });

    const scores = await scoreMarkdownFiles(jobDescription, items, ai);
    const result = scores.map(s => ({ ...s, id: items[s.index]?.id, title: items[s.index]?.title }));

    res.json({ scores: result.sort((a, b) => b.score - a.score) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Core: Generate Resume ───────────────────────────────────────

app.post('/api/generate', authenticateToken, async (req, res) => {
  try {
    const { jobDescription, jobTitle, company, markdownIds, templateId } = req.body;
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

    // Get markdown files
    let markdownFiles = [];
    if (markdownIds && markdownIds.length > 0) {
      markdownFiles = markdownIds.map(id => db.prepare('SELECT * FROM library WHERE id = ? AND user_id = ?').get(id, req.user.userId)).filter(Boolean)
        .map(i => ({ ...i, tags: JSON.parse(i.tags || '[]') }));
    } else {
      // Use all library items if none specified
      markdownFiles = db.prepare('SELECT * FROM library WHERE user_id = ?').all(req.user.userId)
        .map(i => ({ ...i, tags: JSON.parse(i.tags || '[]') }));
    }

    if (markdownFiles.length === 0) return res.status(400).json({ error: 'No markdown files found in library' });

    const latex = await generateResume(jobDescription, markdownFiles, template.content, ai);

    // Save to history
    const histResult = db.prepare(`INSERT INTO history (user_id, job_title, company, job_description, latex_output, template_id, markdown_ids) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(req.user.userId, jobTitle || 'Untitled', company || '', jobDescription, latex, template.id, JSON.stringify(markdownIds || []));

    res.json({ latex, historyId: histResult.lastInsertRowid, templateName: template.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ResumeForge running at http://localhost:${PORT}`));
