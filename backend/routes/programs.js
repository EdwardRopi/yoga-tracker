const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const { pool } = require('../db');

const PROGRAMS = {
  '7day':    { id: '7day',    name: '7-дневный старт',    totalDays: 7,  icon: '🗓' },
  '30day':   { id: '30day',   name: '30-дневный марафон', totalDays: 30, icon: '🏔' },
  'morning': { id: 'morning', name: 'Утренняя рутина',    totalDays: 14, icon: '🌅' },
};

// GET /api/programs — получить все программы с прогрессом
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_programs WHERE user_id = $1',
      [req.userId]
    );
    const activeMap = new Map(result.rows.map(r => [r.program_id, r]));

    const programs = Object.values(PROGRAMS).map(p => {
      const active = activeMap.get(p.id);
      return {
        ...p,
        active:    !!active,
        completed: active?.completed || false,
        daysDone:  active?.days_done || 0,
        startedAt: active?.started_at || null,
      };
    });

    res.json({ programs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки программ' });
  }
});

// POST /api/programs/start — начать программу
router.post('/start', auth, async (req, res) => {
  try {
    const { programId } = req.body;
    if (!PROGRAMS[programId]) return res.status(400).json({ error: 'Программа не найдена' });

    await pool.query(
      `INSERT INTO user_programs (user_id, program_id, days_done, completed)
       VALUES ($1, $2, 0, FALSE)
       ON CONFLICT (user_id, program_id)
       DO UPDATE SET days_done = 0, completed = FALSE, started_at = NOW()`,
      [req.userId, programId]
    );

    res.json({ message: 'Программа начата', program: PROGRAMS[programId] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка запуска программы' });
  }
});

// POST /api/programs/progress — обновить прогресс программ (вызывается после каждой сессии)
router.post('/progress', auth, async (req, res) => {
  try {
    // Получаем активные незавершённые программы
    const result = await pool.query(
      'SELECT * FROM user_programs WHERE user_id = $1 AND completed = FALSE',
      [req.userId]
    );

    const completed = [];
    for (const prog of result.rows) {
      const program   = PROGRAMS[prog.program_id];
      if (!program) continue;

      // Считаем дни практики с момента начала программы
      const daysRes = await pool.query(
        'SELECT COUNT(DISTINCT date) as cnt FROM yoga_sessions WHERE user_id = $1 AND date >= $2',
        [req.userId, prog.started_at.toISOString().split('T')[0]]
      );
      const daysDone = parseInt(daysRes.rows[0].cnt) || 0;
      const isCompleted = daysDone >= program.totalDays;

      await pool.query(
        'UPDATE user_programs SET days_done = $1, completed = $2 WHERE user_id = $3 AND program_id = $4',
        [daysDone, isCompleted, req.userId, prog.program_id]
      );

      if (isCompleted) completed.push(program);
    }

    res.json({ completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка обновления прогресса программ' });
  }
});

module.exports = router;
