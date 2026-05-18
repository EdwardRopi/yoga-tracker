const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const { pool } = require('../db');

function safeSession(row) {
  return {
    _id:        String(row.id),
    user_id:    String(row.user_id),
    date:       row.date,
    difficulty: row.difficulty,
    note:       row.note,
    createdAt:  row.created_at,
    updatedAt:  row.updated_at,
  };
}

// GET /api/yoga/sessions/:year/:month
router.get('/sessions/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const result = await pool.query(
      "SELECT * FROM yoga_sessions WHERE user_id = $1 AND date LIKE $2 ORDER BY date ASC",
      [req.userId, prefix + '%']
    );
    res.json({ sessions: result.rows.map(safeSession) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки сессий' });
  }
});

// POST /api/yoga/sessions
router.post('/sessions', auth, async (req, res) => {
  try {
    const { date, difficulty, note } = req.body;
    if (!date || !difficulty) return res.status(400).json({ error: 'date и difficulty обязательны' });
    if (difficulty < 1 || difficulty > 4) return res.status(400).json({ error: 'difficulty от 1 до 4' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Формат даты: YYYY-MM-DD' });

    const result = await pool.query(
      `INSERT INTO yoga_sessions (user_id, date, difficulty, note)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, date)
       DO UPDATE SET difficulty = EXCLUDED.difficulty,
                     note       = EXCLUDED.note,
                     updated_at = NOW()
       RETURNING *`,
      [req.userId, date, difficulty, note || '']
    );

    res.json({ session: safeSession(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сохранения' });
  }
});

// DELETE /api/yoga/sessions/:date
router.delete('/sessions/:date', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM yoga_sessions WHERE user_id = $1 AND date = $2',
      [req.userId, req.params.date]
    );
    res.json({ message: 'Сессия удалена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// GET /api/yoga/streak
router.get('/streak', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT date FROM yoga_sessions WHERE user_id = $1',
      [req.userId]
    );
    const dates  = result.rows.map(r => r.date);
    const streak = calculateStreak(dates);
    res.json({ streak, total: dates.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка стрика' });
  }
});

function calculateStreak(dates) {
  if (!dates.length) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  const today  = getTodayStr();
  let streak  = 0;
  let current = today;
  for (const date of sorted) {
    if (date === current) {
      streak++;
      current = getPrevDay(current);
    } else if (date < current) {
      break;
    }
  }
  return streak;
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getPrevDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

module.exports = router;
