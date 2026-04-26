import { createRequire } from 'module';
import readline from 'readline';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function migrate() {
  console.log('\n🔄 ResumeForge Database Migration\n');
  console.log('This script will migrate your existing data to the new user-based system.');
  console.log('All existing library items, templates, and history will be associated with a new user account.\n');

  const db = new Database('resumeforge.db');

  // Check if users table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  
  if (!tables) {
    console.log('✅ Database is already up to date. No migration needed.');
    db.close();
    rl.close();
    return;
  }

  // Check if there's existing data
  const libraryCount = db.prepare('SELECT COUNT(*) as c FROM library').get().c;
  const templateCount = db.prepare('SELECT COUNT(*) as c FROM templates WHERE is_global = 0 OR is_global IS NULL').get().c;
  const historyCount = db.prepare('SELECT COUNT(*) as c FROM history').get().c;

  if (libraryCount === 0 && templateCount === 0 && historyCount === 0) {
    console.log('✅ No existing data to migrate. You can start fresh!');
    db.close();
    rl.close();
    return;
  }

  console.log(`Found existing data:`);
  console.log(`  - ${libraryCount} library items`);
  console.log(`  - ${templateCount} custom templates`);
  console.log(`  - ${historyCount} history entries\n`);

  const email = await question('Enter email for migration account: ');
  const password = await question('Enter password (min 8 chars): ');
  const name = await question('Enter name (optional): ');

  if (!email || !password || password.length < 8) {
    console.log('\n❌ Invalid email or password. Migration cancelled.');
    db.close();
    rl.close();
    return;
  }

  // Import bcrypt dynamically
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.default.hash(password, 10);

  try {
    // Create migration user
    const result = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
      .run(email, passwordHash, name || null);
    
    const userId = result.lastInsertRowid;

    // Migrate library items
    if (libraryCount > 0) {
      db.prepare('UPDATE library SET user_id = ? WHERE user_id IS NULL').run(userId);
      console.log(`✅ Migrated ${libraryCount} library items`);
    }

    // Migrate templates
    if (templateCount > 0) {
      db.prepare('UPDATE templates SET user_id = ? WHERE user_id IS NULL AND (is_global = 0 OR is_global IS NULL)').run(userId);
      console.log(`✅ Migrated ${templateCount} templates`);
    }

    // Migrate history
    if (historyCount > 0) {
      db.prepare('UPDATE history SET user_id = ? WHERE user_id IS NULL').run(userId);
      console.log(`✅ Migrated ${historyCount} history entries`);
    }

    console.log(`\n✅ Migration complete! You can now login with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: [your password]\n`);

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
  }

  db.close();
  rl.close();
}

migrate();
