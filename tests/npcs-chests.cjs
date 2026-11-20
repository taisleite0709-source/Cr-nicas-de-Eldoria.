const assert=require('node:assert/strict');const fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/../app/src/main/assets/index.html','utf8');
function between(a,b){const i=source.indexOf(a),j=source.indexOf(b,i);assert(i>=0&&j>i,a);return source.slice(i,j)}
let floor=2,treasureSmallChests={},roomEvents=new Set(),chestOpenAnimations={},gold=0,materials=0,xp=0,events=[];
let p={x:0,y:0};function message(t){events.push(t)}function addXp(n){xp+=n}function earnMaterials(n){materials+=n}function save(){};
const MathOriginal=Math.random;Math.random=()=>.3;
const c={id:'test',cx:0,cy:0,w:220};
eval(between('function treasureKey(c){','function roomFurniture(){'));
eval(between('function openMiniTreasures(c){','function npcServices(c){'));
assert.equal(treasureMask(c),0);
let pos=treasurePosition(c,0);p.x=pos.x;p.y=pos.y;
openMiniTreasures(c);assert.equal(treasureMask(c),1);assert.equal(treasureSmallChests['2:test'],'m:1');assert(treasureFrame(c,0)>=1&&treasureFrame(c,0)<=3);
// Repeated action must not reopen the same chest.
openMiniTreasures(c);assert.equal(treasureMask(c),1);
pos=treasurePosition(c,1);p.x=pos.x;p.y=pos.y;openMiniTreasures(c);assert.equal(treasureMask(c),3);pos=treasurePosition(c,2);p.x=pos.x;p.y=pos.y;openMiniTreasures(c);
assert.equal(treasureMask(c),7);assert(roomEvents.has('test'));
const goldAfter=gold;openMiniTreasures(c);assert.equal(gold,goldAfter);
// Legacy saves stored number of chests opened, not a mask.
treasureSmallChests['2:test']=2;assert.equal(treasureMask(c),3);
treasureSmallChests['2:test']='m:5';assert.equal(treasureMask(c),5);
console.log('NPC/chest tests passed: individual state, animation, rewards, legacy saves');
