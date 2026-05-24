 const { pool } = require('./db');
const { sendMessage } = require('./bot');

function pad(n) { return String(n).padStart(2, '0'); }

function startReminderScheduler() {
  const now = new Date();
  const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  setTimeout(() => {
    checkReminders();
    setInterval(checkReminders, 60_000);
  }, msToNextMinute);
  console.log('Reminder scheduler started');
}

async function checkReminders() {
  const now = new Date();
  const currentTime = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;
  const today = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;

  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.telegram_id, u.name
       FROM users u
       LEFT JOIN yoga_sessions ys ON ys.user_id = u.id AND ys.date = $2
       WHERE u.reminder_on = true
         AND u.reminder_time = $1
         AND u.telegram_id IS NOT NULL
         AND ys.id IS NULL`,
      [currentTime, today]
    );

    for (const user of rows) {
      try {
        await sendMessage(
          user.telegram_id,
          `🧘 <b>${user.name}</b>, не забудь про практику!\n\nСегодня тренировка ещё не отмечена. Открой приложение и отметь свою практику 🌿`
        );
      } catch (e) {
        console.error(`Reminder failed for user ${user.id}:`, e.message);
      }
    }
  } catch (err) {
    console.error('Reminder check error:', err.message);
  }
}

module.exports = { startReminderScheduler };
