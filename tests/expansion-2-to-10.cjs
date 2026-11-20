const assert=require('node:assert/strict');
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/../app/src/main/assets/index.html','utf8');
const checks=[
 ['10 classes specialized',['guerreiro','mago','arqueiro','paladino','clerigo','ladino','barbaro','druida','necromante','monge'].map(x=>html.includes(x+':[')).every(Boolean)],
 ['class talent level gating',html.includes("heroClass===t.classId&&p.level>=t.required")],
 ['legendary set requires two equipped relics',html.includes("['relic_forge','relic_frost'].every(id=>Object.values(equipped).includes(id))")],
 ['events include risks and rewards',html.includes('PACTO ARRISCADO')&&html.includes('SANTUÁRIO RARO')],
 ['boss final phase escalates',html.includes('stage===3?1.16:1')],
 ['village has forge and recipes',html.includes('function eldoriaVillage()')&&html.includes('vForge')&&html.includes('vPotion')&&html.includes('vScroll')],
 ['exploration awards resources',html.includes('eldoriaDiscoveries%12===0')],
 ['achievements track progression',html.includes('function eldoriaAchievements()')],
 ['graphics mode changes costly effects',html.includes("if(eldoriaGraphics==='high')drawCombatLights()")],
 ['save and load persist additions',html.includes('eldoriaMaterials,eldoriaVillageLevel,eldoriaDiscoveries,eldoriaGraphics')&&html.includes('data.eldoriaMaterials')],
 ['tactical and village buttons are bound inside IIFE',html.indexOf("document.getElementById('guardBtn').addEventListener")<html.indexOf("})();\n</script>")],
];
for(const [name,passed] of checks){console.log((passed?'PASS':'FAIL')+' '+name);assert(passed,name)}
console.log(checks.length+' integration checks passed');
