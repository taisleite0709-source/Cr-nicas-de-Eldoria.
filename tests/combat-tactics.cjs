const assert=require('node:assert/strict');
const document={getElementById:()=>({style:{display:'none'}})};
let running=true,sceneActive=false,fallTimer=0,dialogOpen=false,bagOpen=false,upgradeUI={style:{display:'none'}},talentPanel={style:{display:'none'}},rollState={time:0,energy:100},guardTime=0,guardCooldown=0,chargedAttackCooldown=0,guardKeyLatch=false,chargedKeyLatch=false;
let p={x:0,y:0,dir:0,cool:0,attack:0,inv:0,level:1},enemies=[],boss=null,weapon=8,physicalBonus=0,stats={strength:2},events=[];
function message(x){events.push(x)}
function v12OnParry(){}
function v12OnHit(){}
function v12State(){return {parryCounter:0}}
function combatBurst(){}
function emitStealthSound(){}
function equipBonus(){return 0}
function clearLine(){return true}
function moveWithCollision(e,x,y){e.x+=x;e.y+=y}
function enemyStyle(e){return e.style}
const code=require('fs').readFileSync(__dirname+'/../app/src/main/assets/index.html','utf8');
function extract(start,end){const a=code.indexOf(start),b=code.indexOf(end,a);assert(a>=0&&b>a);return code.slice(a,b)}
eval(extract('function canCombatAction()', 'function receiveDamage(amount)'));
eval(extract('function enemyTactics(e,dt)', 'function enemyStrike(e)'));
assert.equal(tryGuard(),true);assert.equal(rollState.energy,75);
assert.equal(guardAgainst(40),0);guardTime=.1;assert.equal(guardAgainst(40),18);
guardTime=0;assert.equal(tryGuard(),false);
guardCooldown=0;rollState.energy=50;
enemies=[{x:55,y:0,hp:100,style:'blade',phase:0}];
assert.equal(chargedStrike(),true);assert(enemies[0].hp<100);assert(enemies[0].stagger>0);
assert.equal(chargedStrike(),false);
const caster={x:70,y:0,hp:10,alertState:'chase',style:'arcane',phase:0};
enemyTactics(caster,.1);assert(caster.x>70);
console.log('6 tactical assertions passed');
