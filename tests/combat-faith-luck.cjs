
const assert=require('node:assert/strict');
let faithGraceCooldown=0,luckSecondChanceCooldown=0,skillShield=0,rollState={time:0},p={hp:10,max:100,inv:0,x:0,y:0},luckTalent=false,miracle=false,faithChance=.5,random=.9,events=[];
const MathOriginal=Math.random;Math.random=()=>random;
function dodgeChance(){return 0}
function defenseReduction(){return 0}
function divineGraceChance(){return faithChance}
function hasTalent(id){return id==='luck_phoenix'?luckTalent:id==='faith_miracle'?miracle:false}
function combatBurst(){}
function message(t){events.push(t)}
let hitFlash=0,damagePulse=0,shake=0;
function receiveDamage(amount){if(rollState.time>0||p.inv>0||skillShield>0)return false;if(Math.random()<dodgeChance()){p.inv=.38;message('💨 ESQUIVA!');return false}const dmg=Math.max(1,Math.round(amount*(1-defenseReduction())));
 if(p.hp-dmg<=0&&faithGraceCooldown<=0&&divineGraceChance()>0&&Math.random()<divineGraceChance()){
  p.hp=Math.max(1,Math.ceil(p.max*(hasTalent('faith_miracle')?.30:.18)));faithGraceCooldown=hasTalent('faith_miracle')?27:35;p.inv=1.4;
  combatBurst(p.x,p.y,'#ffe8a5',28,130);message('✨ GRAÇA DIVINA: você resistiu ao golpe fatal!');return false;
 }
 if(p.hp-dmg<=0&&luckSecondChanceCooldown<=0&&hasTalent('luck_phoenix')&&Math.random()<.10){
 p.hp=1;p.inv=1.2;luckSecondChanceCooldown=65;
 combatBurst(p.x,p.y,'#b9ff9b',20,110);message('🍀 SEGUNDA CHANCE!');return false;
}
 p.hp-=dmg;p.inv=.85;hitFlash=.22;damagePulse=1;shake=9;return true}

function reset(){faithGraceCooldown=0;luckSecondChanceCooldown=0;p.hp=10;p.inv=0;events=[];faithChance=.5;luckTalent=false;miracle=false;random=.9}
reset();faithChance=1;luckTalent=true;random=.05;
assert.equal(receiveDamage(30),false);assert.equal(p.hp,18);assert.equal(faithGraceCooldown,35);assert.equal(luckSecondChanceCooldown,0);
reset();faithChance=0;luckTalent=true;random=.05;
assert.equal(receiveDamage(30),false);assert.equal(p.hp,1);assert.equal(luckSecondChanceCooldown,65);
reset();faithChance=1;luckTalent=true;faithGraceCooldown=20;random=.05;
assert.equal(receiveDamage(30),false);assert.equal(p.hp,1);assert.equal(faithGraceCooldown,20);
reset();faithChance=1;luckTalent=true;miracle=true;random=.05;
assert.equal(receiveDamage(30),false);assert.equal(p.hp,30);assert.equal(faithGraceCooldown,27);
reset();faithChance=.5;luckTalent=true;random=.95;
assert.equal(receiveDamage(30),true);assert.equal(p.hp,-20);
reset();faithChance=1;luckTalent=true;random=.05;p.inv=1;
assert.equal(receiveDamage(30),false);assert.equal(p.hp,10);
console.log('6 scenarios passed');
