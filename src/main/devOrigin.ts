/**
 * Validates the local Vite development origin passed by `scripts/dev.mjs`.
 * Always ignored in packaged builds; in development, only accepts an exact
 * `http://127.0.0.1:<port>` unprivileged loopback origin with no path, query,
 * fragment or credentials.
 */
export function parseDevOrigin(raw: string | undefined, isPackaged: boolean): string | undefined {
  if (isPackaged || !raw) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('Origine de développement non autorisée.');
  }
  const port = Number(parsed.port);
  const validPort = /^[1-9]\d{0,4}$/.test(parsed.port) && port >= 1024 && port <= 65535;
  const exactOrigin =
    parsed.protocol === 'http:' &&
    parsed.hostname === '127.0.0.1' &&
    validPort &&
    parsed.username === '' &&
    parsed.password === '' &&
    parsed.pathname === '/' &&
    parsed.search === '' &&
    parsed.hash === '' &&
    raw === parsed.origin;
  if (!exactOrigin) throw new Error('Origine de développement non autorisée.');
  return parsed.origin;
}
