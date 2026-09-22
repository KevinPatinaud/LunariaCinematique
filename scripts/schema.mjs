import { writeFile } from 'node:fs/promises';
import { cinematicSchema } from '../dist-tests/src/shared/schema.js';
const json = JSON.stringify(cinematicSchema, null, 2) + '\n';
await writeFile('docs/cinematic.schema.json', json);
await writeFile('godot/addons/lunaria_cinematics/cinematic.schema.json', json);
console.log('Schéma généré : docs/cinematic.schema.json');

const { GAME_SCHEMA } = await import('../dist-tests/src/shared/game/schema.js');
await writeFile('schema/game-project.schema.json', JSON.stringify(GAME_SCHEMA,null,2)+'\n');
console.log('Schéma généré : schema/game-project.schema.json');
