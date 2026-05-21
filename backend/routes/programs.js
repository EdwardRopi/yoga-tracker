const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const { pool } = require('../db');
const { PROGRAMS }            = require('../data/program-schedule');
const { SEQUENCES, totalDuration } = require('../data/sequences');
const { POSES }               = require('../data/poses');

// Карта поз для быстрого поиска
const POSES_MAP = new Map(POSES.map(p => [p.id, p]));

/* Хелпер: подсчитать кол-во выполненных дней пользователя в программе */
async function countDoneDays(userId, programId) {
  const r = await pool.query(
    'SELECT COUNT(*)::int AS cnt FROM user_program_days WHERE user_id = $1 AND program_id = $2',
    [userId, programId]
  );
  return r.rows[0]?.cnt || 0;
}

/* Хелпер: получить набор выполненных дней (set чисел) */
async function getDoneDaySet(userId, programId) {
  const r = await pool.query(
    'SELECT day_num FROM user_program_days WHERE user_id = $1 AND program_id = $2',
    [userId, programId]
  );
  return new Set(r.rows.map(x => x.day_num));
}

/* =============================================================
   GET /api/programs — список программ + прогресс юзера
   ============================================================= */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Загружаем активные программы
    const activeRes = await pool.query(
      'SELECT * FROM user_programs WHERE user_id = $1',
      [userId]
    );
    const activeMap = new Map(activeRes.rows.map(r => [r.program_id, r]));

    // Все дни выполнения
    const daysRes = await pool.query(
      'SELECT program_id, COUNT(*)::int AS cnt FROM user_program_days WHERE user_id = $1 GROUP BY program_id',
      [userId]
    );
    const doneByProgram = new Map(daysRes.rows.map(r => [r.program_id, r.cnt]));

    const programs = Object.values(PROGRAMS).map(p => {
      const active   = activeMap.get(p.id);
      const daysDone = doneByProgram.get(p.id) || 0;
      const completed = daysDone >= p.totalDays;
      return {
        id:          p.id,
        name:        p.name,
        icon:        p.icon,
        description: p.description,
        totalDays:   p.totalDays,
        active:      !!active,
        completed,
        daysDone,
        startedAt:   active?.started_at || null,
      };
    });

    res.json({ programs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки программ' });
  }
});

/* =============================================================
   GET /api/programs/:id — полные детали программы + расписание
   ============================================================= */
router.get('/:id', auth, async (req, res) => {
  try {
    const program = PROGRAMS[req.params.id];
    if (!program) return res.status(404).json({ error: 'Программа не найдена' });

    const userId = req.userId;

    // Статус активности
    const activeRes = await pool.query(
      'SELECT * FROM user_programs WHERE user_id = $1 AND program_id = $2',
      [userId, program.id]
    );
    const active = activeRes.rows[0];

    // Выполненные дни
    const doneSet = await getDoneDaySet(userId, program.id);

    // Текущий день = первый невыполненный
    let currentDay = null;
    for (const d of program.days) {
      if (!doneSet.has(d.day)) { currentDay = d.day; break; }
    }

    const days = program.days.map(d => {
      const seq = SEQUENCES[d.sequenceId];
      return {
        day:         d.day,
        title:       d.title,
        sequenceId:  d.sequenceId,
        sequenceName: seq?.name || '',
        duration_min: seq?.duration_min || 0,
        posesCount:  seq?.poses.length || 0,
        completed:   doneSet.has(d.day),
        current:     d.day === currentDay,
      };
    });

    res.json({
      program: {
        id:          program.id,
        name:        program.name,
        icon:        program.icon,
        description: program.description,
        totalDays:   program.totalDays,
        active:      !!active,
        startedAt:   active?.started_at || null,
        daysDone:    doneSet.size,
        completed:   doneSet.size >= program.totalDays,
        currentDay,
        days,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки программы' });
  }
});

/* =============================================================
   GET /api/programs/:id/day/:n — последовательность дня с позами
   ============================================================= */
router.get('/:id/day/:n', auth, async (req, res) => {
  try {
    const program = PROGRAMS[req.params.id];
    if (!program) return res.status(404).json({ error: 'Программа не найдена' });

    const dayNum = parseInt(req.params.n, 10);
    const day    = program.days.find(d => d.day === dayNum);
    if (!day) return res.status(404).json({ error: 'День не найден' });

    const seq = SEQUENCES[day.sequenceId];
    if (!seq) return res.status(500).json({ error: 'Последовательность не найдена' });

    // Объединяем мета поз с данными из последовательности
    const poses = seq.poses.map((p, idx) => {
      const meta = POSES_MAP.get(p.poseId);
      return {
        index:        idx,
        poseId:       p.poseId,
        duration_sec: p.duration_sec,
        side:         p.side || null,
        // Мета позы:
        name_ru:      meta?.name_ru      || p.poseId,
        sanskrit:     meta?.sanskrit     || '',
        name_full:    meta?.name_full    || '',
        silhouette:   meta?.silhouette   || 'standing-tall',
        description:  meta?.description  || '',
        level:        meta?.level        || 1,
      };
    });

    // Проверка завершения
    const doneRes = await pool.query(
      'SELECT 1 FROM user_program_days WHERE user_id = $1 AND program_id = $2 AND day_num = $3',
      [req.userId, program.id, dayNum]
    );

    res.json({
      programId:   program.id,
      programName: program.name,
      day:         dayNum,
      title:       day.title,
      sequence: {
        id:           seq.id,
        name:         seq.name,
        description:  seq.description,
        duration_min: seq.duration_min,
        level:        seq.level,
        effect:       seq.effect,
        totalDuration: totalDuration(seq.id),
        posesCount:   poses.length,
      },
      poses,
      completed: doneRes.rowCount > 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки дня программы' });
  }
});

/* =============================================================
   POST /api/programs/start — начать программу
   ============================================================= */
router.post('/start', auth, async (req, res) => {
  try {
    const { programId } = req.body;
    if (!PROGRAMS[programId]) return res.status(400).json({ error: 'Программа не найдена' });

    // Если запись уже есть — не трогаем started_at, чтобы не сбить прогресс
    await pool.query(
      `INSERT INTO user_programs (user_id, program_id, days_done, completed)
       VALUES ($1, $2, 0, FALSE)
       ON CONFLICT (user_id, program_id) DO NOTHING`,
      [req.userId, programId]
    );

    res.json({ message: 'Программа активирована', program: PROGRAMS[programId] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка запуска программы' });
  }
});

/* =============================================================
   POST /api/programs/:id/day/:n/complete — отметить день пройденным
   body: { duration_sec, difficulty? }
   ============================================================= */
router.post('/:id/day/:n/complete', auth, async (req, res) => {
  try {
    const program = PROGRAMS[req.params.id];
    if (!program) return res.status(404).json({ error: 'Программа не найдена' });

    const dayNum = parseInt(req.params.n, 10);
    const day    = program.days.find(d => d.day === dayNum);
    if (!day) return res.status(404).json({ error: 'День не найден' });

    const { duration_sec, difficulty } = req.body;
    const dur = Number(duration_sec) || 0;

    // 1. Запись о выполнении дня
    await pool.query(
      `INSERT INTO user_program_days (user_id, program_id, day_num, duration_sec)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, program_id, day_num) DO UPDATE SET duration_sec = EXCLUDED.duration_sec`,
      [req.userId, program.id, dayNum, dur]
    );

    // 2. Создаём/обновляем yoga_sessions для сегодня
    const today = new Date().toISOString().slice(0, 10);
    const diff  = (difficulty && difficulty >= 1 && difficulty <= 4) ? difficulty : 2;
    await pool.query(
      `INSERT INTO yoga_sessions (user_id, date, difficulty, type, duration, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, date)
       DO UPDATE SET difficulty = EXCLUDED.difficulty,
                     type       = EXCLUDED.type,
                     duration   = GREATEST(yoga_sessions.duration, EXCLUDED.duration),
                     updated_at = NOW()`,
      [req.userId, today, diff, 'general', dur, `Программа «${program.name}», день ${dayNum}`]
    );

    // 3. Обновляем days_done и completed в user_programs
    const doneCount = await countDoneDays(req.userId, program.id);
    const isComplete = doneCount >= program.totalDays;

    await pool.query(
      `INSERT INTO user_programs (user_id, program_id, days_done, completed)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, program_id)
       DO UPDATE SET days_done = $3, completed = $4`,
      [req.userId, program.id, doneCount, isComplete]
    );

    res.json({
      message: 'День засчитан',
      daysDone: doneCount,
      totalDays: program.totalDays,
      completed: isComplete,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сохранения прогресса' });
  }
});

/* =============================================================
   POST /api/programs/progress — оставлено для совместимости
   Пересчитывает days_done на основе user_program_days
   ============================================================= */
router.post('/progress', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_programs WHERE user_id = $1 AND completed = FALSE',
      [req.userId]
    );

    const completed = [];
    for (const prog of result.rows) {
      const program = PROGRAMS[prog.program_id];
      if (!program) continue;

      const doneCount = await countDoneDays(req.userId, prog.program_id);
      const isComplete = doneCount >= program.totalDays;

      await pool.query(
        'UPDATE user_programs SET days_done = $1, completed = $2 WHERE user_id = $3 AND program_id = $4',
        [doneCount, isComplete, req.userId, prog.program_id]
      );

      if (isComplete) completed.push(program);
    }

    res.json({ completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка обновления прогресса программ' });
  }
});

module.exports = router;
