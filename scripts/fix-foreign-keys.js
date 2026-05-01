import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

console.log('🔧 Fixing foreign key constraints...\n');

// Support Docker volume mounting
const dbPath = process.env.DB_PATH || (fs.existsSync('/app/data') ? '/app/data/resumeforge.db' : 'resumeforge.db');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database not found. Run npm run reset-db first.');
  process.exit(1);
}

const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

console.log('✅ Foreign key constraints enabled');
console.log('✅ NULL values in foreign key columns are now allowed\n');

// Verify the fix
const templates = db.prepare('SELECT COUNT(*) as count FROM templates WHERE user_id IS NULL').get();
console.log(`📊 Global templates with NULL user_id: ${templates.count}`);

db.close();

console.log('\n🎉 Foreign key constraints fixed!\n');
