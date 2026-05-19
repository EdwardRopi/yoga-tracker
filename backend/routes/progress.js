const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const { pool } = require('../db');

// Таблица XP
const XP_DIFFICULTY = { 1: 10, 2: 20, 3: 35, 4: 50 };
const XP_DURATION   = { 15: 5, 30: 15, 60: 30 };        // бонус за минуты
const XP_STREAK     = { 7: 50, 14: 100, 30: 200 };       // бонус за стрик

// Уровни
const LEVELS = [
  { level: 1, name: 'Новичок',       xp: 0    },
  { level: 2, name: 'Практикующий',  xp: 150  },
  { level: 3, name: 'Искатель',      xp: 400  },
  { level: 4, name: 'Адепт',         xp: 800  },
  { level: 5, name: 'Мастер',        xp: 1500 },
  { level: 6, name: 'Просветлённый', xp: 2500 },
  { level: 7, name: 'Гуру',          xp: 4000 },
];

function calcLevel(xp) {
  let current = LEVELS[0];
  let next    = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      current = LEVELS[i];
      next    = LEVELS[i + 1] || null;
      break;
    }
  }
  return {
    level:      current.level,
    name:       current.name,
    xp,
    xpCurrent:  xp - current.xp,
    xpNeeded:   next ? next.xp - current.xp : null,
    xpToNext:   next ? next.xp - xp : null,
    nextName:   next ? next.name : null,
    isMax:      !next,
  };
}

function calcXP(difficulty, durationSec, streak) {
  let xp = XP_DIFFICULTY[difficulty] || 10;

  // Бонус за длительность
  const minutes = Math.floor(durationSec / 60);
  if      (minutes >= 60) xp += XP_DURATION[60];
  else if (minutes >= 30) xp += XP_DURATION[30];
  else if (minutes >= 15) xp += XP_DURATION[15];

  // Бонус за стрик
  if      (streak >= 30) xp += XP_STREAK[30];
  else if (streak >= 14) xp += XP_STREAK[14];
  else if (streak >= 7)  xp += XP_STREAK[7];

  return xp;
}

// GET /api/progress — получить прогресс пользователя
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_progress WHERE user_id = $1',
      [req.userId]
    );

    const xp = result.rows[0]?.xp || 0;
    res.json({ progress: calcLevel(xp) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки прогресса' });
  }
});

// POST /api/progress/award — начислить XP за сессию
router.post('/award', auth, async (req, res) => {
  try {
    const { difficulty, duration, streak } = req.body;
    const xpGained = calcXP(difficulty || 1, duration || 0, streak || 0);

    // Upsert: создаём или обновляем прогресс
    const result = await pool.query(
      `INSERT INTO user_progress (user_id, xp, level)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id)
       DO UPDATE SET xp = user_progress.xp + $2, updated_at = NOW()
       RETURNING *`,
      [req.userId, xpGained]
    );

    const newXp = result.rows[0].xp;
    const progress = calcLevel(newXp);

    // Обновляем level в таблице
    await pool.query(
      'UPDATE user_progress SET level = $1 WHERE user_id = $2',
      [progress.level, req.userId]
    );

    res.json({ xpGained, progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка начисления XP' });
  }
});

module.exports = router;
