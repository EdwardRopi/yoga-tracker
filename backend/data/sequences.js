/* =====================================================
   ПОСЛЕДОВАТЕЛЬНОСТИ ПОЗ — готовые тренировки
   =====================================================
   Каждая sequence имеет:
     id            — уникальный slug
     name          — название
     description   — короткое описание
     duration_min  — примерная длительность в минутах
     level         — 1/2/3
     effect        — основной эффект тренировки
     poses[]       — список { poseId, duration_sec, side? }
       side: 'right' | 'left' — если позу делают и справа и слева
   ===================================================== */

const SEQUENCES = {

  'quick-wakeup-7': {
    id: 'quick-wakeup-7',
    name: 'Быстрая разминка',
    description: 'Короткий комплекс на 7 минут — разбудить тело и сосредоточиться.',
    duration_min: 7,
    level: 1,
    effect: 'energy',
    poses: [
      { poseId: 'tadasana',              duration_sec: 30 },
      { poseId: 'urdhva_hastasana',      duration_sec: 30 },
      { poseId: 'uttanasana',            duration_sec: 45 },
      { poseId: 'adho_mukha_svanasana',  duration_sec: 60 },
      { poseId: 'phalakasana',           duration_sec: 30 },
      { poseId: 'bhujangasana',          duration_sec: 45 },
      { poseId: 'balasana',              duration_sec: 60 },
      { poseId: 'shavasana',             duration_sec: 90 },
    ],
  },

  'morning-energy-15': {
    id: 'morning-energy-15',
    name: 'Утренняя бодрость',
    description: 'Активная практика для зарядки на день. Стоячие позы и виньяса.',
    duration_min: 15,
    level: 1,
    effect: 'energy',
    poses: [
      { poseId: 'tadasana',              duration_sec: 30 },
      { poseId: 'urdhva_hastasana',      duration_sec: 30 },
      { poseId: 'uttanasana',            duration_sec: 45 },
      { poseId: 'ardha_uttanasana',      duration_sec: 20 },
      { poseId: 'adho_mukha_svanasana',  duration_sec: 60 },
      { poseId: 'phalakasana',           duration_sec: 30 },
      { poseId: 'chaturanga_dandasana',  duration_sec: 15 },
      { poseId: 'urdhva_mukha_svanasana', duration_sec: 30 },
      { poseId: 'adho_mukha_svanasana',  duration_sec: 45 },
      { poseId: 'virabhadrasana1',       duration_sec: 60, side: 'right' },
      { poseId: 'virabhadrasana1',       duration_sec: 60, side: 'left' },
      { poseId: 'virabhadrasana2',       duration_sec: 45, side: 'right' },
      { poseId: 'virabhadrasana2',       duration_sec: 45, side: 'left' },
      { poseId: 'balasana',              duration_sec: 60 },
      { poseId: 'bhujangasana',          duration_sec: 45 },
      { poseId: 'balasana',              duration_sec: 60 },
      { poseId: 'shavasana',             duration_sec: 120 },
    ],
  },

  'evening-relax-15': {
    id: 'evening-relax-15',
    name: 'Вечернее расслабление',
    description: 'Мягкая практика для снятия усталости. Сидячие складки и восстановление.',
    duration_min: 15,
    level: 1,
    effect: 'relax',
    poses: [
      { poseId: 'easy_seat_breath',         duration_sec: 90 },
      { poseId: 'marjariasana',             duration_sec: 30 },
      { poseId: 'bitilasana',               duration_sec: 30 },
      { poseId: 'balasana',                 duration_sec: 60 },
      { poseId: 'janu_sirsasana',           duration_sec: 60, side: 'right' },
      { poseId: 'janu_sirsasana',           duration_sec: 60, side: 'left' },
      { poseId: 'paschimottanasana',        duration_sec: 90 },
      { poseId: 'supta_baddha_konasana',    duration_sec: 120 },
      { poseId: 'supta_matsyendrasana',     duration_sec: 60, side: 'right' },
      { poseId: 'supta_matsyendrasana',     duration_sec: 60, side: 'left' },
      { poseId: 'viparita_karani',          duration_sec: 180 },
      { poseId: 'shavasana',                duration_sec: 180 },
    ],
  },

  'strength-20': {
    id: 'strength-20',
    name: 'Сила',
    description: 'Силовая практика для укрепления всего тела. Стоячие позы и балансы.',
    duration_min: 20,
    level: 2,
    effect: 'strength',
    poses: [
      { poseId: 'adho_mukha_svanasana',  duration_sec: 60 },
      { poseId: 'phalakasana',           duration_sec: 45 },
      { poseId: 'chaturanga_dandasana',  duration_sec: 15 },
      { poseId: 'urdhva_mukha_svanasana', duration_sec: 30 },
      { poseId: 'adho_mukha_svanasana',  duration_sec: 45 },
      { poseId: 'virabhadrasana1',       duration_sec: 60, side: 'right' },
      { poseId: 'virabhadrasana2',       duration_sec: 60, side: 'right' },
      { poseId: 'virabhadrasana1',       duration_sec: 60, side: 'left' },
      { poseId: 'virabhadrasana2',       duration_sec: 60, side: 'left' },
      { poseId: 'virabhadrasana3',       duration_sec: 30, side: 'right' },
      { poseId: 'virabhadrasana3',       duration_sec: 30, side: 'left' },
      { poseId: 'utkatasana',            duration_sec: 60 },
      { poseId: 'vrikshasana',           duration_sec: 45, side: 'right' },
      { poseId: 'vrikshasana',           duration_sec: 45, side: 'left' },
      { poseId: 'shalabhasana',          duration_sec: 45 },
      { poseId: 'dhanurasana',           duration_sec: 30 },
      { poseId: 'balasana',              duration_sec: 60 },
      { poseId: 'setu_bandhasana',       duration_sec: 60 },
      { poseId: 'shavasana',             duration_sec: 180 },
    ],
  },

  'flexibility-15': {
    id: 'flexibility-15',
    name: 'Гибкость',
    description: 'Глубокая растяжка для всего тела. Раскрытие бёдер и спины.',
    duration_min: 15,
    level: 1,
    effect: 'flexibility',
    poses: [
      { poseId: 'sukhasana',              duration_sec: 60 },
      { poseId: 'marjariasana',           duration_sec: 30 },
      { poseId: 'bitilasana',             duration_sec: 30 },
      { poseId: 'adho_mukha_svanasana',   duration_sec: 60 },
      { poseId: 'uttanasana',             duration_sec: 60 },
      { poseId: 'malasana',               duration_sec: 60 },
      { poseId: 'baddha_konasana',        duration_sec: 90 },
      { poseId: 'paschimottanasana',      duration_sec: 90 },
      { poseId: 'janu_sirsasana',         duration_sec: 60, side: 'right' },
      { poseId: 'janu_sirsasana',         duration_sec: 60, side: 'left' },
      { poseId: 'supta_padangushthasana', duration_sec: 60, side: 'right' },
      { poseId: 'supta_padangushthasana', duration_sec: 60, side: 'left' },
      { poseId: 'ananda_balasana',        duration_sec: 60 },
      { poseId: 'shavasana',              duration_sec: 120 },
    ],
  },

  'balance-15': {
    id: 'balance-15',
    name: 'Баланс и фокус',
    description: 'Балансовые позы стоя. Развивают концентрацию и устойчивость.',
    duration_min: 15,
    level: 2,
    effect: 'focus',
    poses: [
      { poseId: 'tadasana',              duration_sec: 45 },
      { poseId: 'urdhva_hastasana',      duration_sec: 30 },
      { poseId: 'uttanasana',            duration_sec: 30 },
      { poseId: 'adho_mukha_svanasana',  duration_sec: 45 },
      { poseId: 'vrikshasana',           duration_sec: 60, side: 'right' },
      { poseId: 'vrikshasana',           duration_sec: 60, side: 'left' },
      { poseId: 'garudasana',            duration_sec: 45, side: 'right' },
      { poseId: 'garudasana',            duration_sec: 45, side: 'left' },
      { poseId: 'virabhadrasana3',       duration_sec: 45, side: 'right' },
      { poseId: 'virabhadrasana3',       duration_sec: 45, side: 'left' },
      { poseId: 'utkatasana',            duration_sec: 60 },
      { poseId: 'phalakasana',           duration_sec: 45 },
      { poseId: 'balasana',              duration_sec: 60 },
      { poseId: 'supta_baddha_konasana', duration_sec: 90 },
      { poseId: 'shavasana',             duration_sec: 180 },
    ],
  },

  'breath-meditate-15': {
    id: 'breath-meditate-15',
    name: 'Дыхание и медитация',
    description: 'Спокойная сидячая практика с пранаямой и долгой Шавасаной.',
    duration_min: 15,
    level: 1,
    effect: 'focus',
    poses: [
      { poseId: 'sukhasana',             duration_sec: 60 },
      { poseId: 'anjali_mudra',          duration_sec: 30 },
      { poseId: 'easy_seat_breath',      duration_sec: 180 },
      { poseId: 'marjariasana',          duration_sec: 30 },
      { poseId: 'bitilasana',            duration_sec: 30 },
      { poseId: 'balasana',              duration_sec: 90 },
      { poseId: 'supta_baddha_konasana', duration_sec: 180 },
      { poseId: 'shavasana',             duration_sec: 300 },
    ],
  },

  'backbends-20': {
    id: 'backbends-20',
    name: 'Прогибы',
    description: 'Раскрывающие позы с прогибами назад. Бодрят и тонизируют спину.',
    duration_min: 20,
    level: 2,
    effect: 'energy',
    poses: [
      { poseId: 'sukhasana',                duration_sec: 60 },
      { poseId: 'marjariasana',             duration_sec: 30 },
      { poseId: 'bitilasana',               duration_sec: 30 },
      { poseId: 'bhujangasana',             duration_sec: 45 },
      { poseId: 'shalabhasana',             duration_sec: 30 },
      { poseId: 'dhanurasana',              duration_sec: 30 },
      { poseId: 'urdhva_mukha_svanasana',   duration_sec: 30 },
      { poseId: 'adho_mukha_svanasana',     duration_sec: 60 },
      { poseId: 'ustrasana',                duration_sec: 45 },
      { poseId: 'setu_bandhasana',          duration_sec: 60 },
      { poseId: 'matsyasana',               duration_sec: 45 },
      { poseId: 'supta_matsyendrasana',     duration_sec: 60, side: 'right' },
      { poseId: 'supta_matsyendrasana',     duration_sec: 60, side: 'left' },
      { poseId: 'ananda_balasana',          duration_sec: 60 },
      { poseId: 'balasana',                 duration_sec: 90 },
      { poseId: 'shavasana',                duration_sec: 180 },
    ],
  },

  'hips-15': {
    id: 'hips-15',
    name: 'Раскрытие бёдер',
    description: 'Глубокая работа с тазобедренными суставами. Расслабляет и заземляет.',
    duration_min: 15,
    level: 1,
    effect: 'flexibility',
    poses: [
      { poseId: 'sukhasana',             duration_sec: 60 },
      { poseId: 'marjariasana',          duration_sec: 30 },
      { poseId: 'bitilasana',            duration_sec: 30 },
      { poseId: 'malasana',              duration_sec: 60 },
      { poseId: 'baddha_konasana',       duration_sec: 90 },
      { poseId: 'upavishta_konasana',    duration_sec: 60 },
      { poseId: 'janu_sirsasana',        duration_sec: 60, side: 'right' },
      { poseId: 'janu_sirsasana',        duration_sec: 60, side: 'left' },
      { poseId: 'gomukhasana',           duration_sec: 60, side: 'right' },
      { poseId: 'gomukhasana',           duration_sec: 60, side: 'left' },
      { poseId: 'supta_baddha_konasana', duration_sec: 120 },
      { poseId: 'ananda_balasana',       duration_sec: 60 },
      { poseId: 'shavasana',             duration_sec: 120 },
    ],
  },

  'wind-down-10': {
    id: 'wind-down-10',
    name: 'Перед сном',
    description: 'Мягкая практика для подготовки ко сну. Длинные удержания.',
    duration_min: 10,
    level: 1,
    effect: 'sleep',
    poses: [
      { poseId: 'easy_seat_breath',         duration_sec: 90 },
      { poseId: 'janu_sirsasana',           duration_sec: 60, side: 'right' },
      { poseId: 'janu_sirsasana',           duration_sec: 60, side: 'left' },
      { poseId: 'supta_matsyendrasana',     duration_sec: 60, side: 'right' },
      { poseId: 'supta_matsyendrasana',     duration_sec: 60, side: 'left' },
      { poseId: 'viparita_karani',          duration_sec: 180 },
      { poseId: 'ananda_balasana',          duration_sec: 60 },
      { poseId: 'shavasana',                duration_sec: 180 },
    ],
  },

};

// Хелпер: посчитать общую длительность последовательности
function totalDuration(sequenceId) {
  const seq = SEQUENCES[sequenceId];
  if (!seq) return 0;
  return seq.poses.reduce((sum, p) => sum + p.duration_sec, 0);
}

module.exports = { SEQUENCES, totalDuration };
