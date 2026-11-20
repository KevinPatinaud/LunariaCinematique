import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { playableCampaignSteps } from '../shared/game/campaign.js';
import { logicFilmIds } from '../shared/game/logic.js';
import type { WebPublicationResult } from '../shared/game/types.js';
import { parseGameProject } from '../shared/game/validation.js';
import { isWithin } from './files.js';
import { godotForBuild } from './gameBuild.js';
import { prepareLevelPreview } from './gamePreview.js';

const run = promisify(execFile);

export function firstWebLevel(value: unknown) {
  const project = parseGameProject(value);
  const step = playableCampaignSteps(project).find(step => step.kind === 'level');
  const level = step && project.levels.find(level => level.id === step.levelId);
  if (!step || !level) throw Error('Le parcours ne contient aucun niveau jouable à publier.');
  const isolated = { ...project, levels: [level], campaign: { steps: [step], cinematics: [] } };
  delete isolated.cinematics;
  if (logicFilmIds(isolated).length) throw Error('La démo ne prend pas en charge les films déclenchés pendant le combat. Retire ces déclencheurs pour publier ce niveau sur le Web.');
  return { project: isolated, level };
}

export async function validWebsite(candidate: string): Promise<string | null> {
  if (!path.isAbsolute(candidate)) return null;
  try {
    const root = await fs.realpath(candidate);
    const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
    if (manifest.name !== 'lunaria-web-vite') return null;
    for (const name of ['build-godot-demo.mjs', 'verify-godot-demo.mjs', 'publish-godot-demo.mjs']) {
      const file = await fs.realpath(path.join(root, 'tools', name));
      if (!isWithin(root, file) || !(await fs.stat(file)).isFile()) return null;
    }
    return root;
  } catch {
    return null;
  }
}

interface PublicationOptions {
  website: string;
  gameRoot: string;
  libraryRoot: string;
  godot: string;
  work: string;
  allowLive: boolean;
  confirm: (title: string, website: string, canPublishLive: boolean) => Promise<'local' | 'live' | null>;
}

export async function publishFirstWebLevel(value: unknown, options: PublicationOptions): Promise<WebPublicationResult | null> {
  const { project, level } = firstWebLevel(value);
  const godot = await godotForBuild(options.godot);
  if (!godot) throw Error('Godot est introuvable.');
  const website = await validWebsite(options.website);
  if (!website) throw Error('Choisis le dossier LunariaWebsite contenant les outils de publication Godot Web.');
  const node = process.platform === 'win32' ? 'node.exe' : 'node';
  await run(node, ['--version'], { windowsHide: true }).catch(() => { throw Error('Node.js est nécessaire pour lancer les outils de LunariaWebsite.'); });
  await fs.mkdir(options.work, { recursive: true });
  const folder = await fs.mkdtemp(path.join(options.work, 'publication-'));
  const bundle = path.join(folder, 'export');
  const logPath = path.join(folder, 'publication.log');
  const runTool = async (name: string, args: string[], env = process.env) => {
    try {
      const result = await run(node, [path.join(website, 'tools', name), ...args], {
        cwd: website, env, windowsHide: true, timeout: 900000, maxBuffer: 2 * 1024 * 1024,
      });
      await fs.appendFile(logPath, `${name} ${args[0] ?? ''}\n${result.stdout}${result.stderr}\n`);
      return result.stdout.trim();
    } catch (error) {
      const failure = error as Error & { stdout?: string; stderr?: string };
      await fs.appendFile(logPath, `${name}\n${failure.stdout ?? ''}${failure.stderr ?? failure.message}\n`);
      const detail = (failure.stderr?.trim() || failure.message).slice(-2500);
      throw Error(`${detail}\nJournal : ${logPath}`);
    }
  };

  const snapshot = await prepareLevelPreview(project, options.gameRoot, options.libraryRoot, folder, false);
  try {
    await runTool('build-godot-demo.mjs', [bundle], { ...process.env, LUNARIA_GAME_SOURCE: snapshot.gameRoot, GODOT_BIN: godot });
    await runTool('verify-godot-demo.mjs', [bundle]);
    const manifest = JSON.parse(await fs.readFile(path.join(bundle, 'manifest.json'), 'utf8'));
    if (manifest.levelId !== level.id || manifest.title !== level.title) throw Error('Le paquet ne correspond pas au premier niveau du projet ouvert.');
    const publisher = 'publish-godot-demo.mjs';
    const liveRevision = options.allowLive ? await runTool(publisher, ['--check-live'])
      .then(output => (JSON.parse(output) as { manifestSha256: string }).manifestSha256)
      .catch(() => undefined) : undefined;
    const target = await options.confirm(level.title, website, Boolean(liveRevision));
    if (!target) return null;
    if (target === 'live' && !liveRevision) throw Error('Le lecteur Godot Web n’est pas encore disponible sur le site public.');
    const args = target === 'live' ? ['--live', bundle, liveRevision!] : ['--local', bundle];
    const result = JSON.parse(await runTool(publisher, args)) as { path?: string; url?: string };
    return { ...result, title: level.title, target, logPath };
  } finally {
    await snapshot.dispose().catch(() => undefined);
    // Only the export produced under the unique publication directory is disposable.
    if (path.dirname(bundle) === folder && path.dirname(folder) === path.resolve(options.work)) {
      await fs.rm(bundle, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 }).catch(() => undefined);
    }
  }
}
