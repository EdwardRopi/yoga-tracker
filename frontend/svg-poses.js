/* =====================================================
   SVG-СИЛУЭТЫ ПОЗ ЙОГИ
   =====================================================
   Стиль: line-art, viewBox 0 0 100 100,
   stroke="currentColor", stroke-width="2.5",
   stroke-linecap+linejoin="round".
   Голова — круг с fill="currentColor".

   Используется через POSE_SILHOUETTES[id] → SVG-строка.
   Если силуэта нет — fallback на «default».
   ===================================================== */

const POSE_SILHOUETTES = {};

// Внутренняя функция-обёртка, чтобы не дублировать атрибуты
function svg(inner) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
function head(cx, cy, r = 5) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="none"/>`;
}

// ============ STANDING ============
POSE_SILHOUETTES['standing-tall'] = svg(`
  ${head(50, 18)}
  <path d="M50 23 V 60"/>
  <path d="M50 32 L 38 55"/>
  <path d="M50 32 L 62 55"/>
  <path d="M50 60 L 42 85"/>
  <path d="M50 60 L 58 85"/>
`);

POSE_SILHOUETTES['hands-up'] = svg(`
  ${head(50, 25)}
  <path d="M50 30 V 60"/>
  <path d="M50 32 L 40 10"/>
  <path d="M50 32 L 60 10"/>
  <path d="M50 60 L 42 85"/>
  <path d="M50 60 L 58 85"/>
`);

POSE_SILHOUETTES['standing-forward'] = svg(`
  <path d="M42 85 L 42 45"/>
  <path d="M58 85 L 58 45"/>
  <path d="M50 45 L 50 65"/>
  ${head(50, 70, 4.5)}
  <path d="M45 62 L 38 78"/>
  <path d="M55 62 L 62 78"/>
`);

POSE_SILHOUETTES['half-forward'] = svg(`
  <path d="M44 85 L 44 50"/>
  <path d="M58 85 L 58 50"/>
  <path d="M51 50 L 78 38"/>
  ${head(82, 35, 4.5)}
  <path d="M65 42 L 80 55"/>
  <path d="M55 45 L 70 60"/>
`);

POSE_SILHOUETTES['tree'] = svg(`
  ${head(50, 14)}
  <path d="M50 20 V 55"/>
  <path d="M50 25 L 35 5"/>
  <path d="M50 25 L 65 5"/>
  <path d="M48 26 Q 50 22 52 26"/>
  <path d="M50 55 L 50 88"/>
  <path d="M50 55 L 36 65 L 50 70"/>
`);

POSE_SILHOUETTES['warrior1'] = svg(`
  ${head(40, 15)}
  <path d="M40 21 L 45 50"/>
  <path d="M40 22 L 30 5"/>
  <path d="M40 22 L 50 5"/>
  <path d="M45 50 L 38 85"/>
  <path d="M45 50 L 78 70 L 90 70"/>
`);

POSE_SILHOUETTES['warrior2'] = svg(`
  ${head(50, 30)}
  <path d="M50 35 V 55"/>
  <path d="M50 38 L 18 38"/>
  <path d="M50 38 L 82 38"/>
  <path d="M50 55 L 25 85"/>
  <path d="M50 55 L 75 80"/>
`);

POSE_SILHOUETTES['warrior3'] = svg(`
  ${head(15, 50, 4.5)}
  <path d="M20 50 L 60 50"/>
  <path d="M22 47 L 8 35"/>
  <path d="M22 47 L 8 60"/>
  <path d="M60 50 L 60 85"/>
  <path d="M60 50 L 92 40"/>
`);

POSE_SILHOUETTES['triangle'] = svg(`
  ${head(28, 25)}
  <path d="M30 30 L 45 55"/>
  <path d="M45 55 L 65 25"/>
  <path d="M65 25 L 65 8"/>
  <path d="M45 55 L 25 85"/>
  <path d="M45 55 L 80 85"/>
`);

POSE_SILHOUETTES['chair'] = svg(`
  ${head(50, 18)}
  <path d="M50 24 L 35 50"/>
  <path d="M50 26 L 40 5"/>
  <path d="M50 26 L 60 5"/>
  <path d="M35 50 L 50 70"/>
  <path d="M50 70 L 42 88"/>
  <path d="M50 70 L 58 88"/>
`);

POSE_SILHOUETTES['eagle'] = svg(`
  ${head(50, 14)}
  <path d="M50 20 L 50 55"/>
  <path d="M50 24 Q 40 35 50 42 Q 60 49 50 56"/>
  <path d="M50 55 Q 38 65 50 75 Q 62 85 50 90"/>
`);

POSE_SILHOUETTES['dancer'] = svg(`
  ${head(35, 22)}
  <path d="M35 28 L 50 50"/>
  <path d="M35 28 L 18 38"/>
  <path d="M50 50 L 50 85"/>
  <path d="M50 50 L 80 28 L 85 35"/>
`);

// ============ SEATED ============
POSE_SILHOUETTES['seated-cross'] = svg(`
  ${head(50, 22)}
  <path d="M50 28 V 60"/>
  <path d="M50 35 L 35 50"/>
  <path d="M50 35 L 65 50"/>
  <path d="M50 60 L 28 75 L 50 70 L 72 75"/>
`);

POSE_SILHOUETTES['lotus'] = svg(`
  ${head(50, 18)}
  <path d="M50 24 V 58"/>
  <path d="M50 30 L 32 45"/>
  <path d="M50 30 L 68 45"/>
  <path d="M50 58 Q 22 72 38 78 Q 50 72 62 78 Q 78 72 50 58"/>
`);

POSE_SILHOUETTES['seated-heels'] = svg(`
  ${head(50, 20)}
  <path d="M50 26 V 60"/>
  <path d="M50 32 L 35 50"/>
  <path d="M50 32 L 65 50"/>
  <path d="M50 60 L 30 75 L 70 75 L 50 60"/>
`);

POSE_SILHOUETTES['seated-forward'] = svg(`
  <path d="M15 75 L 90 70"/>
  <path d="M30 70 L 30 60"/>
  ${head(35, 60, 4.5)}
  <path d="M35 65 L 75 68"/>
  <path d="M55 65 L 75 75"/>
`);

POSE_SILHOUETTES['butterfly'] = svg(`
  ${head(50, 25)}
  <path d="M50 31 V 60"/>
  <path d="M50 38 L 32 55"/>
  <path d="M50 38 L 68 55"/>
  <path d="M50 60 L 25 70 L 50 65 L 75 70"/>
  <path d="M25 70 L 30 78"/>
  <path d="M75 70 L 70 78"/>
`);

POSE_SILHOUETTES['head-to-knee'] = svg(`
  <path d="M15 75 L 70 70"/>
  ${head(28, 62, 4.5)}
  <path d="M30 65 L 60 70"/>
  <path d="M45 75 L 30 88 L 55 88"/>
`);

POSE_SILHOUETTES['cow-face'] = svg(`
  ${head(50, 18)}
  <path d="M50 24 V 60"/>
  <path d="M50 28 L 65 18 L 60 35"/>
  <path d="M50 28 L 38 42 L 48 42"/>
  <path d="M50 60 L 30 78 L 70 70 L 50 60"/>
`);

POSE_SILHOUETTES['seated-twist'] = svg(`
  ${head(60, 20)}
  <path d="M60 26 Q 40 40 50 60"/>
  <path d="M50 60 L 18 80"/>
  <path d="M50 60 L 80 75 L 80 60"/>
  <path d="M60 28 L 75 22"/>
  <path d="M55 38 L 35 30"/>
`);

POSE_SILHOUETTES['wide-seated'] = svg(`
  ${head(50, 25)}
  <path d="M50 30 V 60"/>
  <path d="M50 38 L 25 55"/>
  <path d="M50 38 L 75 55"/>
  <path d="M50 60 L 12 80"/>
  <path d="M50 60 L 88 80"/>
`);

// ============ PRONE / BACKBEND ============
POSE_SILHOUETTES['cobra'] = svg(`
  ${head(22, 35)}
  <path d="M28 38 Q 35 45 45 55"/>
  <path d="M45 55 L 88 70"/>
  <path d="M30 45 L 30 65"/>
  <path d="M45 55 L 38 70"/>
`);

POSE_SILHOUETTES['upward-dog'] = svg(`
  ${head(22, 30)}
  <path d="M25 35 L 38 50 L 70 55"/>
  <path d="M70 55 L 90 35"/>
  <path d="M28 38 L 28 70"/>
  <path d="M70 55 L 70 75"/>
`);

POSE_SILHOUETTES['locust'] = svg(`
  ${head(20, 60)}
  <path d="M25 60 L 75 50"/>
  <path d="M75 50 L 95 28"/>
  <path d="M25 60 L 18 78"/>
  <path d="M35 58 L 30 75"/>
`);

POSE_SILHOUETTES['bow'] = svg(`
  ${head(20, 55)}
  <path d="M25 55 Q 50 30 75 55"/>
  <path d="M22 60 Q 50 90 78 60"/>
  <path d="M28 58 L 50 75"/>
  <path d="M72 58 L 50 75"/>
`);

POSE_SILHOUETTES['camel'] = svg(`
  ${head(50, 25)}
  <path d="M50 30 Q 70 50 55 75"/>
  <path d="M55 75 L 30 88"/>
  <path d="M55 75 L 70 88"/>
  <path d="M50 35 L 75 50"/>
  <path d="M50 45 L 70 35"/>
`);

POSE_SILHOUETTES['bridge'] = svg(`
  ${head(15, 70, 4.5)}
  <path d="M20 70 L 50 50 L 80 70"/>
  <path d="M22 65 L 22 80"/>
  <path d="M80 70 L 80 88"/>
`);

POSE_SILHOUETTES['wheel'] = svg(`
  <path d="M15 80 Q 50 25 85 80"/>
  ${head(50, 65, 4.5)}
  <path d="M15 80 L 22 88"/>
  <path d="M85 80 L 78 88"/>
  <path d="M28 70 L 22 82"/>
  <path d="M72 70 L 78 82"/>
`);

POSE_SILHOUETTES['fish'] = svg(`
  ${head(15, 50, 4.5)}
  <path d="M20 55 Q 35 70 60 70 L 88 70"/>
  <path d="M40 60 L 35 75"/>
  <path d="M65 65 L 75 80"/>
  <path d="M60 70 L 60 85"/>
`);

// ============ SUPINE ============
POSE_SILHOUETTES['supine-rest'] = svg(`
  ${head(15, 50, 4.5)}
  <path d="M20 52 L 90 52"/>
  <path d="M28 50 L 35 38"/>
  <path d="M28 56 L 35 65"/>
  <path d="M85 50 L 92 45"/>
  <path d="M85 55 L 92 60"/>
`);

POSE_SILHOUETTES['legs-up-wall'] = svg(`
  ${head(15, 70, 4.5)}
  <path d="M20 72 L 65 72"/>
  <path d="M65 72 L 65 15"/>
  <path d="M28 70 L 35 60"/>
  <path d="M28 76 L 35 85"/>
  <path d="M58 25 L 58 8"/>
`);

POSE_SILHOUETTES['happy-baby'] = svg(`
  ${head(50, 75, 4.5)}
  <path d="M50 70 L 50 50"/>
  <path d="M50 55 L 30 35 L 30 50"/>
  <path d="M50 55 L 70 35 L 70 50"/>
  <path d="M50 70 L 38 72"/>
  <path d="M50 70 L 62 72"/>
`);

POSE_SILHOUETTES['supine-leg'] = svg(`
  ${head(15, 65, 4.5)}
  <path d="M20 67 L 65 67"/>
  <path d="M65 67 L 78 22"/>
  <path d="M65 67 L 88 70"/>
  <path d="M75 30 L 82 18"/>
`);

POSE_SILHOUETTES['supine-twist'] = svg(`
  ${head(82, 35, 4.5)}
  <path d="M78 38 L 50 55 L 28 75"/>
  <path d="M50 55 L 88 60"/>
  <path d="M30 75 L 38 88"/>
  <path d="M30 75 L 18 80"/>
  <path d="M78 38 L 90 30"/>
`);

POSE_SILHOUETTES['knee-to-chest'] = svg(`
  ${head(15, 50, 4.5)}
  <path d="M20 55 L 50 55"/>
  <path d="M50 55 L 35 35 L 25 45"/>
  <path d="M50 55 L 65 35 L 75 45"/>
  <path d="M40 45 L 28 38"/>
  <path d="M60 45 L 72 38"/>
`);

// ============ INVERTED ============
POSE_SILHOUETTES['shoulder-stand'] = svg(`
  ${head(50, 88, 4.5)}
  <path d="M50 83 L 50 25"/>
  <path d="M50 30 L 42 8"/>
  <path d="M50 30 L 58 8"/>
  <path d="M40 80 L 32 88"/>
  <path d="M60 80 L 68 88"/>
`);

POSE_SILHOUETTES['plow'] = svg(`
  ${head(60, 85, 4.5)}
  <path d="M55 85 L 55 50 L 12 35"/>
  <path d="M50 80 L 35 88"/>
  <path d="M60 80 L 75 88"/>
  <path d="M15 30 L 8 22"/>
`);

POSE_SILHOUETTES['headstand'] = svg(`
  ${head(50, 88, 4.5)}
  <path d="M50 83 V 12"/>
  <path d="M50 18 L 42 4"/>
  <path d="M50 18 L 58 4"/>
  <path d="M40 80 L 28 75"/>
  <path d="M60 80 L 72 75"/>
`);

POSE_SILHOUETTES['handstand'] = svg(`
  ${head(50, 90, 4.5)}
  <path d="M50 85 V 15"/>
  <path d="M50 20 L 38 6"/>
  <path d="M50 20 L 62 6"/>
  <path d="M38 85 L 50 90 L 62 85"/>
`);

// ============ BALANCE / ARM ============
POSE_SILHOUETTES['crow'] = svg(`
  ${head(55, 25)}
  <path d="M55 30 Q 42 45 30 65"/>
  <path d="M30 65 L 18 85"/>
  <path d="M30 65 L 50 75"/>
  <path d="M55 35 L 75 60"/>
  <path d="M75 60 L 75 85"/>
`);

POSE_SILHOUETTES['chaturanga'] = svg(`
  ${head(15, 38, 4.5)}
  <path d="M20 38 L 85 38"/>
  <path d="M28 38 L 28 60"/>
  <path d="M30 60 L 30 80"/>
  <path d="M85 38 L 92 90"/>
`);

POSE_SILHOUETTES['plank'] = svg(`
  ${head(15, 35, 4.5)}
  <path d="M20 35 L 85 35"/>
  <path d="M30 35 L 30 75"/>
  <path d="M85 35 L 92 88"/>
`);

POSE_SILHOUETTES['downward-dog'] = svg(`
  ${head(18, 75, 4.5)}
  <path d="M22 72 L 50 25 L 82 72"/>
  <path d="M22 72 L 14 88"/>
  <path d="M82 72 L 88 88"/>
`);

// ============ RESTORATIVE ============
POSE_SILHOUETTES['child'] = svg(`
  ${head(20, 75, 4.5)}
  <path d="M25 72 L 55 50"/>
  <path d="M55 50 L 80 75"/>
  <path d="M55 50 L 55 75"/>
  <path d="M20 75 L 12 80"/>
  <path d="M28 70 L 18 65"/>
`);

POSE_SILHOUETTES['reclined-butterfly'] = svg(`
  ${head(15, 50, 4.5)}
  <path d="M20 52 L 60 52"/>
  <path d="M60 52 L 35 75 L 60 65 L 85 75"/>
  <path d="M28 50 L 36 40"/>
  <path d="M28 55 L 36 65"/>
`);

POSE_SILHOUETTES['squat'] = svg(`
  ${head(50, 35)}
  <path d="M50 41 L 50 65"/>
  <path d="M50 50 L 42 60 L 50 58"/>
  <path d="M50 50 L 58 60 L 50 58"/>
  <path d="M50 65 L 25 75 L 28 88"/>
  <path d="M50 65 L 75 75 L 72 88"/>
`);

// ============ FLOW ============
POSE_SILHOUETTES['prayer'] = svg(`
  ${head(50, 22)}
  <path d="M50 28 V 60"/>
  <path d="M50 32 L 42 45 L 50 50"/>
  <path d="M50 32 L 58 45 L 50 50"/>
  <path d="M50 60 L 28 75 L 50 70 L 72 75"/>
`);

POSE_SILHOUETTES['cat'] = svg(`
  ${head(15, 55, 4.5)}
  <path d="M20 55 Q 45 30 75 55"/>
  <path d="M30 60 L 30 88"/>
  <path d="M75 55 L 88 80"/>
  <path d="M40 50 L 50 38"/>
`);

POSE_SILHOUETTES['cow'] = svg(`
  ${head(15, 38, 4.5)}
  <path d="M20 40 Q 45 70 75 50"/>
  <path d="M30 55 L 30 88"/>
  <path d="M75 50 L 88 80"/>
`);

// =====================================================
// СИНОНИМЫ — fallback на похожие силуэты
// =====================================================
const POSE_SILHOUETTE_SYNONYMS = {
  // если что-то не нашли — отдадим стоящего человечка
};

// Геттер с фолбэком
function getSilhouette(id) {
  if (POSE_SILHOUETTES[id]) return POSE_SILHOUETTES[id];
  const syn = POSE_SILHOUETTE_SYNONYMS[id];
  if (syn && POSE_SILHOUETTES[syn]) return POSE_SILHOUETTES[syn];
  return POSE_SILHOUETTES['standing-tall'];
}
