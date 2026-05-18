/**
 * Запусти этот скрипт ПОСЛЕ того как ngrok заработает:
 *   node setup-bot.js https://твой-ngrok-адрес.ngrok.io
 *
 * Скрипт сам настроит webhook и кнопку меню бота.
 */

require('dotenv').config();
const https = require('https');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.argv[2];

if (!WEBAPP_URL) {
  console.error('❌ Укажи URL: node setup-bot.js https://xxx.ngrok.io');
  process.exit(1);
}

if (!BOT_TOKEN || BOT_TOKEN.includes('ВСТАВЬ')) {
  console.error('❌ Заполни BOT_TOKEN в файле .env');
  process.exit(1);
}

async function botRequest(method, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log(`\n🤖 Настройка бота...`);
  console.log(`   URL: ${WEBAPP_URL}\n`);

  // 1. Удаляем старый webhook если есть
  await botRequest('deleteWebhook', {});

  // 2. Устанавливаем webhook
  const wh = await botRequest('setWebhook', {
    url: `${WEBAPP_URL}/api/bot/webhook`,
    allowed_updates: ['message', 'callback_query']
  });
  console.log(wh.ok
    ? '✅ Webhook установлен'
    : `❌ Webhook ошибка: ${wh.description}`
  );

  // 3. Устанавливаем кнопку меню (открывает Mini App)
  const mb = await botRequest('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '🧘 Открыть трекер',
      web_app: { url: WEBAPP_URL }
    }
  });
  console.log(mb.ok
    ? '✅ Кнопка меню настроена'
    : `❌ Кнопка ошибка: ${mb.description}`
  );

  // 4. Получаем информацию о боте
  const me = await botRequest('getMe', {});
  if (me.ok) {
    console.log(`\n🎉 Бот @${me.result.username} готов!`);
    console.log(`   Открой в Telegram: https://t.me/${me.result.username}`);
    console.log(`   Нажми кнопку "🧘 Открыть трекер"\n`);
  }
}

main().catch(err => {
  console.error('Ошибка:', err.message);
});
