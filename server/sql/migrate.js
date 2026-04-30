require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs   = require('fs');
const path = require('path');
const db   = require('../src/config/database');

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
async function migrate() {
  try {
    console.log('🔄 Running database migration...');
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    // Split on semicolons, skip empty statements
    const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

    for (const stmt of statements) {
      await db.query(stmt);
    }

    console.log('✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();