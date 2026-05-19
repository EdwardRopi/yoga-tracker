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

function toast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}
