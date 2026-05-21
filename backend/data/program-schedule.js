/* =====================================================
   РАСПИСАНИЕ ПРОГРАММ ПО ДНЯМ
   =====================================================
   Каждая программа имеет id, name, описание, totalDays и расписание days:
     { day, title, sequenceId }
   sequenceId должен существовать в backend/data/sequences.js
   ===================================================== */

const PROGRAMS = {

  '7day': {
    id: '7day',
    name: '7-дневный старт',
    icon: '🗓',
    description: 'Знакомство с разными видами практики. По одному занятию в день в течение недели.',
    totalDays: 7,
    days: [
      { day: 1, title: 'Знакомство',        sequenceId: 'morning-energy-15' },
      { day: 2, title: 'Гибкость',          sequenceId: 'flexibility-15'    },
      { day: 3, title: 'Сила',              sequenceId: 'strength-20'       },
      { day: 4, title: 'Дыхание',           sequenceId: 'breath-meditate-15' },
      { day: 5, title: 'Баланс',            sequenceId: 'balance-15'        },
      { day: 6, title: 'Раскрытие бёдер',   sequenceId: 'hips-15'           },
      { day: 7, title: 'Глубокий отдых',    sequenceId: 'evening-relax-15'  },
    ],
  },

  'morning': {
    id: 'morning',
    name: 'Утренняя рутина',
    icon: '🌅',
    description: '14 дней утренних практик. Чередуем короткие разминки и полные занятия.',
    totalDays: 14,
    days: [
      { day:  1, title: 'Лёгкое начало',     sequenceId: 'quick-wakeup-7'    },
      { day:  2, title: 'Утро энергии',      sequenceId: 'morning-energy-15' },
      { day:  3, title: 'Быстрая разминка',  sequenceId: 'quick-wakeup-7'    },
      { day:  4, title: 'Утро энергии',      sequenceId: 'morning-energy-15' },
      { day:  5, title: 'Гибкость',          sequenceId: 'flexibility-15'    },
      { day:  6, title: 'Быстрая разминка',  sequenceId: 'quick-wakeup-7'    },
      { day:  7, title: 'Утро энергии',      sequenceId: 'morning-energy-15' },
      { day:  8, title: 'Баланс утра',       sequenceId: 'balance-15'        },
      { day:  9, title: 'Утро энергии',      sequenceId: 'morning-energy-15' },
      { day: 10, title: 'Быстрая разминка',  sequenceId: 'quick-wakeup-7'    },
      { day: 11, title: 'Дыхание',           sequenceId: 'breath-meditate-15' },
      { day: 12, title: 'Сила',              sequenceId: 'strength-20'       },
      { day: 13, title: 'Утро энергии',      sequenceId: 'morning-energy-15' },
      { day: 14, title: 'Финал',             sequenceId: 'backbends-20'      },
    ],
  },

  '30day': {
    id: '30day',
    name: '30-дневный марафон',
    icon: '🏔',
    description: 'Полноценный месяц практики. Все типы упражнений с нарастающей сложностью.',
    totalDays: 30,
    days: [
      // Неделя 1 — знакомство
      { day:  1, title: 'Старт',             sequenceId: 'quick-wakeup-7'    },
      { day:  2, title: 'Утро энергии',      sequenceId: 'morning-energy-15' },
      { day:  3, title: 'Гибкость',          sequenceId: 'flexibility-15'    },
      { day:  4, title: 'Дыхание',           sequenceId: 'breath-meditate-15' },
      { day:  5, title: 'Баланс',            sequenceId: 'balance-15'        },
      { day:  6, title: 'Раскрытие бёдер',   sequenceId: 'hips-15'           },
      { day:  7, title: 'Расслабление',      sequenceId: 'evening-relax-15'  },
      // Неделя 2 — углубление
      { day:  8, title: 'Утро энергии',      sequenceId: 'morning-energy-15' },
      { day:  9, title: 'Сила',              sequenceId: 'strength-20'       },
      { day: 10, title: 'Гибкость',          sequenceId: 'flexibility-15'    },
      { day: 11, title: 'Баланс',            sequenceId: 'balance-15'        },
      { day: 12, title: 'Прогибы',           sequenceId: 'backbends-20'      },
      { day: 13, title: 'Раскрытие бёдер',   sequenceId: 'hips-15'           },
      { day: 14, title: 'Расслабление',      sequenceId: 'evening-relax-15'  },
      // Неделя 3 — глубже
      { day: 15, title: 'Сила',              sequenceId: 'strength-20'       },
      { day: 16, title: 'Утро энергии',      sequenceId: 'morning-energy-15' },
      { day: 17, title: 'Прогибы',           sequenceId: 'backbends-20'      },
      { day: 18, title: 'Бёдра',             sequenceId: 'hips-15'           },
      { day: 19, title: 'Баланс',            sequenceId: 'balance-15'        },
      { day: 20, title: 'Дыхание',           sequenceId: 'breath-meditate-15' },
      { day: 21, title: 'Перед сном',        sequenceId: 'wind-down-10'      },
      // Неделя 4 — мастерство
      { day: 22, title: 'Сила',              sequenceId: 'strength-20'       },
      { day: 23, title: 'Прогибы',           sequenceId: 'backbends-20'      },
      { day: 24, title: 'Гибкость',          sequenceId: 'flexibility-15'    },
      { day: 25, title: 'Баланс',            sequenceId: 'balance-15'        },
      { day: 26, title: 'Сила',              sequenceId: 'strength-20'       },
      { day: 27, title: 'Бёдра',             sequenceId: 'hips-15'           },
      // Финал
      { day: 28, title: 'Дыхание',           sequenceId: 'breath-meditate-15' },
      { day: 29, title: 'Прогибы',           sequenceId: 'backbends-20'      },
      { day: 30, title: 'Глубокий отдых',    sequenceId: 'evening-relax-15'  },
    ],
  },

};

module.exports = { PROGRAMS };
