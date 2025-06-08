const { promiseDb } = require('./db');

async function getAllNews() {
  const [rows] = await promiseDb.query('SELECT * FROM news ORDER BY created_at DESC');
  return rows;
}

async function getNewsById(id) {
  const [rows] = await promiseDb.query('SELECT * FROM news WHERE id = ?', [id]);
  return rows[0];
}

async function createNews({ title, content, keywords, author_id }) {
  await promiseDb.query(
    'INSERT INTO news (title, content, keywords, author_id) VALUES (?, ?, ?, ?)',
    [title, content, keywords, author_id]
  );
}

async function updateNews(id, { title, content, keywords }) {
  await promiseDb.query(
    'UPDATE news SET title = ?, content = ?, keywords = ? WHERE id = ?',
    [title, content, keywords, id]
  );
}

module.exports = { getAllNews, getNewsById, createNews, updateNews };
