const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM, VirtualConsole } = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, '../app/src/main/assets/index.html'), 'utf8');
const boot = "renderQuests();draw();showOrigin('welcome')";
assert.equal(source.split(boot).length, 2);

function start(t, storedSave) {
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error.detail || error));
  const canvas = new Proxy({}, { get(target, key) { return target[key] ?? (() => canvas); } });
  const requests = new Map();
  let frameId = 0;
  const html = source.replace(boot, `window.fixture={
    tick:update, descend, save, draw, choice:v15StoryChoice,
    get hero(){return {...p, race:heroRace, class:heroClass}},
    get supplies(){return {gold,potions}},
    get equipped(){return {...equipped}},
    get patterns(){return Object.keys(narrativeBossMoves)},
    clearFloor(){chambers.forEach(c=>clearedChambers.add(c.id));stairCooldown=0},
    grantWeapon(){ownedWeapons.push('dagger')},
    talk(){const n={name:'Aldric',line:'Saudações',service:'Conversar',c:{id:'fixture'},index:0};npcSpeak(n);npcClose()},
    defeatCreature(){v151Kill({})},
    openChest(){const c=chambers.find(c=>!peacefulTypes.has(c.type)&&!openedChests.has(c.id));clearedChambers.add(c.id);p.x=c.cx;p.y=c.cy;openChest()},
    end(){floor=MAX_FLOOR;this.clearFloor();descend()},
    windup(){boss.moveIndex=2;bossPrepare(boss);return boss.pattern}
  }; ${boot}`);
  const dom = new JSDOM(html, {
    url: 'https://appassets.androidplatform.net/index.html?eldoria_test=1',
    virtualConsole: console, runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.HTMLCanvasElement.prototype.getContext = () => canvas;
      w.requestAnimationFrame = callback => { requests.set(++frameId, callback); return frameId; };
      w.cancelAnimationFrame = id => requests.delete(id);
      if (storedSave) w.localStorage.setItem('eldoria_v14_backup', storedSave);
    },
  });
  t.after(() => { dom.window.close(); assert.deepEqual(errors, []); });
  return { w: dom.window, requests, game: dom.window.fixture };
}

function press(w, label, scope = w.document) {
  const button = [...scope.querySelectorAll('button')].find(node => node.textContent.trim() === label);
  assert.ok(button, 'Botão ausente: ' + label);
  assert.equal(button.disabled, false);
  button.click();
}

function newCampaign(w) {
  press(w, 'NOVA AVENTURA');
  w.document.querySelector('.origin-choice').click();
  press(w, 'ESCOLHER CLASSE');
  w.document.querySelector('.origin-choice').click();
  press(w, 'OUVIR A HISTÓRIA');
  press(w, 'CONTINUAR', w.document.querySelector('#origin'));
  w.document.querySelector('#cinemaSkip').click();
}

test('inicializa, cria personagem, move, abre inventário e recupera a campanha pelo backup', t => {
  const { w, game } = start(t);
  newCampaign(w);
  assert.ok(game.hero.race && game.hero.class);
  assert.equal(w.eldoriaDiagnostics().walkable, true);
  const before = game.hero;
  w.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'd' }));
  for (let frame = 0; frame < 8; frame++) game.tick(.016);
  w.dispatchEvent(new w.KeyboardEvent('keyup', { key: 'd' }));
  assert.notEqual(game.hero.x, before.x);
  assert.equal(w.eldoriaDiagnostics().walkable, true);
  game.grantWeapon();
  w.document.querySelector('#bagToggle').click();
  const weapon = w.document.querySelector('select[data-slot="weapon"]');
  weapon.value = 'dagger';
  weapon.dispatchEvent(new w.Event('change'));
  assert.equal(game.equipped.weapon, 'dagger');
  game.save();
  const saved = w.localStorage.getItem('eldoria_v03');
  const next = start(t, saved);
  press(next.w, 'CONTINUAR SALVAMENTO');
  assert.equal(next.game.hero.class, before.class);
  assert.equal(next.game.equipped.weapon, 'dagger');
});

test('pausa cancela o quadro, salva e retoma com um único agendamento', t => {
  const { w, requests } = start(t);
  newCampaign(w);
  assert.equal(requests.size, 1);
  const pause = detail => w.dispatchEvent(new w.CustomEvent('eldoria-activity', { detail }));
  pause(true);
  assert.equal(requests.size, 0);
  assert.ok(w.localStorage.getItem('eldoria_v03'));
  pause(false);
  pause(false);
  assert.equal(requests.size, 1);
  const [id, frame] = requests.entries().next().value;
  requests.delete(id);
  frame(w.performance.now() + 16.7);
  assert.equal(requests.size, 1);
});

test('seis atos em ordem, marcas persistentes e três finais alternativos', t => {
  for (const [plan, ending] of [
    [[1,1,1,1,1,1], 'ELDORIA PURIFICADA'],
    [[-1,-1,-1,-1,-1,-1], 'O NOVO SOBERANO'],
    [[1,-1,1,-1,1,-1], 'O PACTO RESTAURADO'],
  ]) {
    const { w, game } = start(t);
    newCampaign(w);
    for (let floor = 1; floor <= 30; floor++) {
      if ((floor - 1) % 5 === 0) {
        game.choice();
        const act = (floor - 1) / 5;
        press(w, plan[act] > 0 ? 'Proteger os habitantes' : 'Reivindicar o poder antigo');
        assert.equal(w.eldoriaV15Diagnostics().chapter, act + 1);
        assert.equal(w.eldoriaV152Diagnostics().scars['biome:' + act], plan[act] > 0 ? 'restored' : 'blighted');
      }
      game.clearFloor();
      game.descend();
      assert.equal(w.eldoriaDiagnostics().floor, Math.min(30, floor + 1));
    }
    assert.ok(w.document.querySelector('#panel h1').textContent.includes(ending));
    const save = JSON.parse(w.localStorage.getItem('eldoria_v03'));
    assert.equal(Object.keys(save.eldoriaV151.narrativeV152.scars).length, 6);
  }
});

test('recrutamento, três missões do companheiro, recompensa e restauração do capítulo', t => {
  const { w, game } = start(t);
  newCampaign(w);
  game.talk(); game.talk(); game.talk();
  assert.equal(w.eldoriaV152Diagnostics().dialogues, 1);
  function talk() {
    w.document.querySelector('#v151Open').click();
    w.document.querySelector('#v152Talk').click();
  }
  function claim() {
    const before = game.supplies;
    talk();
    press(w, 'Concluir e receber recompensa');
    assert.equal(game.supplies.gold, before.gold + 30);
    assert.equal(game.supplies.potions, before.potions + 1);
    press(w, 'Continuar', w.document.querySelector('#v152Dialog'));
  }
  for (let i = 0; i < 5; i++) game.defeatCreature();
  claim();
  talk(); press(w, 'Aceitar o juramento');
  game.choice(); press(w, 'Proteger os habitantes');
  for (let i = 0; i < 3; i++) {
    game.openChest();
    game.clearFloor(); game.descend();
  }
  claim();
  talk(); press(w, 'Aceitar o juramento');
  for (let i = 0; i < 2; i++) {
    const upgrade = w.document.querySelector('#upgrade');
    while (upgrade.style.display === 'flex') upgrade.querySelector('.upcard').click();
    game.clearFloor(); game.descend();
  }
  claim();
  talk();
  assert.match(w.document.querySelector('#v152Dialog h2').textContent, /Juramento cumprido/);
  const next = start(t, w.localStorage.getItem('eldoria_v03'));
  press(next.w, 'CONTINUAR SALVAMENTO');
  assert.equal(next.w.eldoriaV152Diagnostics().chapters, 3);
  assert.equal(next.w.eldoriaV152Diagnostics().scars['biome:0'], 'restored');
});

test('os seis chefes anunciam e executam o ataque exclusivo na segunda fase', t => {
  const { w, game } = start(t);
  newCampaign(w);
  game.patterns.forEach((move, index) => {
    w.eldoriaCombatTest.setup({ bossFloor: 5 * (index + 1), stage: 2 });
    assert.equal(game.windup(), move);
    game.draw();
    assert.equal(w.eldoriaCombatTest.state().windup > 0, true);
    for (let i = 0; i < 24; i++) w.eldoriaCombatTest.tick(.05);
    assert.equal(w.eldoriaV152Diagnostics().bossSignature, move);
    assert.equal(w.eldoriaCombatTest.state().projectiles > 0, true);
  });
});
