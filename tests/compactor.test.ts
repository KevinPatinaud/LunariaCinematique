import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedProject} from '../src/shared/game/seed.js';
import {parseGameProject, gameIssues} from '../src/shared/game/validation.js';
import {duplicateEnemy, defaultPushingRules, producedEnemies, pushingAttackStages, updateEnemyRules} from '../src/shared/game/enemyRules.js';
import {newLevel} from '../src/shared/game/types.js';
import {objectiveText} from '../src/shared/game/levelObjectives.js';
import {sample} from '../src/shared/presentation/runtime.js';

function fixture(){
 const p=parseGameProject(seedProject()), boss=duplicateEnemy(p,'truck');
 boss.speed=0.25;
 boss.rules={spawn:{mode:'arrival',x:7.6},blocksEnemies:false,blocksPlanting:true,contact:'solid',boss:true,pushing:defaultPushingRules()};
 const level=newLevel(['radish','rose'],'runner');
 level.objective={type:'repel_boss',target:0};
 level.waves[0].groups=[{id:'group_push',enemyId:boss.id,count:1,lane:2,start:0,interval:1}];
 p.levels=[level];p.campaign={steps:[{id:'step_push',kind:'level',levelId:level.id}],cinematics:[]};p.cinematics=[];
 return {p,boss,level};
}
test('a renamed pushing boss and its escort publish, duplicate and round-trip',()=>{
 const {p,boss,level}=fixture();
 assert.doesNotThrow(()=>parseGameProject(p));
 assert.match(objectiveText(level),/poussées/);
 assert.ok(producedEnemies(p.balance.enemies,[boss.id]).includes('runner'));
 const copy=duplicateEnemy(p,boss.id);
 assert.deepEqual(copy.rules!.pushing,boss.rules!.pushing);
 copy.rules!.pushing!.pressure=555;
 assert.notEqual(copy.rules!.pushing!.pressure,boss.rules!.pushing!.pressure);
 assert.deepEqual(parseGameProject(JSON.parse(JSON.stringify(p))).levels,p.levels);
});
test('repel objective rejects missing, repeated, delayed or randomly placed pushing bosses',()=>{
 for(const mutate of [
  ({level}:ReturnType<typeof fixture>)=>{level.waves[0].groups=[];},
  ({level}:ReturnType<typeof fixture>)=>{level.waves[0].groups[0].count=2;},
  ({level}:ReturnType<typeof fixture>)=>{level.waves[0].groups[0].start=4;},
  ({level}:ReturnType<typeof fixture>)=>{level.waves[0].groups[0].lane=-1;},
  ({level}:ReturnType<typeof fixture>)=>{level.waves.push(structuredClone(level.waves[0]));},
 ]){const f=fixture();mutate(f);assert.ok(gameIssues(f.p).some(x=>x.severity==='error'));}
});
test('pushing settings reject broken role, escort, bounds and ordinary objectives',()=>{
 for(const mutate of [
  ({boss}:ReturnType<typeof fixture>)=>{boss.rules!.boss=false;},
  ({boss}:ReturnType<typeof fixture>)=>{boss.rules!.pushing!.stops=1.5;},
  ({boss}:ReturnType<typeof fixture>)=>{boss.rules!.pushing!.pressure=0;},
  ({boss}:ReturnType<typeof fixture>)=>{boss.rules!.pushing!.escortCount=0;},
  ({boss}:ReturnType<typeof fixture>)=>{boss.rules!.pushing!.escortInterval=0;},
  ({boss}:ReturnType<typeof fixture>)=>{boss.rules!.pushing!.escortEnemyId=boss.id;},
  ({boss}:ReturnType<typeof fixture>)=>{boss.rules!.spawn.x=8.45;},
  ({level}:ReturnType<typeof fixture>)=>{level.objective.type='defend';},
 ]){const f=fixture();mutate(f);assert.ok(gameIssues(f.p).some(x=>x.severity==='error'));}
});
test('wheel geometry round-trips and rolling keeps the body rigid',()=>{
 const {p,boss}=fixture();
 boss.visual!.rollingParts=[{center:{x:.8,y:.7},radius:{x:.05,y:.1}}];
 const profile=p.presentation!.profiles.find(x=>x.id===boss.animationProfileId)!;
 const animation=p.presentation!.animations.find(x=>x.id===profile.slots.find(s=>s.slot==='move')!.animationId)!;
 animation.motion={preset:'roll',amplitude:1,period:4};
 assert.doesNotThrow(()=>parseGameProject(p));
 for(const time of [0,.1,.6,1.1,4,4.001])assert.deepEqual(sample(animation,time),animation.transform);
 const copy=duplicateEnemy(p,boss.id);
 assert.deepEqual(copy.visual!.rollingParts,boss.visual!.rollingParts);
 copy.visual!.rollingParts![0].center.x=.99;
 assert.ok(gameIssues(p).some(x=>x.severity==='error'&&x.message.includes('roue')));
});
test('per-push seeds are configurable, copied and validated independently of kill rewards',()=>{
 const {p,boss}=fixture();
 assert.equal(boss.rules!.pushing!.seedReward,150);
 boss.rules!.pushing!.seedReward=73;
 const loaded=parseGameProject(JSON.parse(JSON.stringify(p)));
 assert.equal(loaded.balance.enemies.find(e=>e.id===boss.id)!.rules!.pushing!.seedReward,73);
 const copy=duplicateEnemy(p,boss.id);
 assert.equal(copy.rules!.pushing!.seedReward,73);
 copy.rules!.pushing!.seedReward=99;
 assert.equal(boss.rules!.pushing!.seedReward,73);
 for(const value of [-1,.5,10001]){boss.rules!.pushing!.seedReward=value;assert.ok(gameIssues(p).some(x=>x.severity==='error'&&x.path.includes('seedReward')));}
 boss.rules!.pushing!.seedReward=0;
 assert.doesNotThrow(()=>parseGameProject(p));
 delete boss.rules!.pushing!.seedReward;
 assert.doesNotThrow(()=>parseGameProject(p));
});

test('attack stages use 75%, 100%, 125% of the unchanged base and follow edited stats',()=>{
 const {p,boss}=fixture();
 boss.attack=52;
 assert.deepEqual(pushingAttackStages(boss),[39,52,65]);
 const copy=duplicateEnemy(p,boss.id);
 copy.attack=80;
 assert.deepEqual(pushingAttackStages(copy),[60,80,100]);
 assert.equal(boss.attack,52);
 copy.rules!.pushing!.stops=5;
 assert.deepEqual(pushingAttackStages(copy),[60,80,100,120,140]);
 delete copy.rules!.pushing;
 assert.deepEqual(pushingAttackStages(copy),[]);
});

test('disabling pushing removes the optional field and permits an ordinary objective',()=>{
 const {p,boss,level}=fixture();
 updateEnemyRules(p,boss.id,{...boss.rules!,pushing:undefined});
 level.objective.type='defend';
 assert.equal(Object.hasOwn(boss.rules!,'pushing'),false);
 assert.doesNotThrow(()=>parseGameProject(p));
});
