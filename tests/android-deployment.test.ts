import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { androidPackageId, availableAndroidDevices, discoverAdb, parseAndroidDevices, runAndroidDeployment, type AdbCommand } from '../src/main/androidDeployment.js';
import type { GameBuildResult } from '../src/shared/game/types.js';

const preset='[preset.3]\nname="Android"\nplatform="Android"\n[preset.3.options]\npackage/unique_name="org.gardiensduvivant.game"\n';
async function fixture(run:(game:string,build:()=>Promise<GameBuildResult>,calls:string[][])=>Promise<void>){
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-deploy-')),game=path.join(root,'game'),calls:string[][]=[];
 await fs.mkdir(game);await fs.writeFile(path.join(game,'export_presets.cfg'),preset);
 const build=async()=>{calls.push(['BUILD']);const artifact=path.join(root,'build/android/Lunaria.apk');await fs.mkdir(path.dirname(artifact),{recursive:true});await fs.writeFile(artifact,'new APK');return {target:'android' as const,artifact,logPath:'build.log',sha256:'hash',bytes:7,durationMs:1,simulated:true};};
 try{await run(game,build,calls);}finally{await fs.rm(root,{recursive:true,force:true});}
}
function command(calls:string[][],devices='phone device model:OPPO_CPH2089'):AdbCommand{
 return async(_adb,args)=>{calls.push(args);if(args[0]==='devices')return devices;if(args.includes('getprop'))return 'arm64-v8a,armeabi-v7a';if(args.includes('install'))return 'Success';if(args.includes('resolve-activity'))return 'org.gardiensduvivant.game/org.godotengine.godot.GodotApp';if(args.includes('start'))return 'Status: ok';return '';};
}

test('device parser ignores daemon output and keeps model, authorization and emulator serials',()=>{
 assert.deepEqual(parseAndroidDevices('* daemon started successfully\nList of devices attached\nphone device product:p model:OPPO_CPH2089 transport_id:1\nusb unauthorized\nemulator-5554 offline\n'),[
  {serial:'phone',state:'device',name:'OPPO CPH2089'},{serial:'usb',state:'unauthorized',name:'usb'},{serial:'emulator-5554',state:'offline',name:'emulator-5554'}]);
 assert.throws(()=>availableAndroidDevices([]),/Aucun téléphone/);
 assert.throws(()=>availableAndroidDevices([{serial:'p',state:'unauthorized',name:'p'}]),/Autoriser le débogage USB/);
 assert.throws(()=>availableAndroidDevices([{serial:'p',state:'offline',name:'p'}]),/hors ligne/);
});

test('ADB discovery honors configured SDK then PATH and reports missing tools',()=>fixture(async game=>{
 const sdk=path.join(game,'sdk');await fs.mkdir(path.join(sdk,'platform-tools'),{recursive:true});await fs.writeFile(path.join(sdk,'platform-tools/adb.exe'),'');
 assert.equal(await discoverAdb({ANDROID_SDK_ROOT:sdk}),await fs.realpath(path.join(sdk,'platform-tools/adb.exe')));
 assert.equal(await discoverAdb({PATH:path.join(sdk,'platform-tools')}),await fs.realpath(path.join(sdk,'platform-tools/adb.exe')));
 await assert.rejects(discoverAdb({}),/ADB est introuvable/);
}));

test('Android package comes from its preset and rejects substitutions or unresolved names',()=>{
 assert.equal(androidPackageId(preset),'org.gardiensduvivant.game');
 assert.throws(()=>androidPackageId(preset.replace('org.gardiensduvivant.game','org.$genname')),/Identifiant Android invalide/);
 assert.throws(()=>androidPackageId(preset.replace('platform="Android"','platform="Windows Desktop"')),/Identifiant Android invalide/);
});

test('deployment checks ARM64 before build, installs the fresh APK on the same serial and confirms launch',()=>fixture(async(game,build,calls)=>{
 const phases:string[]=[],result=await runAndroidDeployment(game,build,{adb:'fake',command:command(calls),progress:progress=>phases.push(progress.phase)});
 assert.equal(result?.device.name,'OPPO CPH2089');assert.equal(result?.packageId,'org.gardiensduvivant.game');
 const install=calls.find(args=>args.includes('install'))!;
 assert.deepEqual(install,['-s','phone','install','-r',result!.artifact]);
 assert.ok(calls.findIndex(args=>args.includes('getprop'))<calls.findIndex(args=>args[0]==='BUILD'));
 assert.ok(calls.findIndex(args=>args[0]==='BUILD')<calls.findIndex(args=>args.includes('install')));
 assert.ok(calls.filter(args=>args[0]==='-s').every(args=>args[1]==='phone'));
 assert.deepEqual(phases,['device','install','launch']);
 assert.match(await fs.readFile(result!.deploymentLogPath,'utf8'),/Success/);
}));

test('absent or unauthorized phone prevents both build and installation',()=>fixture(async(game,build,calls)=>{
 for(const output of ['', 'phone unauthorized'])await assert.rejects(runAndroidDeployment(game,build,{adb:'fake',command:command(calls,output)}),/Aucun téléphone|non autorisé/);
 assert.ok(!calls.some(args=>args[0]==='BUILD'||args.includes('install')));
}));

test('unsupported architecture, failed build and disconnect each prevent installation',()=>fixture(async(game,build,calls)=>{
 const run=command(calls);
 await assert.rejects(runAndroidDeployment(game,build,{adb:'fake',command:async(a,args,t)=>args.includes('getprop')?'armeabi-v7a':run(a,args,t)}),/ARM64/);
 assert.ok(!calls.some(args=>args[0]==='BUILD'));
 await assert.rejects(runAndroidDeployment(game,async()=>{throw Error('Build failed');},{adb:'fake',command:run}),/Build failed/);
 let lists=0;
 await assert.rejects(runAndroidDeployment(game,build,{adb:'fake',command:async(a,args,t)=>args[0]==='devices'&&++lists>1?'other device':run(a,args,t)}),/déconnecté/);
 assert.ok(!calls.some(args=>args.includes('install')));
}));

test('multiple phones require selection and cancellation does not build',()=>fixture(async(game,build,calls)=>{
 const run=command(calls,'first device model:Premier\nsecond device model:Second');
 await assert.rejects(runAndroidDeployment(game,build,{adb:'fake',command:run}),/Plusieurs appareils/);
 assert.equal(await runAndroidDeployment(game,build,{adb:'fake',command:run,chooseDevice:async()=>null}),null);
 assert.ok(!calls.some(args=>args[0]==='BUILD'));
 const result=await runAndroidDeployment(game,build,{adb:'fake',command:run,chooseDevice:async devices=>devices[1]});
 assert.equal(result?.device.serial,'second');assert.ok(calls.filter(args=>args[0]==='-s').every(args=>args[1]==='second'));
}));

test('signature or install failures never uninstall or launch the existing application',()=>fixture(async(game,build,calls)=>{
 const run=command(calls);
 for(const failure of ['INSTALL_FAILED_UPDATE_INCOMPATIBLE','INSTALL_FAILED_INSUFFICIENT_STORAGE']){
  await assert.rejects(runAndroidDeployment(game,build,{adb:'fake',command:async(a,args,t)=>{if(args.includes('install')){calls.push(args);throw Error(failure);}return run(a,args,t);}}),/clé de signature|Installation Android échouée/);
 }
 assert.ok(!calls.some(args=>args.includes('uninstall')||args.includes('start')||args.includes('force-stop')));
}));

test('installation without Success and launch without Status ok cannot report deployment success',()=>fixture(async(game,build,calls)=>{
 const run=command(calls);
 await assert.rejects(runAndroidDeployment(game,build,{adb:'fake',command:async(a,args,t)=>args.includes('install')?'Failure':run(a,args,t)}),/Installation Android échouée/);
 await assert.rejects(runAndroidDeployment(game,build,{adb:'fake',command:async(a,args,t)=>args.includes('start')?'Error: Activity not started':run(a,args,t)}),/lancement a échoué/);
}));
