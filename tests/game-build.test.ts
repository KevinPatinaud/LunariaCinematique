import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gameBuildPaths, godotForBuild, simulateGameBuild } from '../src/main/gameBuild.js';

async function temp(run:(root:string)=>Promise<void>){const root=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-build-'));try{await run(root);}finally{await fs.rm(root,{recursive:true,force:true});}}
async function fakeGame(root:string){const game=path.join(root,'game');for(const folder of ['app/controllers','domain/logic','domain/presentation'])await fs.mkdir(path.join(game,folder),{recursive:true});for(const marker of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd'])await fs.writeFile(path.join(game,...marker.split('/')),'marker');return game;}

test('build paths stay in the repository build and log directories',()=>{
 const game=path.resolve('repository','game'),windows=gameBuildPaths(game,'windows'),android=gameBuildPaths(game,'android');
 assert.equal(windows.artifact,path.resolve('repository','build','windows','Lunaria.exe'));
 assert.equal(android.artifact,path.resolve('repository','build','android','Lunaria.apk'));
 assert.equal(windows.script,path.resolve('repository','tools','build','build.ps1'));
 assert.equal(android.powershellTarget,'Android');
});

test('simulated native build returns a nonempty artifact and its SHA-256',()=>temp(async root=>{
 const game=await fakeGame(root),result=await simulateGameBuild(game,'android');
 assert.equal(result.artifact,path.join(root,'build','android','Lunaria.apk'));assert.equal(result.simulated,true);assert.equal(result.sha256.length,64);
 assert.match(await fs.readFile(result.artifact,'utf8'),/Lunaria android E2E/);
}));

test('Windows builds prefer the adjacent Godot console executable',()=>temp(async root=>{
 const windowed=path.join(root,'Godot_v4.7.2-stable_win64.exe'),consolePath=path.join(root,'Godot_v4.7.2-stable_win64_console.exe');await fs.writeFile(windowed,'');await fs.writeFile(consolePath,'');
 assert.equal(await godotForBuild(windowed),process.platform==='win32'?await fs.realpath(consolePath):await fs.realpath(windowed));
}));
