#!/usr/bin/env node
/** Run npm test first. Copy the shared *validator*, never a user's edited campaign. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const studio=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function main(){
 const arg=process.argv.indexOf('--game');
 if(arg<0||!process.argv[arg+1])throw new Error('Usage : node scripts/sync-game-contract.mjs --game chemin/du/game');
 const root=await fs.realpath(path.resolve(process.argv[arg+1]));
 await fs.access(path.join(root,'project.godot'));
 await fs.access(path.join(root,'content/design/game_content.gd'));
 await fs.mkdir(path.join(root,'tools/design'),{recursive:true});
 const destination=path.join(root,'tools/design/shared');
 await fs.rm(destination,{recursive:true,force:true});
 await fs.cp(path.join(studio,'dist-tests/src/shared'),destination,{recursive:true});
 for(const file of await fs.readdir(path.join(destination,'game'))){
  if(file.endsWith('.js'))await fs.writeFile(path.join(root,'tools/design',file),`// Generated forwarding module; edit Studio shared sources only.\nexport * from './shared/game/${file}';\n`);
 }
 await fs.copyFile(path.join(studio,'schema/game-project.schema.json'),path.join(root,'content/design/game-project.schema.json'));
 console.log('Contrat copié. Le projet game_content.json n’a pas été modifié. Exécuter les tests Node et Godot avant publication.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
