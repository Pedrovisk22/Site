const fs = require('fs');
const path = require('path');
const { promiseDb } = require('./db');

async function runMigration() {
  const filePath = path.join(__dirname, 'migrations', 'create_news_table.sql');
  try {
    const sql = await fs.promises.readFile(filePath, 'utf8');
    const connection = await promiseDb.getConnection();
    await connection.query(sql);
    connection.release();
    console.log('Migration executed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  }
  process.exit();
}

runMigration();
