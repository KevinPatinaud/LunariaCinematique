import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {seedProject} from '../dist-tests/src/shared/game/seed.js';
import {createProjectLevel} from '../dist-tests/src/shared/game/levelManagement.js';
import {compileCampaign} from '../dist-tests/src/shared/game/campaign.js';
import {parseGameProject} from '../dist-tests/src/shared/game/validation.js';
import {newCinematic} from '../dist-tests/src/shared/model.js';

const args=process.argv.slice(2),option=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const game=path.resolve(option('--game','C:/dev/Lunaria/game'));
const godot=option('--godot','C:/Program Files/Godot/Godot_v4.7.2-stable_win64_console.exe');
const out=option('--out','');
const base=path.join(game,'.godot/test-results');
await fs.mkdir(base,{recursive:true});
const dir=await fs.mkdtemp(path.join(base,'campaign-boundary-'));
try{
 const project=seedProject();project.levels=[];project.campaign={steps:[],cinematics:[]};
 createProjectLevel(project,{kind:'campaign',beforeId:null});createProjectLevel(project,{kind:'campaign',beforeId:null});
 const [first,second]=project.campaign.steps,doc=newCinematic();doc.shots[0].duration=1;
 const filmFile=path.join(dir,'film.cinematic.json');await fs.writeFile(filmFile,JSON.stringify(doc));
 project.cinematics=[doc];project.campaign.cinematics=[{id:'boundary_film',title:doc.title,documentId:doc.id,file:path.relative(game,filmFile).split(path.sep).join('/')}];
 const film={id:'step_film',kind:'cinematic',cinematicId:'boundary_film',skippable:true},end={id:'playable_end',kind:'end'};
 const cases=[
  ['after-film',[first,film,end,second],true],
  ['after-level',[first,end,film,second],true],
  ['at-start',[end,first,film,second],true],
  ['moved-after-two-levels',[first,film,second,end],true],
  ['uncompiled-authoring',[first,film,end,second],false],
  ['ending-after-film',[first,film,end,second],true,'campaign_ending_smoke'],
  ['ending-after-level',[first,end,film,second],true,'campaign_ending_smoke'],
  ['ending-at-start',[end,first,film,second],true,'campaign_ending_smoke'],
 ];
 if(out)await fs.mkdir(out,{recursive:true});
 const logs=[];
 for(const [label,steps,compiled,script='campaign_boundary_probe'] of cases){
  const source=structuredClone(project);source.campaign.steps=steps;
  const before=JSON.stringify(source),content=parseGameProject(compiled?compileCampaign(source):source);
  assert.equal(JSON.stringify(source),before);
  const file=path.join(dir,label+'.json');await fs.writeFile(file,JSON.stringify(content));
  const capture=out&&label==='after-film'?path.resolve(out,'fin-jouable-godot.png'):'';
  const flags=[capture?'--minimized':'--headless','--audio-driver','Dummy','--path',game,'--script','res://tests/'+script+'.gd','--','--studio-capability-workshop','--studio-content='+file];
  if(capture)flags.push('--out='+capture);
  const log=await new Promise((resolve,reject)=>{
   const child=spawn(godot,flags,{windowsHide:true,env:{...process.env,APPDATA:dir,XDG_CONFIG_HOME:dir,XDG_DATA_HOME:dir}});
   let text='';const timer=setTimeout(()=>{child.kill();reject(Error(label+': Godot timed out'));},60000);
   for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>{text+=chunk;if(/SCRIPT ERROR:/.test(text))child.kill();});
   child.on('error',error=>{clearTimeout(timer);reject(error);});
   child.on('close',code=>{clearTimeout(timer);code===0&&!/^ERROR:|SCRIPT ERROR:|failures=[1-9]/m.test(text)?resolve(text):reject(Error(label+'\n'+text));});
  });
  logs.push({label,log});console.log(label+': '+log.split(/\r?\n/).filter(line=>/^CAMPAIGN_(BOUNDARY|ENDING)/.test(line)).join(' '));
 }
 if(out)await fs.writeFile(path.join(out,'verification-fin-jouable.json'),JSON.stringify({sourceUnchanged:true,cases:logs},null,2)+'\n');
}finally{
 // dir is created by mkdtemp inside the verified game test-results folder.
 if(!dir.startsWith(base+path.sep))throw Error('Unexpected test directory');
 await fs.rm(dir,{recursive:true,force:true});
}
