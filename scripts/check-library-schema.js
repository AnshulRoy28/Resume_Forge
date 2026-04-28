import Database from 'better-sqlite3';

const db = new Database('resumeforge.db');

console.log('Current library table schema:');
const tableInfo = db.prepare("PRAGMA table_info(library)").all();
tableInfo.forEach(col => {
  console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
});

db.close();
