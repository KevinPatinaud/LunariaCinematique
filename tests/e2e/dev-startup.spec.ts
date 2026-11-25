import { test, expect, _electron, type ElectronApplication } from '@playwright/test';
import { promises as fs } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('Electron launches against Vite dev server on a fallback port without CSP or IPC errors', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-dev-e2e-'));
  const profile = path.join(temp, 'profile');
  await fs.mkdir(profile, { recursive: true });

  const blocker = net.createServer();
  await new Promise<void>((resolve, reject) => {
    blocker.once('error', reject);
    blocker.listen(0, '127.0.0.1', () => resolve());
  });
  const blockedAddress = blocker.address();
  expect(blockedAddress && typeof blockedAddress === 'object').toBeTruthy();
  const blockedPort = (blockedAddress as net.AddressInfo).port;

  const vite = await createServer({
    configFile: path.join(ROOT, 'vite.config.ts'),
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: blockedPort },
  });

  let app: ElectronApplication | undefined;
  try {
    await vite.listen();
    const address = vite.httpServer?.address();
    expect(address && typeof address === 'object').toBeTruthy();
    const activePort = (address as net.AddressInfo).port;
    expect(activePort).not.toBe(blockedPort);
    const devUrl = `http://127.0.0.1:${activePort}`;

    const env = Object.fromEntries(
      Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
    delete env.ELECTRON_RUN_AS_NODE;

    app = await _electron.launch({
      args: [ROOT],
      env: { ...env, LUNARIA_E2E: '1', LUNARIA_TEST_USER_DATA: profile, LUNARIA_DEV_URL: devUrl },
    });
    const page = await app.firstWindow();
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.waitForURL(`${devUrl}/`);
    await expect(page.getByRole('button', { name: 'Vue du projet', exact: true })).toBeVisible();
    await expect(page.locator('.studio-sections').getByRole('button', { name: 'Campagne', exact: true })).toBeVisible();

    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp).toContain(`connect-src 'self' ws://127.0.0.1:${activePort};`);

    const bootstrap = await page.evaluate(async () => {
      const api = (window as unknown as { lunaria?: { bootstrap: () => Promise<{ desktop: boolean }> } }).lunaria;
      return api ? api.bootstrap() : null;
    });
    expect(bootstrap?.desktop).toBe(true);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    if (app) {
      const child = app.process();
      try {
        await app.evaluate(({ app: electronApp }) => {
          setTimeout(() => electronApp.exit(0), 0);
        });
      } catch {}
      await Promise.race([app.close().catch(() => {}), new Promise<void>(resolve => setTimeout(resolve, 5000))]);
      if (child.exitCode === null) child.kill();
    }
    await vite.close();
    await new Promise<void>(resolve => blocker.close(() => resolve()));
    await fs.rm(temp, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
});
