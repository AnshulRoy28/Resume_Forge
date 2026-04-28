import Database from 'better-sqlite3';

const db = new Database('resumeforge.db');

console.log('Adding profile fields to users table...');

try {
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const columns = tableInfo.map(col => col.name);
  
  console.log('Current columns:', columns.join(', '));

  if (!columns.includes('phone')) {
    db.prepare('ALTER TABLE users ADD COLUMN phone TEXT').run();
    console.log('✓ Added phone column');
  }

  if (!columns.includes('linkedin_url')) {
    db.prepare('ALTER TABLE users ADD COLUMN linkedin_url TEXT').run();
    console.log('✓ Added linkedin_url column');
  }

  if (!columns.includes('github_url')) {
    db.prepare('ALTER TABLE users ADD COLUMN github_url TEXT').run();
    console.log('✓ Added github_url column');
  }

  console.log('\n✅ Migration completed successfully!');
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
} finally {
  db.close();
}
