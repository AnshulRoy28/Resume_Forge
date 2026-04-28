import Database from 'better-sqlite3';

const db = new Database('resumeforge.db');

console.log('Adding gpa and credential_id columns to library table...');

try {
  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(library)").all();
  const hasGpa = tableInfo.some(col => col.name === 'gpa');
  const hasCredentialId = tableInfo.some(col => col.name === 'credential_id');

  if (!hasGpa) {
    db.prepare('ALTER TABLE library ADD COLUMN gpa TEXT').run();
    console.log('✓ Added gpa column');
  } else {
    console.log('✓ gpa column already exists');
  }

  if (!hasCredentialId) {
    db.prepare('ALTER TABLE library ADD COLUMN credential_id TEXT').run();
    console.log('✓ Added credential_id column');
  } else {
    console.log('✓ credential_id column already exists');
  }

  console.log('\n✅ Migration completed successfully!');
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
} finally {
  db.close();
}
