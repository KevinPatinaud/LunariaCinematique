import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
// Expand test files ourselves: works in PowerShell, cmd.exe and POSIX shells alike.
const files = readdirSync('dist-tests/tests').filter(name => name.endsWith('.test.js')).sort().map(name => `dist-tests/tests/${name}`);
if (!files.length) throw new Error('Aucun test compilé trouvé.');
const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
