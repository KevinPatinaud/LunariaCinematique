import { createHash } from 'node:crypto';
import { createReadStream, promises as fs } from 'node:fs';
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

async function inspectArtifact(gameRoot:string,target:GameBuildTarget,started:number,simulated:boolean):Promise<GameBuildResult>{
 const paths=gameBuildPaths(gameRoot,target),stat=await fs.stat(paths.artifact).catch(()=>null);
 if(!stat?.isFile()||stat.size===0)throw Error(`Le build ${target==='windows'?'PC':'Android'} n’a produit aucun fichier.`);
 return{target,artifact:paths.artifact,logPath:paths.logPath,sha256:await sha256(paths.artifact),bytes:stat.size,durationMs:Date.now()-started,simulated};
}

type SpawnLike=(command:string,args:string[],options:SpawnOptions)=>ChildProcess;
export async function runGameBuild(gameRoot:string,godotExecutable:string,target:GameBuildTarget,start:SpawnLike=spawn):Promise<GameBuildResult>{
 if(process.platform!=='win32')throw Error('Les builds PC et Android de Lunaria sont configurés pour Windows.');
 const started=Date.now(),root=await validGameRoot(gameRoot);if(!root)throw Error('Projet Godot Lunaria introuvable.');
 const godot=await godotForBuild(godotExecutable);if(!godot)throw Error('Exécutable Godot introuvable.');
 const paths=gameBuildPaths(root,target),script=await fs.realpath(paths.script).catch(()=>null);
 if(!script||!isWithin(paths.repositoryRoot,script)||(await fs.stat(script)).isDirectory())throw Error('Script de build Lunaria introuvable dans tools/build/build.ps1.');
 const systemRoot=process.env.SystemRoot??'C:\\Windows',powershell=path.join(systemRoot,'System32','WindowsPowerShell','v1.0','powershell.exe');
 if(!(await fs.stat(powershell).catch(()=>null))?.isFile())throw Error('Windows PowerShell est introuvable.');
 await new Promise<string>((resolve,reject)=>{
  const child=start(powershell,['-NoLogo','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',script,'-Target',paths.powershellTarget,'-Godot',godot],{cwd:paths.repositoryRoot,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let text='';const append=(chunk:unknown)=>{text=(text+String(chunk)).slice(-120000);};
  child.stdout?.on('data',append);child.stderr?.on('data',append);
  const timer=setTimeout(()=>{child.kill();reject(Error('Le build a dépassé vingt minutes et a été interrompu.'));},20*60*1000);
  child.once('error',error=>{clearTimeout(timer);reject(Error('Impossible de démarrer le build : '+error.message));});
  child.once('close',code=>{clearTimeout(timer);const clean=text.replace(/\x1B\[[0-9;?]*[ -/]*[@-~]/g,''),fatal=clean.split(/\r?\n/).filter(line=>/^SCRIPT ERROR:|^ERROR:/.test(line));if(code===0&&!fatal.length)resolve(clean);else reject(Error(`Build ${target==='windows'?'PC':'Android'} échoué.\n${(fatal.join('\n')||clean.trim()).slice(-5000)}\nJournal : ${paths.logPath}`));});
 });
 return inspectArtifact(root,target,started,false);
}

export async function simulateGameBuild(gameRoot:string,target:GameBuildTarget):Promise<GameBuildResult>{
 const started=Date.now(),root=await validGameRoot(gameRoot);if(!root)throw Error('Projet Godot Lunaria introuvable.');
 const paths=gameBuildPaths(root,target);await fs.mkdir(path.dirname(paths.artifact),{recursive:true});await fs.writeFile(paths.artifact,`Lunaria ${target} E2E\n`);
 return inspectArtifact(root,target,started,true);
}
