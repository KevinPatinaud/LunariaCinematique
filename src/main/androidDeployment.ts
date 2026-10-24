import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { AndroidDevice, AndroidDeploymentProgress, AndroidDeploymentResult, GameBuildResult } from '../shared/game/types.js';

export type AdbCommand=(executable:string,args:string[],timeoutMs:number)=>Promise<string>;
interface DeploymentOptions {
 adb?:string;
 command?:AdbCommand;
 chooseDevice?:(devices:AndroidDevice[])=>Promise<AndroidDevice|null>;
 progress?:(progress:AndroidDeploymentProgress)=>void;
}

export function parseAndroidDevices(output:string):AndroidDevice[]{
 return output.split(/\r?\n/).flatMap(line=>{
  const match=/^(\S+)\s+(device|unauthorized|offline|no permissions)\b(.*)$/.exec(line.trim());
  if(!match)return [];
  const model=/\bmodel:(\S+)/.exec(match[3])?.[1].replaceAll('_',' ');
  return [{serial:match[1],state:match[2],name:model??match[1]}];
 });
}

export function availableAndroidDevices(devices:AndroidDevice[]):AndroidDevice[]{
 const ready=devices.filter(device=>device.state==='device');
 if(ready.length)return ready;
 if(devices.some(device=>device.state==='unauthorized'))throw Error('Téléphone non autorisé. Déverrouille le téléphone et accepte « Autoriser le débogage USB », puis réessaie.');
 if(devices.length)throw Error('Le téléphone est hors ligne ou inaccessible. Rebranche le câble USB, vérifie le débogage USB, puis réessaie.');
 throw Error('Aucun téléphone Android connecté. Branche le téléphone en USB, active le débogage USB et autorise cet ordinateur sur son écran, puis réessaie.');
}

export async function discoverAdb(env:NodeJS.ProcessEnv=process.env):Promise<string>{
 const candidates=[env.ANDROID_SDK_ROOT,env.ANDROID_HOME,env.LOCALAPPDATA?path.join(env.LOCALAPPDATA,'Android','Sdk'):undefined]
  .filter((value):value is string=>!!value).map(sdk=>path.join(sdk,'platform-tools','adb.exe'));
 for(const folder of (env.PATH??env.Path??'').split(path.delimiter))if(folder)candidates.push(path.join(folder.replace(/^"|"$/g,''),'adb.exe'));
 for(const candidate of candidates){const stat=await fs.stat(candidate).catch(()=>null);if(stat?.isFile())return fs.realpath(candidate);}
 throw Error('ADB est introuvable. Installe les Android SDK Platform-Tools dans le SDK Android ou ajoute adb au PATH, puis relance le Studio.');
}

export const runAdb:AdbCommand=(executable,args,timeoutMs)=>new Promise((resolve,reject)=>{
 const child=spawn(executable,args,{windowsHide:true,stdio:['ignore','pipe','pipe']});
 let output='',settled=false;
 const append=(chunk:unknown)=>{output=(output+String(chunk)).slice(-120000);};
 child.stdout?.on('data',append);child.stderr?.on('data',append);
 const finish=(error?:Error)=>{if(settled)return;settled=true;clearTimeout(timer);if(error)reject(error);else resolve(output.trim());};
 const timer=setTimeout(()=>{child.kill();finish(Error('Le téléphone ne répond plus. Vérifie la connexion USB puis réessaie.'));},timeoutMs);
 child.once('error',error=>finish(Error('Impossible de démarrer ADB : '+error.message)));
 child.once('close',code=>finish(code===0?undefined:Error(output.trim()||`ADB a échoué (code ${code}).`)));
});

export function androidPackageId(presets:string):string{
 const sections=new Map<string,string>();let section='';
 for(const line of presets.split(/\r?\n/)){const header=/^\[([^\]]+)\]$/.exec(line.trim());if(header)section=header[1];else sections.set(section,(sections.get(section)??'')+line+'\n');}
 const preset=[...sections].find(([name,text])=>/^preset\.\d+$/.test(name)&&/^platform="Android"\s*$/m.test(text))?.[0];
 const id=preset?/^package\/unique_name="([^"]+)"\s*$/m.exec(sections.get(preset+'.options')??'')?.[1]:undefined;
 if(!id||! /^[a-zA-Z][\w]*(?:\.[a-zA-Z][\w]*)+$/.test(id))throw Error('Identifiant Android invalide dans game/export_presets.cfg.');
 return id;
}

export async function runAndroidDeployment(gameRoot:string,build:()=>Promise<GameBuildResult>,options:DeploymentOptions={}):Promise<AndroidDeploymentResult|null>{
 const progress=options.progress??(()=>{}),command=options.command??runAdb;
 const logPath=path.resolve(gameRoot,'..','tools','build','.local','lunaria-android-deploy.log');
 const log:string[]=[`Déploiement Android ${new Date().toISOString()}`];
 const invoke=async(adb:string,args:string[],timeoutMs=30000)=>{log.push('adb '+args.join(' '));try{const output=await command(adb,args,timeoutMs);log.push(output);return output;}catch(error){log.push(String(error));throw error;}};
 try{
  progress({phase:'device',message:'Vérification du téléphone connecté…'});
  const adb=options.adb??await discoverAdb();
  const devices=availableAndroidDevices(parseAndroidDevices(await invoke(adb,['devices','-l'])));
  let device:AndroidDevice|null;
  if(devices.length===1)device=devices[0];
  else if(options.chooseDevice)device=await options.chooseDevice(devices);
  else throw Error('Plusieurs appareils Android sont connectés. Choisis un téléphone ou déconnecte les autres appareils.');
  if(!device)return null;
  if(!devices.some(item=>item.serial===device!.serial))throw Error('Téléphone sélectionné invalide.');
  const args=['-s',device.serial];
  const abis=await invoke(adb,[...args,'shell','getprop','ro.product.cpu.abilist']);
  if(!abis.split(',').map(abi=>abi.trim()).includes('arm64-v8a'))throw Error('Ce téléphone ne prend pas en charge ARM64. L’APK Lunaria nécessite un appareil Android ARM64.');
  const packageId=androidPackageId(await fs.readFile(path.join(gameRoot,'export_presets.cfg'),'utf8'));
  const result=await build();
  const artifact=path.resolve(gameRoot,'..','build','android','Lunaria.apk');
  if(result.target!=='android'||path.resolve(result.artifact)!==artifact||!(await fs.stat(artifact)).size)throw Error('Le build n’a pas produit l’APK Android attendu.');
  // Keep the selected serial throughout: never fall back to another connected device.
  const current=parseAndroidDevices(await invoke(adb,['devices','-l'])).find(item=>item.serial===device!.serial);
  if(!current||current.state!=='device')throw Error('Le téléphone sélectionné a été déconnecté ou n’est plus autorisé. Rebranche-le puis réessaie.');
  progress({phase:'install',message:`Installation de Lunaria sur ${device.name}…`});
  try{
   const installed=await invoke(adb,[...args,'install','-r',artifact],5*60*1000);
   if(!/^Success\s*$/m.test(installed))throw Error(installed||'ADB n’a pas confirmé l’installation.');
  }catch(error){
   const reason=String(error);
   if(/INSTALL_FAILED_UPDATE_INCOMPATIBLE/.test(reason))throw Error('Installation refusée : la version du téléphone utilise une autre clé de signature. Utilise la clé ayant signé cette installation. Aucune désinstallation automatique n’a été effectuée.');
   throw Error('Installation Android échouée : '+reason);
  }
  progress({phase:'launch',message:`Lancement de Lunaria sur ${device.name}…`});
  const resolved=await invoke(adb,[...args,'shell','cmd','package','resolve-activity','--brief',packageId]);
  const activity=resolved.split(/\r?\n/).map(line=>line.trim()).find(line=>line.startsWith(packageId+'/')&&/^[\w.]+\/[\w.$]+$/.test(line));
  if(!activity)throw Error('Lunaria est installé, mais son activité de lancement est introuvable. Ouvre le jeu depuis le téléphone.');
  await invoke(adb,[...args,'shell','am','force-stop',packageId]);
  const launched=await invoke(adb,[...args,'shell','am','start','-W','-n',activity]);
  if(!/^Status: ok\s*$/m.test(launched)||/^Error:/m.test(launched))throw Error('Lunaria est installé, mais son lancement a échoué. '+launched);
  return {...result,device,packageId,deploymentLogPath:logPath};
 }catch(error){
  log.push(String(error));
  throw Error(`${error instanceof Error?error.message:String(error)}\nJournal : ${logPath}`);
 }finally{
  await fs.mkdir(path.dirname(logPath),{recursive:true});await fs.writeFile(logPath,log.join('\n')+'\n','utf8');
 }
}
