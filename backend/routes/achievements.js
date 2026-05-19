const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const { pool } = require('../db');

// Все возможные достижения
const ALL_ACHIEVEMENTS = [
  { code: 'first_step',     name: 'Первый шаг',        desc: 'Первая практика',              icon: '🌱' },
  { code: 'streak_7',       name: 'Неделя силы',        desc: '7 дней подряд',                icon: '🔥' },
  { code: 'streak_30',      name: 'Месяц практики',     desc: '30 дней подряд',               icon: '💎' },
  { code: 'total_10',       name: 'Десятка',            desc: '10 практик всего',             icon: '⭐' },
  { code: 'total_50',       name: 'Полсотни',           desc: '50 практик всего',             icon: '🌟' },
  { code: 'total_100',      name: 'Сотня',              desc: '100 практик всего',            icon: '🏆' },
  { code: 'variety',        name: 'Разнообразие',       desc: '5 разных типов практики',      icon: '🎨' },
  { code: 'long_practice',  name: 'Полчаса мира',       desc: 'Практика 30+ минут',           icon: '⏱' },
  { code: 'marathon',       name: 'Марафонец',          desc: 'Практика 60+ минут',           icon: '💪' },
  { code: 'breathing_10',   name: 'Дыши глубже',        desc: '10 дыхательных упражнений',    icon: '💨' },
  { code: 'program_done',   name: 'Программа завершена', desc: 'Завершить любую программу',   icon: '🎯' },
];

// GET /api/achievements — список достижений с отметкой разблокированных
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT code, unlocked_at FROM achievements WHERE user_id = $1',
      [req.userId]
    );
    const unlocked = new Map(result.rows.map(r => [r.code, r.unlocked_at]));

    const achievements = ALL_ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked:    unlocked.has(a.code),
      unlockedAt:  unlocked.get(a.code) || null,
    }));

    res.json({ achievements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки достижений' });
  }
});

// POST /api/achievements/check — проверить и выдать новые достижения
router.post('/check', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Получаем уже разблокированные
    const existingRes = await pool.query(
      'SELECT code FROM achievements WHERE user_id = $1',
      [userId]
    );
    const existing = new Set(existingRes.rows.map(r => r.code));

    // Собираем статистику пользователя
    const sessionsRes = await pool.query(
      'SELECT date, difficulty, type, duration FROM yoga_sessions WHERE user_id = $1',
      [userId]
    );
    const sessions = sessionsRes.rows;
    const total    = sessions.length;

    // Стрик
    const dates  = sessions.map(s => s.date);
    const streak = calcStreak(dates);

    // Разные типы практик
    const types = new Set(sessions.map(s => s.type).filter(t => t && t !== 'general'));

    // Дыхательные упражнения
    const breathingCount = sessions.filter(s => s.type === 'breathing').length;

    // Длинные практики
    const hasLong30 = sessions.some(s => (s.duration || 0) >= 30 * 60);
    const hasLong60 = sessions.some(s => (s.duration || 0) >= 60 * 60);

    // Завершённые программы
    const programsRes = await pool.query(
      'SELECT id FROM user_programs WHERE user_id = $1 AND completed = TRUE',
      [userId]
    );
    const programsDone = programsRes.rows.length;

    // Проверяем условия
    const toUnlock = [];
    const check = (code, condition) => {
      if (condition && !existing.has(code)) toUnlock.push(code);
    };

    check('first_step',    total >= 1);
    check('streak_7',      streak >= 7);
    check('streak_30',     streak >= 30);
    check('total_10',      total >= 10);
    check('total_50',      total >= 50);
    check('total_100',     total >= 100);
    check('variety',       types.size >= 5);
    check('long_practice', hasLong30);
    check('marathon',      hasLong60);
    check('breathing_10',  breathingCount >= 10);
    check('program_done',  programsDone >= 1);

    // Записываем новые достижения
    const newAchievements = [];
    for (const code of toUnlock) {
      await pool.query(
        'INSERT INTO achievements (user_id, code) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, code]
      );
      const achievement = ALL_ACHIEVEMENTS.find(a => a.code === code);
      if (achievement) newAchievements.push(achievement);
    }

    res.json({ newAchievements, total: existing.size + newAchievements.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка проверки достижений' });
  }
});

function calcStreak(dates) {
  if (!dates.length) return 0;
  const sorted  = [...new Set(dates)].sort().reverse();
  const today   = getTodayStr();
  let streak    = 0;
  let current   = today;
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
