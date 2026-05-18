require('dotenv').config();
const https = require('https');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function botRequest(method, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${process.env.BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch(e) { resolve({}); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function startCloudflare(port) {
  return new Promise((resolve, reject) => {
    console.log('Starting Cloudflare tunnel (no timeout)...\n');

    // Ищем cloudflared в кэше npx
    const nodeModulesPath = path.join(__dirname, 'node_modules', '.bin');

    // Запускаем через cmd /c npx — без shell:true чтобы избежать EPERM
    const proc = spawn('cmd', ['/c', `npx cloudflared tunnel --url http://localhost:${port}`], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });

    let found = false;

    function checkText(text) {
      process.stdout.write(text);
      if (found) return;
      const m = text.match(/https:\/\/[a-zA-Z0-9\-]+\.trycloudflare\.com/);
      if (m) {
        found = true;
        resolve({ url: m[0], proc });
      }
    }

    proc.stdout.on('data', d => checkText(d.toString()));
    proc.stderr.on('data', d => checkText(d.toString()));

    proc.on('error', (err) => {
      if (!found) reject(err);
    });

    proc.on('close', (code) => {
      if (!found) reject(new Error('cloudflared stopped with code ' + code));
      else {
        console.log('\nTunnel process closed. Restart bat file.');
        process.exit(0);
      }
    });

    // Ждём максимум 90 секунд на старт
    setTimeout(() => {
      if (!found) reject(new Error('Timeout 90s: URL not found'));
    }, 90000);
  });
}

async function setupBot(url) {
  await botRequest('deleteWebhook', {});
  const mb = await botRequest('setChatMenuButton', {
    menu_button: { type: 'web_app', text: '🧘 Открыть трекер', web_app: { url } }
  });
  if (mb.ok) console.log('\n✓ Bot menu button updated');
  else console.log('\n⚠ Bot warning: ' + mb.description);

  const me = await botRequest('getMe', {});
  return me.ok ? me.result.username : null;
}

async function main() {
  const PORT = parseInt(process.env.PORT || 3000);

  console.log('\n=====================================');
  console.log('  YOGA TRACKER - Cloudflare Tunnel');
  console.log('=====================================\n');

  const { url, proc } = await startCloudflare(PORT);

  console.log('\n✓ Tunnel: ' + url);

  const username = await setupBot(url);

  console.log('\n=====================================');
  console.log('  ALL DONE!');
  console.log('=====================================');
  if (username) {
    console.log('\n  Open: https://t.me/' + username);
    console.log('  Tap the button "🧘 Открыть трекер"\n');
  }
  console.log('  Keep this window open!\n');
}

main().catch(err => {
  console.error('\nError: ' + err.message + '\n');
  process.exit(1);
});
