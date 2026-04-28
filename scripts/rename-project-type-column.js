import Database from 'better-sqlite3';

const db = new Database('resumeforge.db');

console.log('Migrating library table to new schema...');

try {
  // Check current schema
  const tableInfo = db.prepare("PRAGMA table_info(library)").all();
  const columns = tableInfo.map(col => col.name);
  
  console.log('Current columns:', columns.join(', '));
  
  // Drop library_new if it exists from failed migration
  try {
    db.exec('DROP TABLE IF EXISTS library_new;');
    console.log('✓ Cleaned up any previous migration attempts');
  } catch (e) {
    // Ignore
  }
  
  // Create new table with complete schema
  db.exec(`
    CREATE TABLE library_new (
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
  `);
  
  console.log('✓ Created new table with complete schema');
  
  // Copy data from old table, mapping project_type to item_type
  const hasProjectType = columns.includes('project_type');
  
  if (hasProjectType) {
    db.exec(`
      INSERT INTO library_new (id, user_id, title, content, tags, source_url, item_type, gpa, credential_id, created_at, updated_at)
      SELECT id, user_id, title, content, tags, source_url, 
             COALESCE(project_type, 'project') as item_type,
             gpa, credential_id, created_at, updated_at
      FROM library;
    `);
  } else {
    db.exec(`
      INSERT INTO library_new (id, user_id, title, content, tags, source_url, item_type, gpa, credential_id, created_at, updated_at)
      SELECT id, user_id, title, content, tags, source_url, 
             COALESCE(item_type, 'project') as item_type,
             gpa, credential_id, created_at, updated_at
      FROM library;
    `);
  }
  
  console.log('✓ Copied data from old table');
  
  // Drop old table
  db.exec('DROP TABLE library;');
  console.log('✓ Dropped old table');
  
  // Rename new table
  db.exec('ALTER TABLE library_new RENAME TO library;');
  console.log('✓ Renamed new table to library');
  
  // Recreate index
  db.exec('CREATE INDEX IF NOT EXISTS idx_library_user ON library(user_id);');
  console.log('✓ Recreated index');
  
  // Verify new schema
  const newTableInfo = db.prepare("PRAGMA table_info(library)").all();
  console.log('\nNew schema:');
  newTableInfo.forEach(col => {
    console.log(`  ${col.name} (${col.type})`);
  });

  console.log('\n✅ Migration completed successfully!');
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  console.error(err);
  process.exit(1);
} finally {
  db.close();
}
