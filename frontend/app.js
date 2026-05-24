/* =====================================================
   ЙОГА ТРЕКЕР — Основная логика
   ===================================================== */

const API = '';  // пустая строка = тот же хост

// =====================================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// =====================================================
const state = {
  token: null,
  user: null,
  currentTab: 'home',
  currentMonth: new Date(),
  monthSessions: [],
  allStreak: 0,
  allTotal: 0,
  selectedDay: null,      // для модалки календаря
  selectedType: 'general', // тип практики
  timerStartTime: null,    // время старта таймера
  timerInterval: null,     // ID интервала
  timerDuration: 0,        // длительность в секундах
};

// =====================================================
// МОТИВАЦИОННЫЕ ФРАЗЫ (31 штука — одна на каждый день)
// =====================================================
const QUOTES = [
  'Каждый вдох — это новое начало. Каждый выдох — отпускание.',
  'Йога — это путешествие к себе, через себя, к себе.',
  'Тело — твой храм. Береги его, и оно будет служить тебе верно.',
  'Сила приходит не из того, что ты можешь делать. Она приходит из преодоления того, что ты считал невозможным.',
  'Будь там, где ты есть. Иначе ты пропустишь свою жизнь.',
  'Дыши глубоко, двигайся осознанно, живи полностью.',
  'Йога — не о прикосновении к пальцам ног. Это о том, что ты узнаёшь на пути вниз.',
  'Тишина внутри — это твоя истинная сила.',
  'Каждая практика делает тебя немного сильнее, немного спокойнее.',
  'Принимай своё тело там, где оно есть сегодня.',
  'Практика — это не совершенство. Практика — это прогресс.',
  'Соединись с настоящим моментом. Он единственный реальный.',
  'Твой коврик — твоё убежище. Возвращайся к нему снова и снова.',
  'Ум спокоен, когда тело в движении.',
  'Отпусти всё, что не служит тебе. Держи лишь то, что несёт свет.',
  'Каждый день — это возможность начать снова.',
  'Слушай своё тело. Оно знает мудрость, которую разум ещё не постиг.',
  'Движение — это медитация в действии.',
  'Ты не занимаешься йогой — ты становишься йогой.',
  'Мягкость к себе — это тоже практика.',
  'Один шаг в день на коврике меняет всю жизнь.',
  'Равновесие — не состояние, а постоянный выбор.',
  'Труд сегодня — покой завтра.',
  'Позволь себе быть несовершенным. Именно здесь и начинается рост.',
  'Твоё дыхание — якорь в любом шторме.',
  'Нет плохой практики. Есть только та, которую ты пропустил.',
  'Каждое утро — новая страница. Напиши на ней что-то красивое.',
  'Сила — это не напряжение. Сила — это гибкость духа.',
  'Заботься о своём теле. Это единственное место, где тебе жить.',
  'Вдохни уверенность. Выдохни сомнения.',
  'Практика — это любовь. К себе, к жизни, к настоящему моменту.',
];

const DIFF_LABELS = ['', '🟢 Легко', '🟡 Средне', '🟠 Сложно', '🔴 Тяжело'];
const DIFF_COLORS = ['', '#6dbe6d', '#f0c040', '#f09040', '#e05050'];

const AVATARS = ['🧘', '🌸', '🌿', '✨', '🦋', '🌻', '🌙', '⭐', '🍃', '🌊'];

const MONTH_NAMES = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
];
const WEEKDAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

// =====================================================
// ИНИЦИАЛИЗАЦИЯ
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Пытаемся восстановить сессию из localStorage
  state.token = localStorage.getItem('yt_token');
  const savedUser = localStorage.getItem('yt_user');
  if (savedUser) state.user = JSON.parse(savedUser);

  // Инициализируем Telegram WebApp
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#FFFFFF');
  }

  // Проверяем существующий токен
  if (state.token) {
    const ok = await verifyToken();
    if (ok) { showApp(); return; }
  }

  // Автовход через Telegram — только если пользователь явно не вышел
  const forcedLogout = localStorage.getItem('yt_force_auth');
  if (!forcedLogout && window.Telegram?.WebApp?.initData) {
    await authTelegram(window.Telegram.WebApp.initData);
    if (state.token) { showApp(); return; }
  }

  // Показываем экран авторизации
  hideLoading();
  // Показываем кнопки Telegram если мы внутри Telegram
  if (window.Telegram?.WebApp?.initData) {
    const tgBtn = document.getElementById('btn-tg-auth');
    if (tgBtn) tgBtn.style.display = '';
  }
  if (window.Telegram?.WebApp?.requestContact) {
    const phBtn = document.getElementById('btn-phone-auth');
    if (phBtn) phBtn.style.display = '';
  }
  showElement('auth-screen');
});

async function authTelegram(initData) {
  try {
    const res = await fetch(`${API}/api/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData })
    });
    if (res.ok) {
      const data = await res.json();
      saveSession(data.token, data.user);
    }
  } catch (e) {
    console.warn('Telegram auth failed:', e);
  }
}

async function verifyToken() {
  try {
    const res = await apiFetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      state.user = data.user;
      localStorage.setItem('yt_user', JSON.stringify(data.user));
      return true;
    }
  } catch (e) {}
  // Токен невалидный
  clearSession();
  return false;
}

function saveSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('yt_token', token);
  localStorage.setItem('yt_user', JSON.stringify(user));
  localStorage.removeItem('yt_force_auth'); // сбрасываем флаг выхода
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('yt_token');
  localStorage.removeItem('yt_user');
}

// =====================================================
// АВТОРИЗАЦИЯ — БЫСТРЫЙ ВХОД ЧЕРЕЗ TELEGRAM
// =====================================================
async function loginByTelegram() {
  const tg = window.Telegram?.WebApp;
  if (!tg?.initData) { showAuthError('Открой через Telegram'); return; }
  hideAuthError();
  await authTelegram(tg.initData);
  if (state.token) showApp();
  else showAuthError('Ошибка входа через Telegram');
}

// =====================================================
// АВТОРИЗАЦИЯ — ТЕЛЕФОН (Telegram requestContact)
// =====================================================
async function loginByPhone() {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    showAuthError('Открой приложение через Telegram');
    return;
  }

  try {
    tg.requestContact(async (ok, contactData) => {
      if (!ok || !contactData?.contact) {
        showAuthError('Отказано в доступе к номеру');
        return;
      }
      const phone       = contactData.contact.phone_number;
      const telegram_id = contactData.contact.user_id
        ? String(contactData.contact.user_id)
        : (tg.initDataUnsafe?.user?.id ? String(tg.initDataUnsafe.user.id) : null);

      hideAuthError();
      const res = await fetch(`${API}/api/auth/phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, telegram_id })
      });
      const data = await res.json();
      if (res.ok) {
        saveSession(data.token, data.user);
        showApp();
      } else {
        showAuthError(data.error || 'Ошибка входа');
      }
    });
  } catch (e) {
    showAuthError('Ошибка запроса контакта');
  }
}

function showEmailStep() {
  hideElement('auth-step-choose');
  showElement('auth-step-email');
  hideAuthError();
}

function backToChoose() {
  hideElement('auth-step-email');
  hideElement('auth-step-otp');
  showElement('auth-step-choose');
  hideAuthError();
}

// =====================================================
// АВТОРИЗАЦИЯ — EMAIL OTP
// =====================================================
let emailForOtp = '';

async function sendOtp() {
  const email = document.getElementById('auth-email').value.trim();
  if (!email || !email.includes('@')) {
    showAuthError('Введите корректный email');
    return;
  }

  hideAuthError();
  emailForOtp = email;

  try {
    setButtonLoading('.auth-step#auth-step-email .btn-primary', true);
    const res = await fetch(`${API}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (res.ok) {
      hideElement('auth-step-email');
      showElement('auth-step-otp');
    } else {
      showAuthError(data.error || 'Ошибка отправки');
    }
  } catch (e) {
    showAuthError('Ошибка соединения. Проверьте настройки email в .env');
  } finally {
    setButtonLoading('.auth-step#auth-step-email .btn-primary', false);
  }
}

async function verifyOtp() {
  const code = document.getElementById('auth-otp').value.trim();
  if (code.length !== 6) {
    showAuthError('Введите 6-значный код');
    return;
  }

  hideAuthError();

  try {
    const res = await fetch(`${API}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailForOtp, code })
    });
    const data = await res.json();

    if (res.ok) {
      saveSession(data.token, data.user);
      showApp();
    } else {
      showAuthError(data.error || 'Неверный код');
    }
  } catch (e) {
    showAuthError('Ошибка соединения');
  }
}

function backToEmail() {
  hideElement('auth-step-otp');
  showElement('auth-step-email');
  hideAuthError();
}


function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  showElement('auth-error');
}
function hideAuthError() { hideElement('auth-error'); }

function setButtonLoading(selector, loading) {
  const btn = document.querySelector(selector);
  if (btn) btn.textContent = loading ? 'Отправка...' : 'Получить код';
}

// =====================================================
// ЗАПУСК ПРИЛОЖЕНИЯ
// =====================================================
async function showApp() {
  hideLoading();
  hideElement('auth-screen');
  showElement('app');

  // Применяем настройки темы
  applyTheme(state.user?.theme || 'light', state.user?.color_theme || 'pink');

  // Загружаем начальные данные
  await Promise.all([
    loadStreak(),
    loadTodayStatus(),
  ]);

  setupNoteInput();
  renderHomeDateQuote();
  updateNavAvatar();
  restoreTimer();
  applyTimeTheme();
  loadWeekStats();
}

// =====================================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// =====================================================
function switchTab(tab) {
  // Убираем активный класс у всех панелей и кнопок
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  // Показываем нужную панель
  document.getElementById(`tab-${tab}`).classList.remove('hidden');
  document.getElementById(`nav-${tab}`).classList.add('active');
  state.currentTab = tab;

  // Загружаем данные при переключении
  if (tab === 'calendar') loadCalendar();
  if (tab === 'notes')    loadNotes();
  if (tab === 'profile')  loadProfile();
  if (tab === 'practice') loadPracticeTab();
}

// =====================================================
// ВКЛАДКА 1: ГЛАВНАЯ
// =====================================================
function renderHomeDateQuote() {
  const now = new Date();

  // Дата
  const dateStr = now.toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  document.getElementById('home-date').textContent =
    dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  // Приветствие по времени
  const hour = now.getHours();
  let greeting = 'Добрый день!';
  if (hour < 5)  greeting = 'Доброй ночи!';
  else if (hour < 12) greeting = 'Доброе утро!';
  else if (hour < 17) greeting = 'Добрый день!';
  else greeting = 'Добрый вечер!';
  document.getElementById('home-greeting').textContent = greeting;

  // Цитата — по дню месяца
  const quoteIdx = (now.getDate() - 1) % QUOTES.length;
  document.getElementById('quote-text').textContent = QUOTES[quoteIdx];

  // Подпись цитаты — день практики
  const dayLabel = document.getElementById('quote-day-label');
  if (dayLabel) dayLabel.textContent = `День ${now.getDate()}`;
}

async function loadTodayStatus() {
  const today = getTodayStr();
  try {
    const res = await apiFetch(`/api/yoga/sessions/${today.slice(0,4)}/${today.slice(5,7)}`);
    const data = await res.json();
    const todaySession = data.sessions?.find(s => s.date === today);
    updateTodayStatus(todaySession);
  } catch (e) {}
}

function updateTodayStatus(session) {
  const el = document.getElementById('today-log-status');
  if (session) {
    el.textContent = `Отмечено: ${DIFF_LABELS[session.difficulty]}`;
    el.style.color = DIFF_COLORS[session.difficulty];
    // Подсвечиваем активную кнопку
    document.querySelectorAll('.quick-log-card .diff-btn').forEach(btn => {
      btn.classList.remove('active-diff');
    });
    const activeBtn = document.querySelector(`.quick-log-card .diff-${session.difficulty}`);
    if (activeBtn) activeBtn.classList.add('active-diff');
  } else {
    el.textContent = 'Сегодня ещё не отмечено';
    el.style.color = '';
    document.querySelectorAll('.quick-log-card .diff-btn').forEach(btn => {
      btn.classList.remove('active-diff');
    });
  }
}

// =====================================================
// ТАЙМЕР И ТИП ПРАКТИКИ
// =====================================================
function selectType(type) {
  state.selectedType = type;
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.toggle('active-type', btn.dataset.type === type);
  });
}

function startTimer() {
  state.timerStartTime = Date.now();
  state.timerDuration  = 0;
  localStorage.setItem('yt_timer_start', state.timerStartTime);
  localStorage.setItem('yt_timer_type', state.selectedType);

  showElement('timer-running');
  hideElement('timer-idle');
  hideElement('difficulty-card');

  state.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.timerStartTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    const el = document.getElementById('timer-time');
    if (el) el.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  state.timerDuration = Math.floor((Date.now() - state.timerStartTime) / 1000);
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  localStorage.removeItem('yt_timer_start');
  localStorage.removeItem('yt_timer_type');

  showElement('timer-idle');
  hideElement('timer-running');
  showElement('difficulty-card');

  // Обновляем подпись с результатом
  const mins = Math.floor(state.timerDuration / 60);
  const secs = state.timerDuration % 60;
  const label = document.getElementById('difficulty-label');
  if (label) label.textContent = `Практика ${mins}м ${secs}с — как было? 💪`;
}

function restoreTimer() {
  // Восстанавливаем таймер если приложение было закрыто во время практики
  const savedStart = localStorage.getItem('yt_timer_start');
  const savedType  = localStorage.getItem('yt_timer_type');
  if (!savedStart) return;

  state.timerStartTime = parseInt(savedStart);
  if (savedType) {
    state.selectedType = savedType;
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.classList.toggle('active-type', btn.dataset.type === savedType);
    });
  }

  showElement('timer-running');
  hideElement('timer-idle');
  hideElement('difficulty-card');

  state.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.timerStartTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    const el = document.getElementById('timer-time');
    if (el) el.textContent = `${mins}:${secs}`;
  }, 1000);
}

async function quickLog(difficulty) {
  const today    = getTodayStr();
  const type     = state.selectedType || 'general';
  const duration = state.timerDuration || 0;

  try {
    const res = await apiFetch('/api/yoga/sessions', {
      method: 'POST',
      body: JSON.stringify({ date: today, difficulty, type, duration })
    });
    if (res.ok) {
      const data = await res.json();
      updateTodayStatus(data.session);
      await loadStreak();

      // Сбрасываем состояние после логирования
      state.timerDuration = 0;
      const label = document.getElementById('difficulty-label');
      if (label) label.textContent = 'Как прошла практика сегодня?';

      // Начисляем XP и проверяем достижения
      awardXP(difficulty, duration);

      // Обновляем недельный график
      loadWeekStats();

      toast(`Отмечено: ${DIFF_LABELS[difficulty]}`);
    }
  } catch (e) {
    toast('Ошибка сохранения');
  }
}

async function awardXP(difficulty, duration) {
  try {
    const streakRes = await apiFetch('/api/yoga/streak');
    const streakData = await streakRes.json();
    const streak = streakData.streak || 0;

    const res = await apiFetch('/api/progress/award', {
      method: 'POST',
      body: JSON.stringify({ difficulty, duration, streak })
    });
    if (res.ok) {
      checkAchievements();
    }
  } catch (e) {
    console.warn('XP award failed:', e);
  }
}

async function checkAchievements() {
  try {
    const res = await apiFetch('/api/achievements/check', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.newAchievements?.length) {
        data.newAchievements.forEach((ach, i) => {
          setTimeout(() => showAchievementToast(ach), i * 2000);
        });
      }
    }
  } catch (e) {}
}

function showAchievementToast(achievement) {
  const existing = document.querySelector('.achievement-toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'achievement-toast';
  el.innerHTML = `
    <div class="ach-icon">${achievement.icon}</div>
    <div class="ach-info">
      <div class="ach-label">Новое достижение!</div>
      <div class="ach-name">${achievement.name}</div>
      <div class="ach-desc">${achievement.desc}</div>
    </div>
  `;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(120%)';
    setTimeout(() => el.remove(), 400);
  }, 3000);
}

async function loadStreak() {
  try {
    const res = await apiFetch('/api/yoga/streak');
    const data = await res.json();
    state.allStreak = data.streak;
    state.allTotal  = data.total;
    document.getElementById('streak-mini-count').textContent = data.streak;
    document.getElementById('streak-count').textContent = data.streak;
    document.getElementById('total-count').textContent  = data.total;
  } catch (e) {}
}

// =====================================================
// ВКЛАДКА 2: КАЛЕНДАРЬ
// =====================================================
function changeMonth(delta) {
  state.currentMonth = new Date(
    state.currentMonth.getFullYear(),
    state.currentMonth.getMonth() + delta,
    1
  );
  loadCalendar();
}

async function loadCalendar() {
  const year  = state.currentMonth.getFullYear();
  const month = state.currentMonth.getMonth() + 1;

  // Обновляем заголовок
  document.getElementById('cal-month-title').textContent =
    `${MONTH_NAMES[month - 1]} ${year}`;

  // Загружаем стрик
  await loadStreak();

  // Загружаем сессии месяца
  try {
    const res = await apiFetch(`/api/yoga/sessions/${year}/${month}`);
    const data = await res.json();
    state.monthSessions = data.sessions || [];
  } catch (e) {
    state.monthSessions = [];
  }

  renderCalendar(year, month);
}

function renderCalendar(year, month) {
  const grid = document.getElementById('calendar-grid');

  // Первый день недели (0=вс, 1=пн...)
  const firstDay = new Date(year, month - 1, 1).getDay();
  const offset   = firstDay === 0 ? 6 : firstDay - 1; // пн=0
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = getTodayStr();

  // Создаём карту сессий
  const sessionMap = {};
  state.monthSessions.forEach(s => { sessionMap[s.date] = s; });

  let html = `
    <div class="calendar-weekdays">
      ${WEEKDAYS_SHORT.map(d => `<div class="calendar-weekday">${d}</div>`).join('')}
    </div>
    <div class="calendar-days">
  `;

  // Пустые ячейки до первого дня
  for (let i = 0; i < offset; i++) {
    html += `<div class="cal-day empty"></div>`;
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const session = sessionMap[dateStr];
    const isToday = dateStr === today;
    const isFuture = dateStr > today;

    let classes = 'cal-day';
    if (isToday)  classes += ' today';
    if (isFuture) classes += ' future';
    if (session)  classes += ' logged';

    const dotColor = session ? DIFF_COLORS[session.difficulty] : 'transparent';
    const clickAttr = !isFuture ? `onclick="openDayModal('${dateStr}')"` : '';

    html += `
      <div class="${classes}" ${clickAttr}>
        <span class="cal-day-num">${day}</span>
        <span class="cal-day-dot" style="background:${dotColor}"></span>
      </div>
    `;
  }

  html += `</div>`;
  grid.innerHTML = html;
}

function openDayModal(dateStr) {
  state.selectedDay = dateStr;
  const [year, month, day] = dateStr.split('-');
  const date = new Date(dateStr + 'T00:00:00');
  const dateLabel = date.toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  document.getElementById('modal-date-title').textContent =
    dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
  showElement('day-modal');
}

function closeDayModal() {
  hideElement('day-modal');
  state.selectedDay = null;
}

async function logDay(difficulty) {
  if (!state.selectedDay) return;
  closeDayModal();

  try {
    const res = await apiFetch('/api/yoga/sessions', {
      method: 'POST',
      body: JSON.stringify({ date: state.selectedDay, difficulty })
    });
    if (res.ok) {
      await loadCalendar();
      if (state.selectedDay === getTodayStr()) {
        await loadTodayStatus();
      }
      toast(`Сохранено: ${DIFF_LABELS[difficulty]}`);
    }
  } catch (e) {
    toast('Ошибка сохранения');
  }
}

async function deleteDay() {
  if (!state.selectedDay) return;
  const date = state.selectedDay;
  closeDayModal();

  try {
    await apiFetch(`/api/yoga/sessions/${date}`, { method: 'DELETE' });
    await loadCalendar();
    if (date === getTodayStr()) await loadTodayStatus();
    toast('Отметка удалена');
  } catch (e) {
    toast('Ошибка удаления');
  }
}

// =====================================================
// ВКЛАДКА 3: МЫСЛИ
// =====================================================
function setupNoteInput() {
  const input = document.getElementById('note-input');
  const counter = document.getElementById('char-count');
  input.addEventListener('input', () => {
    counter.textContent = `${input.value.length} / 2000`;
    counter.style.color = input.value.length > 1800 ? '#e05050' : '';
  });
}

async function loadNotes() {
  try {
    const res = await apiFetch('/api/notes');
    const data = await res.json();
    renderNotes(data.notes || []);
  } catch (e) {
    renderNotes([]);
  }
}

function renderNotes(notes) {
  const list = document.getElementById('notes-list');
  const empty = document.getElementById('notes-empty');

  // Удаляем только карточки заметок, не трогая notes-empty
  list.querySelectorAll('.note-card').forEach(el => el.remove());

  if (!notes.length) {
    if (empty) empty.classList.remove('hidden');
    return;
  }

  if (empty) empty.classList.add('hidden');

  const html = notes.map(note => `
    <div class="note-card" id="note-${note._id}">
      <div class="note-card-date">${formatDateTime(note.createdAt)}</div>
      <div class="note-card-text">${escapeHtml(note.content)}</div>
      <button class="note-card-delete" onclick="deleteNote('${note._id}')" title="Удалить">✕</button>
    </div>
  `).join('');

  list.insertAdjacentHTML('afterbegin', html);
}

async function saveNote() {
  const input = document.getElementById('note-input');
  const content = input.value.trim();

  if (!content) {
    toast('Напиши что-нибудь 💭');
    return;
  }

  try {
    const res = await apiFetch('/api/notes', {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    if (res.ok) {
      input.value = '';
      document.getElementById('char-count').textContent = '0 / 2000';
      await loadNotes();
      toast('Мысль сохранена ✓');
    }
  } catch (e) {
    toast('Ошибка сохранения');
  }
}

async function deleteNote(id) {
  try {
    const res = await apiFetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const el = document.getElementById(`note-${id}`);
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateX(20px)';
        el.style.transition = 'all 0.2s';
        setTimeout(() => { el.remove(); checkEmptyNotes(); }, 200);
      }
    }
  } catch (e) {
    toast('Ошибка удаления');
  }
}

function checkEmptyNotes() {
  const list = document.getElementById('notes-list');
  if (!list.querySelector('.note-card')) {
    const empty = document.getElementById('notes-empty');
    empty.classList.remove('hidden');
    list.appendChild(empty);
  }
}

// =====================================================
// ВКЛАДКА 4: ПРОФИЛЬ + ПРОГРЕСС + ДОСТИЖЕНИЯ
// =====================================================
async function loadProgress() {
  try {
    const res  = await apiFetch('/api/progress');
    const data = await res.json();
    const p    = data.progress;
    if (!p) return;

    document.getElementById('level-badge').textContent = `⭐ Ур.${p.level}`;
    document.getElementById('level-name').textContent  = p.name;
    document.getElementById('level-xp').textContent    = `${p.xp} XP`;

    if (p.isMax) {
      document.getElementById('xp-bar-fill').style.width  = '100%';
      document.getElementById('xp-bar-label').textContent = '🏆 Максимальный уровень!';
    } else {
      const pct = Math.min(100, Math.round((p.xpCurrent / p.xpNeeded) * 100));
      document.getElementById('xp-bar-fill').style.width  = `${pct}%`;
      document.getElementById('xp-bar-label').textContent =
        `До «${p.nextName}»: ${p.xpToNext} XP`;
    }
  } catch (e) {}
}

async function loadAchievements() {
  try {
    const res  = await apiFetch('/api/achievements');
    const data = await res.json();
    renderAchievements(data.achievements || []);
  } catch (e) {}
}

function renderAchievements(achievements) {
  const grid = document.getElementById('achievements-grid');
  if (!grid) return;

  const unlocked = achievements.filter(a => a.unlocked).length;
  const total    = achievements.length;

  grid.innerHTML = `
    <div class="ach-counter">${unlocked} / ${total} открыто</div>
    <div class="ach-items">
      ${achievements.map(a => `
        <div class="ach-item ${a.unlocked ? 'unlocked' : 'locked'}" title="${a.name}: ${a.desc}">
          <div class="ach-item-icon">${a.icon}</div>
          <div class="ach-item-name">${a.name}</div>
          ${a.unlocked ? '' : '<div class="ach-lock">🔒</div>'}
        </div>
      `).join('')}
    </div>
  `;
}

function loadProfile() {
  const u = state.user;
  if (!u) return;

  document.getElementById('profile-avatar-display').textContent = u.avatar || '🧘';
  document.getElementById('profile-name-display').textContent   = u.name || 'Пользователь';
  document.getElementById('profile-name-input').value           = u.name || '';

  // Загружаем прогресс и достижения
  loadProgress();
  loadAchievements();

  // Аватары
  const avatarGrid = document.getElementById('avatar-grid');
  avatarGrid.innerHTML = AVATARS.map(av => `
    <button class="avatar-btn ${av === u.avatar ? 'selected' : ''}"
            onclick="selectAvatar('${av}')">${av}</button>
  `).join('');

  // Кнопки темы
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => btn.classList.remove('active-theme'));
  const themeBtn = document.getElementById(`btn-${u.theme || 'light'}`);
  if (themeBtn) themeBtn.classList.add('active-theme');

  // Цветовые кнопки
  document.querySelectorAll('.color-theme-btn').forEach(btn => btn.classList.remove('active-color'));
  const colorBtn = document.querySelector(`.theme-${u.color_theme || 'pink'}`);
  if (colorBtn) colorBtn.classList.add('active-color');
  loadReminder();
}
function loadReminder() {
  const u = state.user;
  if (!u) return;
  const hasTelegram = !!u.telegram_id;
  const noteEl = document.getElementById('reminder-tg-only');
  const ctrlEl = document.getElementById('reminder-controls');
  if (!noteEl || !ctrlEl) return;
  if (!hasTelegram) {
    noteEl.classList.remove('hidden');
    ctrlEl.classList.add('hidden');
    return;
  }
  noteEl.classList.add('hidden');
  ctrlEl.classList.remove('hidden');
  const timeInput = document.getElementById('reminder-time');
  if (timeInput && u.reminder_time) {
    const [hh, mm] = u.reminder_time.split(':');
    const d = new Date();
    d.setUTCHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
    timeInput.value =
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  document.getElementById('reminder-off-btn')?.classList.toggle('active-theme', !u.reminder_on);
  document.getElementById('reminder-on-btn')?.classList.toggle('active-theme', !!u.reminder_on);
}

async function saveReminder() {
  const timeInput = document.getElementById('reminder-time');
  if (!timeInput?.value) return;
  const [hh, mm] = timeInput.value.split(':');
  const d = new Date();
  d.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
  const utcTime =
    `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  await updateProfile({ reminder_time: utcTime });
}

async function setReminderOn(on) {
  await updateProfile({ reminder_on: on });
}

async function selectAvatar(avatar) {
  await updateProfile({ avatar });
}

async function saveName() {
  const name = document.getElementById('profile-name-input').value.trim();
  if (!name) { toast('Введи имя'); return; }
  await updateProfile({ name });
}

async function setTheme(theme) {
  await updateProfile({ theme });
  applyTheme(theme, state.user?.color_theme || 'pink');
}

async function setColorTheme(colorTheme) {
  await updateProfile({ color_theme: colorTheme });
  applyTheme(state.user?.theme || 'light', colorTheme);
}

async function updateProfile(data) {
  try {
    const res = await apiFetch('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const result = await res.json();
      state.user = result.user;
      localStorage.setItem('yt_user', JSON.stringify(result.user));
      loadProfile();
      updateNavAvatar();
      toast('Сохранено ✓');
    }
  } catch (e) {
    toast('Ошибка сохранения');
  }
}

function applyTheme(theme, colorTheme) {
  const body = document.body;

  // Убираем все классы тем
  body.classList.remove('theme-dark', 'color-blue', 'color-grey', 'color-purple');

  if (theme === 'dark') body.classList.add('theme-dark');
  if (colorTheme !== 'pink') body.classList.add(`color-${colorTheme}`);
}

function updateNavAvatar() {
  const avatar = state.user?.avatar || '🧘';
  document.getElementById('nav-avatar').textContent = avatar;
  document.getElementById('profile-avatar-display').textContent = avatar;
}

function logout() {
  if (!confirm('Выйти из аккаунта?')) return;
  clearSession();
  localStorage.setItem('yt_force_auth', '1'); // блокируем автовход
  location.reload();
}

// =====================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =====================================================
async function apiFetch(path, options = {}) {
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.token}`,
      ...(options.headers || {})
    }
  });
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit'
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showElement(id)  { document.getElementById(id)?.classList.remove('hidden'); }
function hideElement(id)  { document.getElementById(id)?.classList.add('hidden'); }
function hideLoading()    { hideElement('loading-screen'); }

// =====================================================
// ВКЛАДКА 5: ПРАКТИКИ — ДЫХАНИЕ + ПРОГРАММЫ
// =====================================================

const BREATHING = {
  '478':      { name: '4-7-8',       cycles: 4, phases: [{ l:'Вдох',    s:4 },{ l:'Задержи', s:7 },{ l:'Выдох',    s:8 }] },
  'box':      { name: 'Коробочное',  cycles: 4, phases: [{ l:'Вдох',    s:4 },{ l:'Задержи', s:4 },{ l:'Выдох',    s:4 },{ l:'Задержи', s:4 }] },
  'deep':     { name: 'Глубокое',    cycles: 5, phases: [{ l:'Вдох',    s:5 },{ l:'Выдох',   s:5 }] },
  'energize': { name: 'Энергия',     cycles: 6, phases: [{ l:'Вдох',    s:3 },{ l:'Выдох',   s:2 }] },
};

let breathingState = {
  active: false, technique: null,
  cycle: 0, phaseIdx: 0,
  countdown: 0, timer: null,
};

function loadPracticeTab() {
  loadPrograms();
  loadPoses();
  setupPosesSearch();
}

function startBreathing(key) {
  const tech = BREATHING[key];
  if (!tech) return;

  breathingState = { active: true, technique: key, cycle: 1, phaseIdx: 0, countdown: tech.phases[0].s, timer: null };

  hideElement('breathing-choose');
  showElement('breathing-active');

  document.getElementById('breathing-title').textContent = tech.name;
  document.getElementById('breathing-total').textContent = tech.cycles;
  document.getElementById('breathing-cycle').textContent = 1;

  runBreathingPhase();
}

function runBreathingPhase() {
  const tech  = BREATHING[breathingState.technique];
  const phase = tech.phases[breathingState.phaseIdx];

  document.getElementById('breathing-phase').textContent     = phase.l;
  document.getElementById('breathing-countdown').textContent = phase.s;
  breathingState.countdown = phase.s;

  // Анимация круга
  const circle = document.getElementById('breathing-circle');
  circle.className = 'breathing-circle';
  void circle.offsetWidth; // reflow
  if (phase.l === 'Вдох')    circle.classList.add('breath-in');
  else if (phase.l === 'Выдох') circle.classList.add('breath-out');
  else                          circle.classList.add('breath-hold');

  breathingState.timer = setInterval(() => {
    breathingState.countdown--;
    const el = document.getElementById('breathing-countdown');
    if (el) el.textContent = breathingState.countdown;

    if (breathingState.countdown <= 0) {
      clearInterval(breathingState.timer);
      nextBreathingPhase();
    }
  }, 1000);
}

function nextBreathingPhase() {
  if (!breathingState.active) return;
  const tech = BREATHING[breathingState.technique];

  breathingState.phaseIdx++;
  if (breathingState.phaseIdx >= tech.phases.length) {
    // Цикл завершён
    breathingState.phaseIdx = 0;
    if (breathingState.cycle >= tech.cycles) {
      finishBreathing();
      return;
    }
    breathingState.cycle++;
    document.getElementById('breathing-cycle').textContent = breathingState.cycle;
  }
  runBreathingPhase();
}

function finishBreathing() {
  clearInterval(breathingState.timer);
  breathingState.active = false;

  const circle = document.getElementById('breathing-circle');
  if (circle) { circle.className = 'breathing-circle'; }
  document.getElementById('breathing-phase').textContent     = '✅ Готово!';
  document.getElementById('breathing-countdown').textContent = '';

  // Начисляем XP за дыхание
  awardXP(1, 0);
  toast('Дыхательное упражнение завершено! +10 XP 💨');

  setTimeout(() => stopBreathing(), 2000);
}

function stopBreathing() {
  clearInterval(breathingState.timer);
  breathingState.active = false;

  const circle = document.getElementById('breathing-circle');
  if (circle) circle.className = 'breathing-circle';

  hideElement('breathing-active');
  showElement('breathing-choose');
}

// ---- ПРОГРАММЫ ----
async function loadPrograms() {
  try {
    const res  = await apiFetch('/api/programs');
    const data = await res.json();
    renderPrograms(data.programs || []);
  } catch (e) {
    document.getElementById('programs-list').innerHTML =
      '<p style="color:var(--text-muted);font-size:13px;text-align:center">Ошибка загрузки</p>';
  }
}

function renderPrograms(programs) {
  const list = document.getElementById('programs-list');
  if (!list) return;

  list.innerHTML = programs.map(p => {
    const pct = p.totalDays > 0 ? Math.round((p.daysDone / p.totalDays) * 100) : 0;

    return `
      <div class="program-card card" onclick="openProgramDetail('${p.id}')">
        <div class="program-top">
          <span class="program-icon">${p.icon}</span>
          <div class="program-info">
            <div class="program-name">${p.name}</div>
            <div class="program-days">${p.totalDays} дней · ${p.daysDone} пройдено</div>
          </div>
          ${p.completed
            ? '<span class="program-done-badge">✅</span>'
            : '<span class="program-arrow">›</span>'}
        </div>
        ${p.active || p.daysDone > 0 ? `
          <div class="program-progress-wrap">
            <div class="program-progress-fill" style="width:${pct}%"></div>
          </div>
          <div class="program-progress-label">${p.daysDone} из ${p.totalDays} дней · ${pct}%</div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// =====================================================
// ДИНАМИЧЕСКАЯ ТЕМА ПО ВРЕМЕНИ СУТОК
// =====================================================
function applyTimeTheme() {
  const hour = new Date().getHours();
  const body = document.body;
  body.classList.remove('time-morning', 'time-day', 'time-evening', 'time-night');

  if      (hour >= 5  && hour < 12) body.classList.add('time-morning');
  else if (hour >= 12 && hour < 17) body.classList.add('time-day');
  else if (hour >= 17 && hour < 22) body.classList.add('time-evening');
  else                               body.classList.add('time-night');
}

// =====================================================
// НЕДЕЛЬНАЯ СТАТИСТИКА (кастомный бар-чарт без Chart.js)
// =====================================================
async function loadWeekStats() {
  try {
    const res  = await apiFetch('/api/stats/weekly');
    if (!res.ok) return;
    const data = await res.json();
    renderWeekBars(data.weekly || []);
  } catch (e) {}
}

function renderWeekBars(weekly) {
  const barsEl   = document.getElementById('week-bars');
  const labelsEl = document.getElementById('week-days-labels');
  const countEl  = document.getElementById('week-practiced-count');
  if (!barsEl || !labelsEl) return;

  const DAY_SHORT = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  const DIFF_BAR_COLORS = ['', '#6dbe6d','#f0c040','#f09040','#e05050'];

  const practiced = weekly.filter(d => d.practiced).length;
  if (countEl) countEl.textContent = `${practiced} из 7 дней`;

  barsEl.innerHTML = weekly.map((day, i) => {
    const color  = day.practiced ? DIFF_BAR_COLORS[day.difficulty] : 'var(--surface-2)';
    // Высота бара: от 20% до 100% в зависимости от длительности (если есть), иначе фиксированная
    const heightPct = day.practiced
      ? (day.duration > 0 ? Math.min(100, 20 + Math.floor(day.duration / 36)) : 60)
      : 15;

    return `
      <div class="week-bar-wrap">
        <div class="week-bar" style="height:${heightPct}%; background:${color}; ${day.practiced ? `box-shadow: 0 4px 12px ${color}88` : ''}">
          ${day.practiced ? '<div class="week-bar-shine"></div>' : ''}
        </div>
      </div>
    `;
  }).join('');

  labelsEl.innerHTML = weekly.map(day => {
    const d       = new Date(day.date + 'T00:00:00');
    const isToday = day.date === getTodayStr();
    return `<div class="week-day-label ${isToday ? 'today-label' : ''}">${DAY_SHORT[d.getDay()]}</div>`;
  }).join('');
}

// Обновляем статистику после каждой записи
const _origQuickLog = quickLog;

function toast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

// =====================================================
// БИБЛИОТЕКА АСАН
// =====================================================
const posesState = {
  all:           [],
  filter:        { level: '', effect: '', favorites: false },
  searchQuery:   '',
  currentPose:   null,
  searchSetup:   false,
};

const LEVEL_LABELS = { 1: '🌱 Новичок', 2: '🌿 Средний', 3: '🌳 Продвинутый' };
const EFFECT_LABELS = {
  energy:      '⚡ Энергия',
  relax:       '🌙 Расслабление',
  sleep:       '💤 Сон',
  strength:    '💪 Сила',
  flexibility: '🦋 Гибкость',
  grounding:   '🌍 Заземление',
  focus:       '🎯 Фокус',
};
const CATEGORY_LABELS = {
  standing:     'Стоя',
  seated:       'Сидя',
  prone:        'На животе',
  supine:       'Лёжа на спине',
  inverted:     'Перевёрнутые',
  balance:      'Баланс',
  restorative:  'Восстановит.',
};
const MUSCLE_LABELS = {
  full_body:  'Всё тело',
  back:       'Спина',
  legs:       'Ноги',
  arms:       'Руки',
  core:       'Кор',
  hips:       'Бёдра',
  shoulders:  'Плечи',
  balance:    'Баланс',
};

async function loadPoses() {
  const grid    = document.getElementById('poses-grid');
  const countEl = document.getElementById('poses-count');
  if (!grid) return;

  grid.innerHTML = '<div class="poses-loading">Загружаем библиотеку...</div>';

  try {
    const endpoint = posesState.filter.favorites
      ? '/api/poses/favorites'
      : buildPosesQuery();
    const res  = await apiFetch(endpoint);
    const data = await res.json();
    posesState.all = data.poses || [];
    renderPoses();
  } catch (e) {
    grid.innerHTML = '<div class="poses-loading">Ошибка загрузки</div>';
    if (countEl) countEl.textContent = '';
  }
}

function buildPosesQuery() {
  const params = new URLSearchParams();
  if (posesState.filter.level)  params.set('level',  posesState.filter.level);
  if (posesState.filter.effect) params.set('effect', posesState.filter.effect);
  if (posesState.searchQuery)   params.set('search', posesState.searchQuery);
  const qs = params.toString();
  return '/api/poses' + (qs ? '?' + qs : '');
}

function renderPoses() {
  const grid    = document.getElementById('poses-grid');
  const countEl = document.getElementById('poses-count');
  if (!grid) return;

  const list = posesState.all;
  if (countEl) {
    if (posesState.filter.favorites) {
      countEl.textContent = list.length ? `⭐ Избранные: ${list.length}` : '⭐ Пусто — добавляй позы из карточек';
    } else {
      countEl.textContent = `Найдено: ${list.length}`;
    }
  }

  if (!list.length) {
    grid.innerHTML = '<div class="poses-empty">Ничего не найдено 🌸<br><small>Попробуй сбросить фильтры</small></div>';
    return;
  }

  grid.innerHTML = list.map(p => `
    <button class="pose-card" onclick="openPoseModal('${p.id}')">
      <div class="pose-card-fav ${p.favorite ? 'is-fav' : ''}">${p.favorite ? '★' : ''}</div>
      <div class="pose-card-svg">${getSilhouette(p.silhouette)}</div>
      <div class="pose-card-name">${escapeHtml(p.name_ru)}</div>
      <div class="pose-card-sanskrit">${escapeHtml(p.sanskrit)}</div>
      <div class="pose-card-meta">
        <span class="pose-level-dot level-${p.level}"></span>
        <span class="pose-meta-text">${LEVEL_LABELS[p.level] || ''}</span>
      </div>
    </button>
  `).join('');
}

function setupPosesSearch() {
  if (posesState.searchSetup) return;
  posesState.searchSetup = true;

  // Поиск
  const input = document.getElementById('poses-search');
  if (input) {
    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        posesState.searchQuery       = input.value.trim();
        posesState.filter.favorites  = false;
        syncFilterChips();
        loadPoses();
      }, 300);
    });
  }

  // Чипы фильтров
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      const value  = chip.dataset.value;

      if (filter === 'favorites') {
        posesState.filter.favorites = !posesState.filter.favorites;
        if (posesState.filter.favorites) {
          posesState.filter.level  = '';
          posesState.filter.effect = '';
          posesState.searchQuery   = '';
          const si = document.getElementById('poses-search');
          if (si) si.value = '';
        }
      } else {
        posesState.filter[filter]   = value;
        posesState.filter.favorites = false;
      }

      syncFilterChips();
      loadPoses();
    });
  });
}

function syncFilterChips() {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    const filter = chip.dataset.filter;
    const value  = chip.dataset.value;
    let active = false;
    if (filter === 'favorites') active = posesState.filter.favorites;
    else                        active = posesState.filter[filter] === value;
    chip.classList.toggle('active', active);
  });
}

async function openPoseModal(poseId) {
  try {
    const res  = await apiFetch(`/api/poses/${poseId}`);
    if (!res.ok) { toast('Не удалось загрузить позу'); return; }
    const data = await res.json();
    const pose = data.pose;
    posesState.currentPose = pose;

    // SVG
    const svgEl = document.getElementById('pose-modal-svg');
    if (svgEl) svgEl.innerHTML = getSilhouette(pose.silhouette);

    // Заголовки
    document.getElementById('pose-modal-name').textContent     = pose.name_ru;
    document.getElementById('pose-modal-sanskrit').textContent =
      pose.name_full ? `${pose.sanskrit} · ${pose.name_full}` : pose.sanskrit;

    // Избранное
    const favBtn = document.getElementById('pose-fav-btn');
    favBtn.textContent = pose.favorite ? '★' : '☆';
    favBtn.classList.toggle('is-fav', !!pose.favorite);

    // Бейджи
    document.getElementById('pose-modal-badges').innerHTML = `
      <span class="badge badge-level level-${pose.level}">${LEVEL_LABELS[pose.level]}</span>
      <span class="badge">${EFFECT_LABELS[pose.effect] || pose.effect}</span>
      <span class="badge">${CATEGORY_LABELS[pose.category] || pose.category}</span>
      <span class="badge">${MUSCLE_LABELS[pose.muscle_group] || pose.muscle_group}</span>
      <span class="badge">⏱ ${formatDurationShort(pose.duration_sec)}</span>
    `;

    // Описание
    document.getElementById('pose-modal-desc').textContent = pose.description || '';

    // Шаги
    const steps = pose.steps || [];
    document.getElementById('pose-steps').innerHTML =
      steps.map(s => `<li>${escapeHtml(s)}</li>`).join('');

    // Польза
    const benefits = pose.benefits || [];
    document.getElementById('pose-benefits').innerHTML =
      benefits.map(b => `<li>${escapeHtml(b)}</li>`).join('');

    // Противопоказания
    const contra = pose.contraindications || [];
    document.getElementById('pose-contra').innerHTML =
      contra.length
        ? contra.map(c => `<li>${escapeHtml(c)}</li>`).join('')
        : '<li>Нет существенных</li>';

    // Сброс скролла модалки наверх
    const box = document.querySelector('.pose-modal-box');
    if (box) box.scrollTop = 0;

    showElement('pose-modal');
  } catch (e) {
    toast('Ошибка загрузки позы');
  }
}

function closePoseModal() {
  hideElement('pose-modal');
  posesState.currentPose = null;
}

async function togglePoseFav() {
  const p = posesState.currentPose;
  if (!p) return;

  const willBeFav = !p.favorite;
  const btn = document.getElementById('pose-fav-btn');
  btn.textContent = willBeFav ? '★' : '☆';
  btn.classList.toggle('is-fav', willBeFav);
  p.favorite = willBeFav;

  try {
    const res = await apiFetch(`/api/poses/${p.id}/favorite`, {
      method: willBeFav ? 'POST' : 'DELETE'
    });
    if (!res.ok) throw new Error('fail');

    // Обновляем карточку в списке
    const card = document.querySelector(`.pose-card[onclick*="${p.id}"] .pose-card-fav`);
    if (card) {
      card.classList.toggle('is-fav', willBeFav);
      card.textContent = willBeFav ? '★' : '';
    }
    // Меняем флаг и в массиве
    const item = posesState.all.find(x => x.id === p.id);
    if (item) item.favorite = willBeFav;

    toast(willBeFav ? 'В избранном ★' : 'Убрано из избранного');
  } catch (e) {
    // откат
    btn.textContent = !willBeFav ? '★' : '☆';
    btn.classList.toggle('is-fav', !willBeFav);
    p.favorite = !willBeFav;
    toast('Ошибка');
  }
}

function formatDurationShort(sec) {
  if (!sec) return '—';
  if (sec >= 60) return `${Math.round(sec / 60)} мин`;
  return `${sec} сек`;
}

// =====================================================
// ЭКРАН ПРОГРАММЫ
// =====================================================
const programState = {
  currentProgram: null,
  currentDayData: null,
};

async function openProgramDetail(programId) {
  try {
    // На случай если программа ещё не начата — стартуем её (best effort)
    try {
      await apiFetch('/api/programs/start', {
        method: 'POST',
        body: JSON.stringify({ programId })
      });
    } catch (e) { /* не критично */ }

    const res  = await apiFetch(`/api/programs/${programId}`);
    if (!res.ok) { toast('Не удалось открыть программу'); return; }
    const data = await res.json();
    const p    = data.program;
    programState.currentProgram = p;

    document.getElementById('program-detail-title').textContent = p.name;
    document.getElementById('program-hero-icon').textContent    = p.icon || '🗓';
    document.getElementById('program-hero-name').textContent    = p.name;
    document.getElementById('program-hero-desc').textContent    = p.description || '';

    const pct = p.totalDays ? Math.round((p.daysDone / p.totalDays) * 100) : 0;
    document.getElementById('program-hero-bar-fill').style.width = pct + '%';
    document.getElementById('program-hero-progress-label').textContent =
      `${p.daysDone} из ${p.totalDays} дней · ${pct}%`;

    const list = document.getElementById('program-days-list');
    list.innerHTML = p.days.map(d => {
      const status = d.completed ? 'done' : (d.current ? 'current' : 'locked');
      const ico    = d.completed ? '✓' : (d.current ? '▶' : d.day);
      const dur    = d.duration_min ? `~ ${d.duration_min} мин` : '';
      const cls    = `program-day program-day-${status}`;
      const clickable = !d.completed || d.current;
      const click  = `onclick="openDayPreview('${p.id}', ${d.day})"`;
      return `
        <button class="${cls}" ${click}>
          <div class="program-day-num">
            <span class="program-day-num-circle">${ico}</span>
            <span class="program-day-label">День ${d.day}</span>
          </div>
          <div class="program-day-info">
            <div class="program-day-title">${escapeHtml(d.title)}</div>
            <div class="program-day-meta">${escapeHtml(d.sequenceName)} · ${dur} · ${d.posesCount} поз</div>
          </div>
          <div class="program-day-arrow">${d.completed ? '' : '›'}</div>
        </button>
      `;
    }).join('');

    showElement('program-detail-screen');
    document.body.classList.add('no-scroll');
  } catch (e) {
    toast('Ошибка');
  }
}

function closeProgramDetail() {
  hideElement('program-detail-screen');
  document.body.classList.remove('no-scroll');
  programState.currentProgram = null;
  loadPrograms();
}

// =====================================================
// ПРЕВЬЮ ДНЯ
// =====================================================
async function openDayPreview(programId, dayNum) {
  try {
    const res = await apiFetch(`/api/programs/${programId}/day/${dayNum}`);
    if (!res.ok) { toast('Не удалось открыть день'); return; }
    const data = await res.json();
    programState.currentDayData = data;

    document.getElementById('day-preview-header').textContent = `${data.programName}`;
    document.getElementById('day-preview-day-num').textContent = `День ${data.day}`;
    document.getElementById('day-preview-title').textContent   = data.title;
    document.getElementById('day-preview-duration').textContent =
      `~ ${data.sequence.duration_min} мин`;
    document.getElementById('day-preview-count').textContent =
      `${data.sequence.posesCount} поз`;
    document.getElementById('day-preview-desc').textContent = data.sequence.description || '';

    // Кнопка
    const btn = document.getElementById('btn-start-day');
    btn.textContent = data.completed ? '🔁 Пройти снова' : '▶ Начать практику';

    // Список поз
    const list = document.getElementById('day-preview-poses');
    list.innerHTML = data.poses.map((p, i) => `
      <div class="day-pose-row">
        <div class="day-pose-num">${i + 1}</div>
        <div class="day-pose-svg">${getSilhouette(p.silhouette)}</div>
        <div class="day-pose-info">
          <div class="day-pose-name">${escapeHtml(p.name_ru)}${p.side ? `<span class="day-pose-side"> · ${p.side === 'right' ? 'право' : 'лево'}</span>` : ''}</div>
          <div class="day-pose-sanskrit">${escapeHtml(p.sanskrit)}</div>
        </div>
        <div class="day-pose-time">${formatTime(p.duration_sec)}</div>
      </div>
    `).join('');

    showElement('day-preview-screen');
  } catch (e) {
    toast('Ошибка');
  }
}

function closeDayPreview() {
  hideElement('day-preview-screen');
  programState.currentDayData = null;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}с`;
  if (s === 0) return `${m}м`;
  return `${m}м ${s}с`;
}

// =====================================================
// ПЛЕЕР ПОСЛЕДОВАТЕЛЬНОСТИ
// =====================================================
const playerState = {
  active:        false,
  programId:     null,
  dayNum:        null,
  programName:   '',
  dayTitle:      '',
  sequenceData:  null,
  poses:         [],
  currentIdx:    0,
  remainingSec:  0,
  paused:        false,
  intervalId:    null,
  betweenTimer:  null,
  countdownTimer: null,
  startedAt:     null,
  totalElapsed:  0,
};

function startSequencePlayer() {
  const data = programState.currentDayData;
  if (!data || !data.poses?.length) { toast('Нет данных дня'); return; }

  playerState.active        = true;
  playerState.programId     = programState.currentProgram?.id;
  playerState.dayNum        = data.day;
  playerState.programName   = data.programName;
  playerState.dayTitle      = data.title;
  playerState.sequenceData  = data.sequence;
  playerState.poses         = data.poses;
  playerState.currentIdx    = 0;
  playerState.paused        = false;
  playerState.startedAt     = Date.now();
  playerState.totalElapsed  = 0;

  hideElement('day-preview-screen');
  hideElement('program-detail-screen');
  hideElement('player-complete');
  hideElement('player-quit-confirm');
  showElement('sequence-player');
  document.body.classList.add('no-scroll');

  // Telegram WebApp: расширить и закрыть подтверждение
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.enableClosingConfirmation?.();
  }

  // Отсчёт 3-2-1
  runCountdown(3);
}

function runCountdown(from) {
  const elem = document.getElementById('player-countdown');
  const numEl = document.getElementById('player-countdown-num');
  showElement('player-countdown');

  let n = from;
  numEl.textContent = n;

  playerState.countdownTimer = setInterval(() => {
    n--;
    if (n > 0) {
      numEl.textContent = n;
      hapticTick();
    } else {
      clearInterval(playerState.countdownTimer);
      playerState.countdownTimer = null;
      hideElement('player-countdown');
      runPose(0);
    }
  }, 1000);
}

function runPose(idx) {
  if (!playerState.active) return;
  if (idx >= playerState.poses.length) { showCompleteScreen(); return; }

  playerState.currentIdx = idx;
  const pose = playerState.poses[idx];

  // SVG
  document.getElementById('player-pose-svg').innerHTML = getSilhouette(pose.silhouette);

  // Названия
  document.getElementById('player-pose-name').textContent = pose.name_ru;
  document.getElementById('player-pose-sanskrit').textContent = pose.sanskrit || '';

  // Сторона (если есть)
  const sideEl = document.getElementById('player-pose-side');
  if (pose.side) {
    sideEl.textContent = pose.side === 'right' ? '› Правая сторона' : '‹ Левая сторона';
    sideEl.classList.remove('hidden');
  } else {
    sideEl.classList.add('hidden');
  }

  // Подсказка о следующей позе
  const next = playerState.poses[idx + 1];
  const nextHint = document.getElementById('player-next-hint');
  if (next) {
    nextHint.textContent = `Далее: ${next.name_ru}${next.side ? ' (' + (next.side === 'right' ? 'право' : 'лево') + ')' : ''}`;
  } else {
    nextHint.textContent = 'Последняя поза';
  }

  // Прогресс
  updatePlayerProgress();

  // Таймер
  playerState.remainingSec = pose.duration_sec;
  updateTimerDisplay();
  hapticTick();

  // Запускаем интервал
  if (playerState.intervalId) clearInterval(playerState.intervalId);
  playerState.intervalId = setInterval(() => {
    if (playerState.paused) return;
    playerState.remainingSec--;
    playerState.totalElapsed++;
    updateTimerDisplay();
    if (playerState.remainingSec <= 0) {
      clearInterval(playerState.intervalId);
      playerState.intervalId = null;
      hapticTick();
      goToNextPose();
    }
  }, 1000);
}

function goToNextPose() {
  // Короткая пауза между позами
  if (playerState.currentIdx + 1 >= playerState.poses.length) {
    showCompleteScreen();
    return;
  }
  // Можно сделать короткий "переход", но пока сразу к следующей
  runPose(playerState.currentIdx + 1);
}

function updateTimerDisplay() {
  const m = Math.floor(playerState.remainingSec / 60);
  const s = playerState.remainingSec % 60;
  document.getElementById('player-timer').textContent =
    `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updatePlayerProgress() {
  const total = playerState.poses.length;
  const cur   = playerState.currentIdx + 1;
  const pct   = (cur / total) * 100;
  document.getElementById('player-progress').style.width = pct + '%';
  document.getElementById('player-counter').textContent = `${cur} / ${total}`;
}

function togglePause() {
  playerState.paused = !playerState.paused;
  const btn = document.getElementById('player-btn-pause');
  btn.textContent = playerState.paused ? '▶' : '⏸';
  hapticTick();
}

function prevPose() {
  if (playerState.currentIdx > 0) {
    if (playerState.intervalId) clearInterval(playerState.intervalId);
    runPose(playerState.currentIdx - 1);
  }
}

function nextPose() {
  if (playerState.intervalId) clearInterval(playerState.intervalId);
  if (playerState.currentIdx + 1 >= playerState.poses.length) {
    showCompleteScreen();
  } else {
    runPose(playerState.currentIdx + 1);
  }
}

function showCompleteScreen() {
  // Останавливаем таймеры
  if (playerState.intervalId) { clearInterval(playerState.intervalId); playerState.intervalId = null; }

  const duration = playerState.totalElapsed;
  const mins     = Math.max(1, Math.round(duration / 60));

  document.getElementById('complete-duration').textContent = `${mins} мин`;
  document.getElementById('complete-poses-count').textContent = playerState.poses.length;
  document.getElementById('complete-sub').textContent =
    `${playerState.programName} · ${playerState.dayTitle}`;

  showElement('player-complete');
  hapticTick();
  hapticTick();
}

async function finishSequence(difficulty) {
  if (!playerState.active) return;
  const duration = Math.max(playerState.totalElapsed, 30); // минимум 30 сек

  try {
    const res = await apiFetch(
      `/api/programs/${playerState.programId}/day/${playerState.dayNum}/complete`,
      {
        method: 'POST',
        body: JSON.stringify({ duration_sec: duration, difficulty })
      }
    );
    if (res.ok) {
      const data = await res.json();
      toast(`День ${playerState.dayNum} засчитан 🎉`);

      // Начисляем XP и обновляем данные
      try { await awardXP(difficulty, duration); } catch (e) {}

      // Закрываем плеер
      cleanupPlayer();

      // Обновляем данные
      await loadStreak();
      await loadTodayStatus();
      loadWeekStats();

      // Если программа полностью пройдена — поздравляем
      if (data.completed) {
        toast(`Программа "${playerState.programName}" завершена! 🏆`);
      }

      // Возвращаемся к экрану программы (обновим его)
      if (playerState.programId) {
        setTimeout(() => openProgramDetail(playerState.programId), 300);
      }
    } else {
      toast('Ошибка сохранения');
    }
  } catch (e) {
    toast('Ошибка соединения');
  }
}

function askQuitPlayer() {
  playerState.paused = true;
  showElement('player-quit-confirm');
}

function cancelQuit() {
  hideElement('player-quit-confirm');
  playerState.paused = false;
}

function confirmQuit() {
  cleanupPlayer();
}

function cleanupPlayer() {
  if (playerState.intervalId) clearInterval(playerState.intervalId);
  if (playerState.betweenTimer) clearTimeout(playerState.betweenTimer);
  if (playerState.countdownTimer) clearInterval(playerState.countdownTimer);
  playerState.intervalId = null;
  playerState.betweenTimer = null;
  playerState.countdownTimer = null;
  playerState.active = false;

  hideElement('sequence-player');
  hideElement('player-countdown');
  hideElement('player-complete');
  hideElement('player-quit-confirm');
  document.body.classList.remove('no-scroll');

  if (window.Telegram?.WebApp?.disableClosingConfirmation) {
    window.Telegram.WebApp.disableClosingConfirmation();
  }
}

function hapticTick() {
  try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light'); } catch (e) {}
}
