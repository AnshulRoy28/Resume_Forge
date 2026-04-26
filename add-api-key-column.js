import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

console.log('🔄 Adding gemini_api_key column to users table...\n');

const db = new Database('resumeforge.db');

try {
  // Check if column already exists
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const hasApiKeyColumn = columns.some(col => col.name === 'gemini_api_key');

  if (hasApiKeyColumn) {
    console.log('✅ Column already exists. No migration needed.\n');
  } else {
    // Add the column
    db.prepare('ALTER TABLE users ADD COLUMN gemini_api_key TEXT').run();
    console.log('✅ Successfully added gemini_api_key column to users table.\n');
  }
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
}

db.close();
console.log('🎉 Migration complete!\n');
