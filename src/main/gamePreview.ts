import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn, type ChildProcess, type SpawnOptions } from 'node:child_process';
import { atomicJson, isWithin, readJson } from './files.js';

const GAME_MARKERS=['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd'];
export const PREVIEW_PROFILE='user://lunaria-studio-preview.json';
export interface GamePreviewSettings {gameRoot?:string;godotPath?:string}
export interface GamePreviewResult {path:string;levelId:string;title:string;gameRoot:string;executable:string;simulated:boolean}

export async function validGameRoot(candidate:unknown):Promise<string|null>{
 if(typeof candidate!=='string'||!path.isAbsolute(candidate))return null;
 try{
  const root=await fs.realpath(candidate);if(!(await fs.stat(root)).isDirectory())return null;
  for(const marker of GAME_MARKERS){const found=await fs.realpath(path.join(root,...marker.split('/')));if(!isWithin(root,found)||(await fs.stat(found)).isDirectory())return null;}
  return root;
 }catch{return null;}
}
export async function validGodotExecutable(candidate:unknown):Promise<string|null>{
 if(typeof candidate!=='string'||!path.isAbsolute(candidate))return null;
 try{const real=await fs.realpath(candidate),stat=await fs.stat(real);if(!stat.isFile()||process.platform==='win32'&&path.extname(real).toLowerCase()!=='.exe')return null;return real;}catch{return null;}
}
export async function loadGamePreviewSettings(file:string):Promise<GamePreviewSettings>{
 try{const value=await readJson(file);if(!value||typeof value!=='object'||Array.isArray(value))return{};const v=value as Record<string,unknown>;return{gameRoot:typeof v.gameRoot==='string'?v.gameRoot:undefined,godotPath:typeof v.godotPath==='string'?v.godotPath:undefined};}catch{return{};}
}
export async function saveGamePreviewSettings(file:string,value:GamePreviewSettings):Promise<void>{await atomicJson(file,{gameRoot:value.gameRoot??'',godotPath:value.godotPath??''});}
export async function installedGodotExecutables(directory:string):Promise<string[]>{
 if(!path.isAbsolute(directory))return[];
 try{
  const entries=await fs.readdir(directory,{withFileTypes:true});
  return entries.filter(entry=>entry.isFile()&&/^Godot.*\.exe$/i.test(entry.name))
   .sort((a,b)=>Number(/_console\.exe$/i.test(a.name))-Number(/_console\.exe$/i.test(b.name))||b.name.localeCompare(a.name))
   .map(entry=>path.join(directory,entry.name));
 }catch{return[];}
}
export async function discoverGodot(candidates:(string|undefined)[]):Promise<string|null>{for(const candidate of candidates){const valid=await validGodotExecutable(candidate);if(valid)return valid;}return null;}
export function levelLaunchArguments(gameRoot:string,levelId:string):string[]{
 if(!path.isAbsolute(gameRoot)||typeof levelId!=='string'||!levelId.trim()||levelId.length>200||/[\x00-\x1f]/.test(levelId))throw Error('Niveau de test invalide.');
 return['--path',gameRoot,'--',`--studio-level=${levelId}`,`--profile=${PREVIEW_PROFILE}`];
}
type SpawnLike=(command:string,args:string[],options:SpawnOptions)=>ChildProcess;
export async function launchGodotLevel(executable:string,gameRoot:string,levelId:string,start:SpawnLike=spawn):Promise<void>{
 const command=await validGodotExecutable(executable);if(!command)throw Error('Exécutable Godot introuvable.');
 const root=await validGameRoot(gameRoot);if(!root)throw Error('Projet Godot Lunaria introuvable.');
 const args=levelLaunchArguments(root,levelId);
 await new Promise<void>((resolve,reject)=>{
  const child=start(command,args,{cwd:root,detached:true,stdio:'ignore',windowsHide:false});
  const failed=(error:Error)=>reject(new Error('Godot n’a pas pu démarrer : '+error.message));
  child.once('error',failed);child.once('spawn',()=>{child.removeListener('error',failed);child.on('error',()=>undefined);child.unref();resolve();});
 });
}
