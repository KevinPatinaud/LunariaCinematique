import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { findCodexExecutable } from './codexExecutable.js';
import { normalizeCodexModel, type CodexModelOption } from '../shared/backgroundCorrection.js';

type Launcher = (executable: string, args: string[]) => ChildProcessWithoutNullStreams;
const launch: Launcher = (executable, args) => {
  const env = { ...process.env }; delete env.OPENAI_API_KEY; delete env.CODEX_API_KEY;
  return spawn(executable, args, { env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
};

/** Read only: no thread, inference turn or change to the user's Codex settings. */
export function queryCodexModels(executable: string, options: { launch?: Launcher; timeoutMs?: number } = {}): Promise<CodexModelOption[]> {
  return new Promise((resolve, reject) => {
    // Generation uses Codex's native OpenAI provider, independently of the
    // provider selected in user config. Use the same provider for discovery.
    const child = (options.launch ?? launch)(executable, ['app-server', '--listen', 'stdio://', '-c', 'model_provider="openai"', '--disable', 'apps', '--disable', 'plugins', '--disable', 'memories']);
    let settled = false, pending = '', received = 0, expectedId = 1;
    const models = new Map<string, CodexModelOption>(), cursors = new Set<string>();
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      child.stdin.end(); child.kill();
      if (error) reject(error); else resolve([...models.values()]);
    };
    const timer = setTimeout(() => finish(new Error('Codex met trop de temps à répondre. Actualise la liste pour réessayer.')), options.timeoutMs ?? 15000);
    const send = (message: object) => child.stdin.write(JSON.stringify(message) + '\n');
    const list = (cursor?: string) => send({ id: ++expectedId, method: 'model/list', params: { limit: 100, includeHidden: false, ...(cursor ? { cursor } : {}) } });
    child.stdin.on('error', () => finish(new Error('La connexion à Codex a été interrompue. Actualise la liste.')));
    child.on('error', () => finish(new Error('Impossible de démarrer Codex pour détecter les modèles.')));
    child.on('close', () => finish(new Error('Codex s’est arrêté avant de renvoyer la liste des modèles.')));
    // Never forward diagnostics or account data to the renderer.
    child.stderr.resume(); child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      if (settled) return;
      received += chunk.length;
      if (received > 2_000_000) { finish(new Error('La réponse de Codex est trop volumineuse.')); return; }
      pending += chunk;
      const lines = pending.split('\n'); pending = lines.pop() ?? '';
      for (const line of lines) {
        if (settled || !line.trim()) continue;
        let response;
        try { response = JSON.parse(line); } catch { continue; }
        if (response?.id !== expectedId) continue;
        if (response.error) { finish(new Error('Codex n’a pas pu fournir ses modèles. Vérifie sa connexion ou mets Codex CLI à jour, puis actualise la liste.')); return; }
        if (expectedId === 1) { send({ method: 'initialized' }); list(); continue; }
        const result = response.result;
        if (!result || !Array.isArray(result.data)) { finish(new Error('La liste des modèles renvoyée par Codex est illisible.')); return; }
        for (const item of result.data) {
          if (!item || typeof item !== 'object' || item.hidden === true) continue;
          // The attached reference needs vision. Older catalogs omit this field.
          if (Array.isArray(item.inputModalities) && !item.inputModalities.includes('image')) continue;
          let id: string | undefined;
          try { id = normalizeCodexModel(item.model ?? item.id); } catch { continue; }
          if (!id) continue;
          models.set(id, { id, label: typeof item.displayName === 'string' ? item.displayName.slice(0, 160) || id : id, description: typeof item.description === 'string' ? item.description.slice(0, 500) : '', isDefault: item.isDefault === true });
        }
        const cursor = result.nextCursor;
        if (cursor == null) { finish(); return; }
        if (typeof cursor !== 'string' || !cursor || cursors.has(cursor) || cursors.size >= 20) { finish(new Error('La pagination des modèles Codex est invalide.')); return; }
        cursors.add(cursor); list(cursor);
      }
    });
    send({ id: expectedId, method: 'initialize', params: { clientInfo: { name: 'lunaria_studio', title: 'Lunaria Studio', version: '1.10.0' } } });
  });
}

let inFlight: Promise<CodexModelOption[]> | undefined;
export function listCodexModels(): Promise<CodexModelOption[]> {
  // Several open jobs can request the same discovery; refreshes after it ends
  // always create a fresh connection, with Codex's current login and catalog.
  if (!inFlight) inFlight = findCodexExecutable().then(executable => queryCodexModels(executable)).finally(() => { inFlight = undefined; });
  return inFlight;
}
