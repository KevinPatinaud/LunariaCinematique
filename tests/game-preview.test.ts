import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {installedGodotExecutables,levelLaunchArguments,loadGamePreviewSettings,saveGamePreviewSettings,validGameRoot,validGodotExecutable,PREVIEW_PROFILE} from '../src/main/gamePreview.js';

async function temp(run:(root:string)=>Promise<void>){const root=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-preview-'));try{await run(root);}finally{await fs.rm(root,{recursive:true,force:true});}}
test('Godot launch arguments isolate the preview profile and select one level',()=>{
 const root=path.resolve('game-root'),args=levelLaunchArguments(root,'level_europe_01');
 assert.deepEqual(args,['--path',root,'--','--studio-level=level_europe_01',`--profile=${PREVIEW_PROFILE}`]);
 assert.throws(()=>levelLaunchArguments(root,'bad\nlevel'));
});
test('preview settings are bounded records rather than arbitrary JSON',()=>temp(async root=>{
 const file=path.join(root,'settings.json');assert.deepEqual(await loadGamePreviewSettings(file),{});
 await saveGamePreviewSettings(file,{gameRoot:path.join(root,'game'),godotPath:path.join(root,'godot.exe')});
 assert.deepEqual(await loadGamePreviewSettings(file),{gameRoot:path.join(root,'game'),godotPath:path.join(root,'godot.exe')});
 await fs.writeFile(file,'["unexpected"]');assert.deepEqual(await loadGamePreviewSettings(file),{});
}));
test('preview accepts only a real Lunaria game root and a regular executable',()=>temp(async root=>{
 const game=path.join(root,'game');for(const folder of ['app/controllers','domain/logic','domain/presentation'])await fs.mkdir(path.join(game,folder),{recursive:true});
 for(const marker of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd'])await fs.writeFile(path.join(game,...marker.split('/')),'marker');
 assert.equal(await validGameRoot(game),await fs.realpath(game));assert.equal(await validGameRoot(root),null);
 const executable=path.join(root,process.platform==='win32'?'godot.exe':'godot');await fs.writeFile(executable,'');
 assert.equal(await validGodotExecutable(executable),await fs.realpath(executable));assert.equal(await validGodotExecutable(game),null);
}));
test('installed Godot discovery prefers the windowed executable and ignores unrelated files',()=>temp(async root=>{
 for(const name of ['Godot_v4.7.2-stable_win64_console.exe','notes.txt','Godot_v4.7.2-stable_win64.exe'])await fs.writeFile(path.join(root,name),'');
 assert.deepEqual((await installedGodotExecutables(root)).map(file=>path.basename(file)),['Godot_v4.7.2-stable_win64.exe','Godot_v4.7.2-stable_win64_console.exe']);
}));
