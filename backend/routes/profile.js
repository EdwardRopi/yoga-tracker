const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const { pool } = require('../db');

const ALLOWED_THEMES  = ['light', 'dark'];
const ALLOWED_COLORS  = ['pink', 'blue', 'grey', 'purple'];
const ALLOWED_AVATARS = ['🧘', '🌸', '🌿', '✨', '🦋', '🌻', '🌙', '⭐', '🍃', '🌊'];

function safeUser(row) {
  return {
    _id:         String(row.id),
    telegram_id: row.telegram_id,
    email:       row.email,
    name:        row.name,
    avatar:      row.avatar,
    theme:       row.theme,
    color_theme: row.color_theme,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

// GET /api/profile
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ user: safeUser(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/profile
router.patch('/', auth, async (req, res) => {
  try {
    const { name, avatar, theme, color_theme } = req.body;
    const fields = [];
    const values = [];

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ error: 'Имя не может быть пустым' });
      if (name.trim().length > 50) return res.status(400).json({ error: 'Имя слишком длинное' });
      fields.push(`name = $${fields.length + 1}`);
      values.push(name.trim());
    }
    if (avatar !== undefined) {
      if (!ALLOWED_AVATARS.includes(avatar)) return res.status(400).json({ error: 'Неверный аватар' });
      fields.push(`avatar = $${fields.length + 1}`);
      values.push(avatar);
    }
    if (theme !== undefined) {
      if (!ALLOWED_THEMES.includes(theme)) return res.status(400).json({ error: 'Тема: light или dark' });
      fields.push(`theme = $${fields.length + 1}`);
      values.push(theme);
    }
    if (color_theme !== undefined) {
      if (!ALLOWED_COLORS.includes(color_theme)) return res.status(400).json({ error: 'Цвет: pink, blue, grey, purple' });
      fields.push(`color_theme = $${fields.length + 1}`);
      values.push(color_theme);
    }

    if (!fields.length) return res.status(400).json({ error: 'Нет данных' });

    fields.push(`updated_at = NOW()`);
    values.push(req.userId);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    res.json({ user: safeUser(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сохранения' });
  }
});

module.exports = router;
