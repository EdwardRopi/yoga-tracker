const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const { pool } = require('../db');

function safeNote(row) {
  return {
    _id:       String(row.id),
    user_id:   String(row.user_id),
    content:   row.content,
    createdAt: row.created_at,
  };
}

// GET /api/notes
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ notes: result.rows.map(safeNote) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки заметок' });
  }
});

// POST /api/notes
router.post('/', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Текст не может быть пустым' });
    if (content.length > 2000) return res.status(400).json({ error: 'Максимум 2000 символов' });

    const result = await pool.query(
      'INSERT INTO notes (user_id, content) VALUES ($1, $2) RETURNING *',
      [req.userId, content.trim()]
    );
    res.status(201).json({ note: safeNote(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сохранения' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Заметка не найдена' });
    res.json({ message: 'Заметка удалена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

module.exports = router;
