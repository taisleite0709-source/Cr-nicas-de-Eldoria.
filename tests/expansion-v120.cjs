const assert=require('node:assert/strict');
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/../app/src/main/assets/index.html','utf8');
const start=html.indexOf('function v12Defaults()'),end=html.indexOf('function expansionReset()',start);
assert(start>0&&end>start);
let expansion={v12:null},floor=4,gold=100,eldoriaMaterials=20,p={x:0,y:0,hp:90,max:100},weapon=12,physicalBonus=1,
 equipped={weapon:'blade'},enemies=[],chambers=[{id:1,type:'treasure',cx:60,cy:70}],discoveredRooms=new Set();
let messages=[],saved=0,rollState={};
function message(x){messages.push(x)}function save(){saved++}function earnMaterials(n){eldoriaMaterials+=n}function safeSpawn(){}
function expansionRand(){return ()=>.5}function combatBurst(){}function lootItem(){return {name:'Espada',rarity:4}}
const code=html.slice(start,end);
eval(code);
assert.equal(v12State().combo,0);
assert.equal(v12Element(),'fire');
v12OnHit({hp:30,x:0,y:0});assert.equal(v12State().combo,1);
v12OnHit({hp:30,x:0,y:0});v12OnHit({hp:30,x:0,y:0});assert.equal(v12State().combo,3);
v12Tick(2);assert.equal(v12State().combo,0);
v12OnParry();assert(v12State().parryCounter>0);
v12Contract();assert.equal(v12State().contracts[4].goal,3+4%4);
for(let i=0;i<3;i++)v12OnKill();assert.equal(v12State().contracts[4].status,'done');assert.equal(v12State().bounties,1);
v12Enchant();assert(v12State().runes.blade);assert.equal(eldoriaMaterials,16);
v12Portal();assert.equal(p.x,60);assert.equal(v12State().portalVisited[4],true);assert(discoveredRooms.has(1));
v12Tavern();assert(v12State().tavernVisited[4]);
v12Challenge('iron');assert.equal(v12DrinkAllowed(),false);
v12Challenge('normal');assert.equal(v12DrinkAllowed(),true);
assert(saved>0);
console.log('v12: 14 behavioral assertions passed');
