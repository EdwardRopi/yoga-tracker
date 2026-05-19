const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const { pool } = require('../db');

// GET /api/stats/weekly — статистика за последние 7 дней
router.get('/weekly', auth, async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    }

    const result = await pool.query(
      `SELECT date, difficulty, type, duration
       FROM yoga_sessions
       WHERE user_id = $1 AND date = ANY($2)`,
      [req.userId, days]
    );

    const sessionMap = new Map(result.rows.map(r => [r.date, r]));

    const weekly = days.map(date => {
      const s = sessionMap.get(date);
      return {
        date,
        practiced:  !!s,
        difficulty: s?.difficulty || 0,
        type:       s?.type       || null,
        duration:   s?.duration   || 0,
      };
    });

    // Общая статистика
    const allRes = await pool.query(
      'SELECT difficulty, type, duration FROM yoga_sessions WHERE user_id = $1',
      [req.userId]
    );
    const all = allRes.rows;

    const totalDuration = all.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgDuration   = all.length ? Math.round(totalDuration / all.length) : 0;

    // Любимый тип практики
    const typeCounts = {};
    all.forEach(s => {
      if (s.type && s.type !== 'general') {
        typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
      }
    });
    const favoriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    res.json({
      weekly,
      totalSessions:  all.length,
      totalDuration,
      avgDuration,
      favoriteType,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки статистики' });
  }
});

// GET /api/stats/monthly — статистика за месяц (для графика)
router.get('/monthly', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT date, difficulty, duration
       FROM yoga_sessions
       WHERE user_id = $1
       ORDER BY date DESC
       LIMIT 30`,
      [req.userId]
    );

    res.json({ sessions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки статистики' });
  }
});

module.exports = router;
