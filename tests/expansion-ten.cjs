const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/../app/src/main/assets/index.html','utf8');
const features=[
 ['Procedural seed','function expansionRoomVariation('],
 ['NPC consequences','function expansionNPCDecision('],
 ['Weapon mastery','function expansionWeaponProgress('],
 ['Hidden boss','function expansionHiddenBoss('],
 ['Camp','function expansionCamp('],
 ['Companions','function expansionCompanionTick('],
 ['Rune puzzles','function expansionPuzzle('],
 ['Weather','function expansionUpdateWeather('],
 ['Village upgrades','function expansionBuild('],
 ['Legacy','function expansionRecordLegacy(']
];
for(const [name,code] of features){assert(html.includes(code),'Missing '+name)}
assert(html.includes('bestiaryKnowledge,expansion,eldoriaV15:v15Save(),eldoriaV151:v151Save()}'),'Expansion not saved');
assert(html.includes('expansionSafeLoad(data.expansion)'),'Expansion not loaded');
assert(html.includes('expansionReset();'),'Expansion not reset');
assert(html.includes('expansionRecordLegacy();return true'),'Combat death not recorded');
assert(html.includes('expansionHiddenBoss()}'),'Hidden boss not integrated in spawns');
assert(html.includes('expansionWeatherDraw();'),'Weather rendering not integrated');
assert(html.includes('expansionCompanionTick(dt)'),'Companion not updated');
assert(html.includes('expansionWeaponProgress();'),'Mastery not connected to kills');
console.log('18 expansion integration assertions passed');
