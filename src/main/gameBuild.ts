import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, promises as fs } from 'node:fs';
import { finished } from 'node:stream/promises';
import path from 'node:path';
import { spawn, type ChildProcess, type SpawnOptions } from 'node:child_process';
import { isWithin } from './files.js';
import { validGameRoot, validGodotExecutable } from './gamePreview.js';

export type GameBuildTarget='windows'|'android';
export interface GameBuildResult {target:GameBuildTarget;artifact:string;logPath:string;sha256:string;bytes:number;durationMs:number;simulated:boolean}
export interface GameBuildPaths {repositoryRoot:string;script:string;artifact:string;logPath:string;powershellTarget:'Windows'|'Android'}

const SPECS={
 windows:{folder:'windows',file:'Lunaria.exe',log:'lunaria-windows-export.log',powershellTarget:'Windows' as const},
 android:{folder:'android',file:'Lunaria.apk',log:'lunaria-android-export.log',powershellTarget:'Android' as const},
};

export function gameBuildPaths(gameRoot:string,target:GameBuildTarget):GameBuildPaths{
 if(!path.isAbsolute(gameRoot)||!Object.hasOwn(SPECS,target))throw Error('Cible de build invalide.');
 const repositoryRoot=path.resolve(gameRoot,'..'),spec=SPECS[target];
 return{repositoryRoot,script:path.join(repositoryRoot,'tools','build','build.ps1'),artifact:path.join(repositoryRoot,'build',spec.folder,spec.file),logPath:path.join(repositoryRoot,'tools','build','.local',spec.log),powershellTarget:spec.powershellTarget};
}

export async function godotForBuild(executable:string):Promise<string|null>{
 const valid=await validGodotExecutable(executable);if(!valid)return null;
 if(process.platform!=='win32'||/_console\.exe$/i.test(valid))return valid;
 const consolePath=valid.replace(/\.exe$/i,'_console.exe');
 return await validGodotExecutable(consolePath)??valid;
}

async function sha256(file:string):Promise<string>{
 const hash=createHash('sha256');
 await new Promise<void>((resolve,reject)=>{const stream=createReadStream(file);stream.on('data',chunk=>hash.update(chunk));stream.once('error',reject);stream.once('end',resolve);});
 return hash.digest('hex').toUpperCase();
}

function artifactRevision(stat:{mtimeMs:number;ctimeMs:number;size:number}):string{return JSON.stringify([stat.mtimeMs,stat.ctimeMs,stat.size]);}
async function inspectArtifact(gameRoot:string,target:GameBuildTarget,started:number,simulated:boolean,previousRevision?:string):Promise<GameBuildResult>{
 const paths=gameBuildPaths(gameRoot,target),stat=await fs.stat(paths.artifact).catch(()=>null);
 if(!stat?.isFile()||stat.size===0)throw Error(`Le build ${target==='windows'?'PC':'Android'} n’a produit aucun fichier.`);
 if(previousRevision!==undefined&&artifactRevision(stat)===previousRevision)throw Error('Le build n’a pas remplacé l’ancienne application. Aucune nouvelle application n’a été validée.\nJournal : '+path.join(path.dirname(paths.logPath),`lunaria-${target}-build.log`));
 return{target,artifact:paths.artifact,logPath:paths.logPath,sha256:await sha256(paths.artifact),bytes:stat.size,durationMs:Date.now()-started,simulated};
}

type SpawnLike=(command:string,args:string[],options:SpawnOptions)=>ChildProcess;
const BUILD_STAGES:Record<string,string>={
 copy:'Copie temporaire du jeu…',
 templates:'Vérification du moteur Godot…',
 clean:'Préparation des ressources…',
 fonts:'Préparation des polices…',
 import:'Import des images et des sons…',
 compress:'Compression des images…',
 reimport:'Import des images optimisées…',
 verify:'Vérification des images et des fichiers originaux…',
 'android-export':'Création et signature de l’APK Android…',
 signature:'Vérification de la signature Android…',
 'windows-export':'Création de l’application PC…',
};
const BUILD_STAGE_LOGS:Record<string,string>={clean:'lunaria-assets-clean.log',fonts:'lunaria-font-import.log',import:'lunaria-import.log',compress:'lunaria-assets-compress.log',reimport:'lunaria-compressed-import.log',verify:'lunaria-assets-verify.log','android-export':'lunaria-android-export.log','windows-export':'lunaria-windows-export.log',signature:'lunaria-android-signature.log'};
export async function runGameBuild(gameRoot:string,godotExecutable:string,target:GameBuildTarget,start:SpawnLike=spawn,onProgress?:(message:string)=>void):Promise<GameBuildResult>{
 if(process.platform!=='win32')throw Error('Les builds PC et Android de Lunaria sont configurés pour Windows.');
 const started=Date.now(),root=await validGameRoot(gameRoot);if(!root)throw Error('Projet Godot Lunaria introuvable.');
 const godot=await godotForBuild(godotExecutable);if(!godot)throw Error('Exécutable Godot introuvable.');
 const paths=gameBuildPaths(root,target),script=await fs.realpath(paths.script).catch(()=>null);
 if(!script||!isWithin(paths.repositoryRoot,script)||(await fs.stat(script)).isDirectory())throw Error('Script de build Lunaria introuvable dans tools/build/build.ps1.');
 const previousArtifact=await fs.stat(paths.artifact).catch(()=>null),previousRevision=previousArtifact?artifactRevision(previousArtifact):undefined;
 const systemRoot=process.env.SystemRoot??'C:\\Windows',powershell=path.join(systemRoot,'System32','WindowsPowerShell','v1.0','powershell.exe');
 if(!(await fs.stat(powershell).catch(()=>null))?.isFile())throw Error('Windows PowerShell est introuvable.');
 const consoleLogPath=path.join(path.dirname(paths.logPath),`lunaria-${target}-build.log`);
 await fs.mkdir(path.dirname(consoleLogPath),{recursive:true});
 await new Promise<void>((resolve,reject)=>{
  const output=createWriteStream(consoleLogPath),written=finished(output);
  void written.catch(()=>{});
  const child=start(powershell,['-NoLogo','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',script,'-Target',paths.powershellTarget,'-Godot',godot],{cwd:paths.repositoryRoot,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let text='',lastMessage='',lastStage='',settled=false;
  let failure:{log:string;code:number}|undefined;
  const fatal:string[]=[];
  const append=()=>{
   let pending='';
   return(chunk:unknown)=>{
   if(settled)return;
   const value=String(chunk);output.write(value);text=(text+value).slice(-120000);
   const lines=(pending+value).split(/\r?\n/);pending=(lines.pop()??'').slice(-4096);
   for(const line of lines){
    const clean=line.replace(/\x1B\[[0-9;?]*[ -/]*[@-~]/g,'');
    const stage=/^LUNARIA_BUILD_STAGE ([\w-]+)\s*$/.exec(clean);
    const message=stage?BUILD_STAGES[stage[1]]:undefined;
    if(stage&&message){lastStage=stage[1];if(message!==lastMessage){lastMessage=message;onProgress?.(message);}}
    const failed=/^LUNARIA_BUILD_FAILURE ([\w.-]+\.log) (-?\d+)\s*$/.exec(clean);
    if(failed)failure={log:failed[1],code:Number(failed[2])};
    if(/^SCRIPT ERROR:|^ERROR:/.test(clean)&&fatal.length<30)fatal.push(clean);
   }
   };
  };
  child.stdout?.setEncoding('utf8');child.stderr?.setEncoding('utf8');
  child.stdout?.on('data',append());child.stderr?.on('data',append());
  const finish=async(error?:Error)=>{
   if(settled)return;settled=true;clearTimeout(timer);output.end();
   try{await written;}catch(logError){if(!error)error=Error('Impossible de conserver le journal de compilation : '+String(logError));}
   if(error)reject(error);else resolve();
  };
  const timer=setTimeout(()=>{child.kill();void finish(Error('Le build a dépassé trente minutes et a été interrompu.\nJournal : '+consoleLogPath));},30*60*1000);
  child.once('error',error=>{void finish(Error('Impossible de démarrer le build : '+error.message));});
  child.once('close',code=>{
   for(const line of text.replace(/\x1B\[[0-9;?]*[ -/]*[@-~]/g,'').split(/\r?\n/))if(/^SCRIPT ERROR:|^ERROR:/.test(line)&&!fatal.includes(line)&&fatal.length<30)fatal.push(line);
   if(code===0&&!fatal.length&&!failure){void finish();return;}
   const nativeCode=failure?.code??code,hex=nativeCode===null?null:(nativeCode>>>0).toString(16).toUpperCase().padStart(8,'0');
   const log=path.join(path.dirname(paths.logPath),failure?.log??BUILD_STAGE_LOGS[lastStage]??path.basename(consoleLogPath));
   const reason=hex==='C0000005'?'Godot s’est arrêté brutalement (violation d’accès mémoire, 0xC0000005).':failure?`Godot a échoué (code ${nativeCode}, 0x${hex}).`:(fatal.join('\n')||text.replace(/\x1B\[[0-9;?]*[ -/]*[@-~]/g,'').trim()).slice(-2000);
   void finish(Error(`Build ${target==='windows'?'PC':'Android'} échoué${lastMessage?' — '+lastMessage.replace(/…$/,''):''}.\n${reason}\nJournal de l’étape : ${log}\nJournal complet : ${consoleLogPath}`));
  });
 });
 return inspectArtifact(root,target,started,false,previousRevision);
}

export async function simulateGameBuild(gameRoot:string,target:GameBuildTarget):Promise<GameBuildResult>{
 const started=Date.now(),root=await validGameRoot(gameRoot);if(!root)throw Error('Projet Godot Lunaria introuvable.');
 const paths=gameBuildPaths(root,target);await fs.mkdir(path.dirname(paths.artifact),{recursive:true});await fs.writeFile(paths.artifact,`Lunaria ${target} E2E\n`);
 return inspectArtifact(root,target,started,true);
}
