import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Resetting database to new schema...\n');

// Backup existing database if it exists
if (fs.existsSync('resumeforge.db')) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `resumeforge.db.backup-${timestamp}`;
  fs.copyFileSync('resumeforge.db', backupName);
  console.log(`✅ Backed up existing database to: ${backupName}`);
  fs.unlinkSync('resumeforge.db');
  console.log('✅ Removed old database\n');
}

// Create new database with updated schema
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

// Seed Jake's template
const templatePath = path.join(__dirname, '..', 'templates', 'jake_resume.md');
const jakeTemplate = fs.readFileSync(templatePath, 'utf-8');
db.prepare(`INSERT INTO templates (name, description, content, is_default, is_global, user_id) VALUES (?, ?, ?, 1, 1, NULL)`)
  .run("Jake's Resume Template", "Classic single-page LaTeX resume template by Jake Gutierrez", jakeTemplate);

console.log('✅ Created new database with updated schema');
console.log('✅ Seeded Jake\'s template\n');
console.log('🎉 Database reset complete! You can now start the server.\n');

db.close();
