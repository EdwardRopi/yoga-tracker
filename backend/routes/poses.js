const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const { pool } = require('../db');
const { POSES } = require('../data/poses');

// Карта для быстрого поиска по id
const POSES_MAP = new Map(POSES.map(p => [p.id, p]));

/* ============ GET /api/poses ============
   Список поз. Фильтры через query:
     ?level=1|2|3
     ?category=standing|seated|prone|supine|inverted|balance|restorative
     ?effect=energy|relax|sleep|strength|flexibility|grounding|focus
     ?muscle=back|legs|arms|core|hips|shoulders|balance|full_body
     ?search=строка
   В ответе — компактный список (без steps/benefits — это уже в /:id).
*/
router.get('/', auth, async (req, res) => {
  try {
    const { level, category, effect, muscle, search } = req.query;

    // Получаем избранное пользователя
    const favRes = await pool.query(
      'SELECT pose_id FROM user_favorite_poses WHERE user_id = $1',
      [req.userId]
    );
    const favSet = new Set(favRes.rows.map(r => r.pose_id));

    let list = POSES;

    if (level)    list = list.filter(p => String(p.level) === String(level));
    if (category) list = list.filter(p => p.category === category);
    if (effect)   list = list.filter(p => p.effect === effect);
    if (muscle)   list = list.filter(p => p.muscle_group === muscle);

    if (search) {
      const q = String(search).toLowerCase().trim();
      list = list.filter(p =>
        p.name_ru.toLowerCase().includes(q) ||
        p.sanskrit.toLowerCase().includes(q) ||
        (p.name_full || '').toLowerCase().includes(q)
      );
    }

    const compact = list.map(p => ({
      id:           p.id,
      name_ru:      p.name_ru,
      sanskrit:     p.sanskrit,
      level:        p.level,
      category:     p.category,
      muscle_group: p.muscle_group,
      effect:       p.effect,
      duration_sec: p.duration_sec,
      silhouette:   p.silhouette,
      description:  p.description,
      favorite:     favSet.has(p.id),
    }));

    res.json({ poses: compact, total: compact.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки поз' });
  }
});

/* ============ GET /api/poses/favorites ============
   Только избранные позы пользователя.
*/
router.get('/favorites', auth, async (req, res) => {
  try {
    const favRes = await pool.query(
      'SELECT pose_id FROM user_favorite_poses WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    const poses = favRes.rows
      .map(r => POSES_MAP.get(r.pose_id))
      .filter(Boolean)
      .map(p => ({ ...p, favorite: true }));

    res.json({ poses, total: poses.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки избранного' });
  }
});

/* ============ GET /api/poses/meta ============
   Метаданные для фильтров (категории, эффекты, уровни) на клиенте.
*/
router.get('/meta', auth, async (req, res) => {
  try {
    const collect = (key) => {
      const set = new Set();
      POSES.forEach(p => set.add(p[key]));
      return Array.from(set);
    };
    res.json({
      levels:     [1, 2, 3],
      categories: collect('category'),
      effects:    collect('effect'),
      muscles:    collect('muscle_group'),
      total:      POSES.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка метаданных' });
  }
});

/* ============ GET /api/poses/:id ============
   Полные данные одной позы.
*/
router.get('/:id', auth, async (req, res) => {
  try {
    const pose = POSES_MAP.get(req.params.id);
    if (!pose) return res.status(404).json({ error: 'Поза не найдена' });

    const favRes = await pool.query(
      'SELECT 1 FROM user_favorite_poses WHERE user_id = $1 AND pose_id = $2',
      [req.userId, req.params.id]
    );

    res.json({ pose: { ...pose, favorite: favRes.rowCount > 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки позы' });
  }
});

/* ============ POST /api/poses/:id/favorite ============
   Добавить позу в избранное.
*/
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    if (!POSES_MAP.has(req.params.id)) {
      return res.status(404).json({ error: 'Поза не найдена' });
    }
    await pool.query(
      `INSERT INTO user_favorite_poses (user_id, pose_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, pose_id) DO NOTHING`,
      [req.userId, req.params.id]
    );
    res.json({ favorite: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сохранения избранного' });
  }
});

/* ============ DELETE /api/poses/:id/favorite ============
   Убрать позу из избранного.
*/
router.delete('/:id/favorite', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM user_favorite_poses WHERE user_id = $1 AND pose_id = $2',
      [req.userId, req.params.id]
    );
    res.json({ favorite: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления из избранного' });
  }
});

module.exports = router;
