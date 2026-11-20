const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');

async function waitFor(fn, label) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const result = await fn();
    if (result) return result;
    await delay(500);
  }
  throw new Error(label);
}

async function main() {
  const target = await waitFor(async () => {
    try {
      const response = await fetch('http://127.0.0.1:9222/json/list');
      const pages = await response.json();
      return pages.find(page => page.url.includes('appassets.androidplatform.net'));
    } catch {
      return null;
    }
  }, 'A WebView do jogo não apresentou uma página de depuração.');
  const connection = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    connection.addEventListener('open', resolve, { once: true });
    connection.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const requests = new Map();
  const errors = [];
  connection.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if (!requests.has(message.id)) return;
    const { resolve, reject } = requests.get(message.id);
    requests.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    requests.set(++id, { resolve, reject });
    connection.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const tap = (label, root = 'body') => evaluate(`(() => {
    const buttons = document.querySelectorAll(${JSON.stringify(root + ' button')});
    const button = [...buttons].find(b => b.textContent.trim() === ${JSON.stringify(label)});
    if (!button || button.disabled || !button.getClientRects().length) return false;
    button.click();
    return true;
  })()`);
  const selectFirst = () => evaluate("document.querySelector('.origin-choice').click()");
  const adb = (...args) => execFileSync('adb', args, { encoding: 'utf8' });

  try {
    await send('Runtime.enable');
    const activity = 'com.eldoria.cronicas/.MainActivity';
    if (!await evaluate("typeof eldoriaDiagnostics === 'function'")) {
      console.error(await evaluate('({url:location.href,text:document.body?.innerText.slice(0,600),agent:navigator.userAgent})'));
    }
    await waitFor(() => tap('NOVA AVENTURA', '#origin'), 'Tela inicial da WebView indisponível.');
    await selectFirst();
    assert.equal(await tap('ESCOLHER CLASSE', '#origin'), true);
    await selectFirst();
    assert.equal(await tap('OUVIR A HISTÓRIA', '#origin'), true);
    assert.equal(await tap('CONTINUAR', '#origin'), true);
    await evaluate("document.querySelector('#cinemaSkip').click()");
    assert.equal(await evaluate('eldoriaDiagnostics().savePresent'), true);
    assert.equal(await evaluate('eldoriaDiagnostics().walkable'), true);
    await waitFor(() => tap('Proteger os habitantes', '#v152Dialog'), 'Primeira decisão da campanha indisponível.');
    adb('shell', 'input', 'keyevent', 'KEYCODE_HOME');
    await delay(700);
    adb('shell', 'am', 'start', '-W', '-n', activity);
    assert.equal(await evaluate("eldoriaV152Diagnostics().scars['biome:0']"), 'restored');
    assert.deepEqual(errors, []);
    console.log('APK instalado e iniciado no Android 15 em modo avião. Campanha, decisão, salvamento e retomada verificados na WebView.');
  } finally {
    connection.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
