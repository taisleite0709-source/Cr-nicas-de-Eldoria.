const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const filename = path.join(__dirname, 'app/src/main/assets/index.html');
const html = fs.readFileSync(filename, 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if (scripts.length === 0) throw new Error('Nenhum script encontrado no jogo.');
scripts.forEach(([, script], index) => {
  new vm.Script(script, { filename: `index.html (script ${index + 1})` });
});
console.log(`Sintaxe válida em ${scripts.length} script(s).`);
