const express    = require('express');
const router     = express.Router();
const crypto     = require('crypto');
const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { pool }   = require('../db');

function createToken(userId) {
  return jwt.sign({ userId: String(userId) }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function safeUser(row) {
  return {
    _id:         String(row.id),
    telegram_id: row.telegram_id,
    email:       row.email,
    name:        row.name,
    avatar:      row.avatar,
    theme:       row.theme,
    color_theme: row.color_theme,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

// POST /api/auth/telegram
router.post('/telegram', async (req, res) => {
  try {
    const { initData } = req.body;
    if (!initData) return res.status(400).json({ error: 'initData обязателен' });

    const params = new URLSearchParams(initData);
    const hash   = params.get('hash');
    params.delete('hash');

    const dataStr  = Array.from(params.entries()).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`).join('\n');
    const secret   = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest();
    const expected = crypto.createHmac('sha256', secret).update(dataStr).digest('hex');

    if (expected !== hash) return res.status(401).json({ error: 'Неверная подпись Telegram' });

    const tgUser    = JSON.parse(params.get('user'));
    const telegramId = String(tgUser.id);
    const name      = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Пользователь';

    let result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    let user;
    if (result.rows.length === 0) {
      const ins = await pool.query(
        'INSERT INTO users (telegram_id, name) VALUES ($1, $2) RETURNING *',
        [telegramId, name]
      );
      user = ins.rows[0];
    } else {
      user = result.rows[0];
    }

    res.json({ token: createToken(user.id), user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.includes('@')) return res.status(400).json({ error: 'Укажите корректный email' });

    const code      = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query('DELETE FROM otps WHERE email = $1', [email]);
    await pool.query(
      'INSERT INTO otps (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    );

    const mailer = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await mailer.sendMail({
      from: `"Yoga Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Код подтверждения',
      html: `<div style="font-family:sans-serif;text-align:center;padding:30px;background:#fce4ec;border-radius:16px;max-width:400px;margin:0 auto">
        <h2 style="color:#e91e63">Yoga Tracker</h2>
        <p>Ваш код:</p>
        <div style="font-size:36px;font-weight:bold;color:#e91e63;letter-spacing:8px">${code}</div>
        <p style="color:#999;font-size:12px">Действителен 10 минут</p></div>`
    });

    res.json({ message: 'Код отправлен на ' + email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка отправки. Проверьте EMAIL_USER и EMAIL_PASS в настройках' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email и код обязательны' });

    const result = await pool.query(
      'SELECT * FROM otps WHERE email = $1 AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    const otp = result.rows[0];
    if (!otp)                        return res.status(400).json({ error: 'Код не найден' });
    if (new Date() > otp.expires_at) return res.status(400).json({ error: 'Код истёк' });
    if (otp.code !== code)           return res.status(400).json({ error: 'Неверный код' });

    await pool.query('UPDATE otps SET used = TRUE WHERE id = $1', [otp.id]);

    let userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;
    if (userRes.rows.length === 0) {
      const ins = await pool.query(
        'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
        [email, email.split('@')[0]]
      );
      user = ins.rows[0];
    } else {
      user = userRes.rows[0];
    }

    res.json({ token: createToken(user.id), user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка проверки кода' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Не найден' });
    res.json({ user: safeUser(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
