import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'vite';
import electron from 'electron';

const compile = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.main.json'], { stdio: 'inherit' });
if (compile.status !== 0) process.exit(compile.status || 1);

async function startDevServer() {
  const server = await createServer();
  try {
    await server.listen();
    return server;
  } catch (error) {
    await server.close().catch(() => undefined);
    if (error && typeof error === 'object' && 'code' in error && (error.code === 'EACCES' || error.code === 'EADDRINUSE')) {
      const fallback = await createServer({ server: { host: '127.0.0.1', port: 0, strictPort: false } });
      await fallback.listen();
      return fallback;
    }
    throw error;
  }
}

const server = await startDevServer();
const address = server.httpServer?.address();
if (!address || typeof address === 'string') {
  await server.close().catch(() => undefined);
  throw new Error('Unable to determine the Vite development server port.');
}
const devUrl = `http://127.0.0.1:${address.port}`;
console.log(`Lunaria Studio dev server ready on ${devUrl}`);

const childEnv = { ...process.env, LUNARIA_DEV_URL: devUrl };
delete childEnv.ELECTRON_RUN_AS_NODE;
const child = spawn(electron, ['.'], { stdio: 'inherit', env: childEnv });

let closing = false;
const closeServer = async () => {
  if (closing) return;
  closing = true;
  await server.close().catch(() => undefined);
};
const stop = async () => { child.kill(); await closeServer(); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
child.on('exit', async code => { await closeServer(); process.exit(code || 0); });
child.on('error', async error => { console.error(error); await closeServer(); process.exit(1); });
