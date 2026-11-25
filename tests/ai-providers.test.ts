import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  DEFAULT_GEMINI_IMAGE_MODELS,
  normalizeAiModel,
  normalizeAiProvider,
  providerLabel,
} from '../src/shared/aiProviders.js';
import { AiSettingsStore } from '../src/main/aiSettings.js';
import {
  adaptPromptForGemini,
  listGeminiImageModels,
  runGeminiImage,
} from '../src/main/geminiImageGeneration.js';

test('normalizeAiProvider and normalizeAiModel validate provider choices safely', () => {
  assert.equal(normalizeAiProvider(undefined), 'openai');
  assert.equal(normalizeAiProvider(''), 'openai');
  assert.equal(normalizeAiProvider('openai'), 'openai');
  assert.equal(normalizeAiProvider('gemini'), 'gemini');
  assert.throws(() => normalizeAiProvider('unknown'), /Fournisseur IA inconnu/);

  assert.equal(normalizeAiModel(undefined), undefined);
  assert.equal(normalizeAiModel('  '), undefined);
  assert.equal(normalizeAiModel('gemini-2.5-flash-image'), 'gemini-2.5-flash-image');
  assert.throws(() => normalizeAiModel('--evil flag'), /128 caractères/);
  assert.equal(providerLabel('openai'), 'OpenAI (Codex)');
  assert.equal(providerLabel('gemini'), 'Google Gemini');
});

test('AiSettingsStore encrypts, masks, prefers env key and clears Gemini key cleanly', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-ai-settings-'));
  try {
    const file = path.join(dir, 'ai-settings.json');
    const codec = {
      available: () => true,
      encrypt: (plain: string) => Buffer.from(`enc:${plain}`, 'utf8').toString('base64'),
      decrypt: (encoded: string) => Buffer.from(encoded, 'base64').toString('utf8').replace(/^enc:/, ''),
    };
    const store = new AiSettingsStore(file, codec, {}, async () => true);

    const initial = await store.status();
    assert.equal(initial.openai.available, true);
    assert.equal(initial.gemini.available, false);
    assert.equal(initial.gemini.hasStoredKey, false);

    await assert.rejects(() => store.setGeminiApiKey('bad key with spaces'), /ni espace/);

    const saved = await store.setGeminiApiKey('AIzaSyTestKey1234567890');
    assert.equal(saved.gemini.available, true);
    assert.equal(saved.gemini.hasStoredKey, true);
    assert.equal(saved.gemini.maskedHint, 'AIza…7890');
    assert.equal(await store.getGeminiApiKey(), 'AIzaSyTestKey1234567890');

    const rawFile = await fs.readFile(file, 'utf8');
    assert.ok(!rawFile.includes('AIzaSyTestKey1234567890'), 'Stored file must not contain plaintext key when codec is available');

    const envStore = new AiSettingsStore(file, codec, { GEMINI_API_KEY: 'AIzaEnvOverride9999' }, async () => false);
    assert.equal(await envStore.getGeminiApiKey(), 'AIzaEnvOverride9999');
    const envStatus = await envStore.status();
    assert.equal(envStatus.gemini.hasEnvKey, true);
    assert.equal(envStatus.gemini.maskedHint, 'AIza…9999');

    const cleared = await store.setGeminiApiKey('');
    assert.equal(cleared.gemini.available, false);
    assert.equal(cleared.gemini.hasStoredKey, false);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('adaptPromptForGemini strips Codex-only tool instructions while preserving art guidance', () => {
  const codexPrompt = [
    '$imagegen Crée une pose pour Radis.',
    'Utilise exclusivement l’outil natif image_gen / imagegen pour produire une vraie image.',
    'Conserve le style peint 2D et les feuilles de Radis.',
    'CONTRÔLE VISUEL : ouvre le vrai fichier avec view_image.',
    'Réponds selon le schéma JSON avec status=completed et imagePath.',
  ].join('\n\n');
  const adapted = adaptPromptForGemini(codexPrompt);
  assert.ok(adapted.includes('Crée une pose pour Radis.'));
  assert.ok(adapted.includes('Conserve le style peint 2D'));
  assert.ok(!adapted.includes('$imagegen'));
  assert.ok(!adapted.includes('view_image'));
  assert.ok(!adapted.includes('status=completed'));
});

test('listGeminiImageModels returns defaults without key and filters live image models with key', async () => {
  const withoutKey = await listGeminiImageModels(undefined);
  assert.equal(withoutKey.length, DEFAULT_GEMINI_IMAGE_MODELS.length);
  assert.equal(withoutKey[0].id, 'gemini-2.5-flash-image');

  let calledUrl = '';
  let calledKey = '';
  const mockFetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calledUrl = String(url);
    calledKey = (init?.headers as Record<string, string>)['x-goog-api-key'] ?? '';
    return new Response(JSON.stringify({
      models: [
        { name: 'models/gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/gemini-2.5-flash-image', displayName: 'Gemini 2.5 Flash Image', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/gemini-3-pro-image-preview', displayName: 'Gemini 3 Pro Image', supportedGenerationMethods: ['generateContent'] },
      ],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;

  const discovered = await listGeminiImageModels('AIzaMockKey', { fetchImpl: mockFetch });
  assert.ok(calledUrl.includes('/v1beta/models'));
  assert.equal(calledKey, 'AIzaMockKey');
  assert.deepEqual(discovered.map(m => m.id), ['gemini-2.5-flash-image', 'gemini-3-pro-image-preview']);
  assert.equal(discovered[0].isDefault, true);
});

test('runGeminiImage sends reference inlineData, writes returned PNG and masks errors', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-gemini-run-'));
  try {
    const input = path.join(dir, 'reference.png');
    await fs.writeFile(input, Buffer.from('mock-input-png'));
    const expectedOutput = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 4]);

    let capturedBody: Record<string, unknown> | undefined;
    const mockFetch = (async (_url: string | URL | Request, init?: RequestInit) => {
      capturedBody = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({
        candidates: [{
          finishReason: 'STOP',
          content: {
            parts: [
              { text: 'Voici la planche générée.' },
              { inlineData: { mimeType: 'image/png', data: expectedOutput.toString('base64') } },
            ],
          },
        }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }) as typeof fetch;

    const outputPath = await runGeminiImage({
      folder: dir,
      inputPath: input,
      model: 'gemini-2.5-flash-image',
      prompt: '$imagegen Génère une marche de Radis.',
      aspectRatio: '16:9',
      apiKey: 'AIzaSecretKey1234',
      signal: new AbortController().signal,
      fetchImpl: mockFetch,
    });

    assert.equal(outputPath, path.join(dir, 'gemini-output.png'));
    assert.deepEqual(await fs.readFile(outputPath), expectedOutput);
    assert.ok(capturedBody);
    const execMeta = await fs.readFile(path.join(dir, 'execution.json'), 'utf8');
    assert.ok(!execMeta.includes('AIzaSecretKey1234'), 'execution.json must never store API key');

    await assert.rejects(
      () => runGeminiImage({
        folder: dir,
        inputPath: input,
        prompt: 'test',
        apiKey: '',
        signal: new AbortController().signal,
        fetchImpl: mockFetch,
      }),
      /Clé API Gemini manquante/,
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { findAgyExecutable } from '../src/main/agyExecutable.js';
import {
  agyImageArguments,
  listAgyModels,
  parseAgyModelsOutput,
  runAgyImage,
} from '../src/main/agyImageGeneration.js';

function fakeChild(stdoutText: string, exitCode = 0): ChildProcessWithoutNullStreams {
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const stdin = new PassThrough();
  const child = new EventEmitter() as unknown as ChildProcessWithoutNullStreams;
  child.stdout = stdout;
  child.stderr = stderr;
  child.stdin = stdin;
  setImmediate(() => {
    if (stdoutText) stdout.write(stdoutText);
    stdout.end();
    stderr.end();
    child.emit('close', exitCode);
  });
  return child;
}

test('AiSettingsStore reports Gemini available without API key when Antigravity CLI is present', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-ai-cli-status-'));
  try {
    const store = new AiSettingsStore(path.join(dir, 'ai-settings.json'), undefined, {}, async () => false, async () => true);
    const status = await store.status();
    assert.equal(status.gemini.hasCli, true);
    assert.equal(status.gemini.available, true);
    assert.equal(status.gemini.hasStoredKey, false);
    assert.match(status.gemini.detail, /aucune clé API requise/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('parseAgyModelsOutput parses agy models table and picks Gemini default', () => {
  const output = [
    'Fetching available models...',
    'claude-opus-5-5-high\tClaude Opus 5.5 (High)',
    'gemini-4-neon-high\tGemini 4 Neon (High)',
    'gemini-3.8-flash-high\tGemini 3.8 Flash (High)',
  ].join('\n');
  const models = parseAgyModelsOutput(output);
  assert.equal(models.length, 3);
  assert.equal(models[0].id, 'gemini-4-neon-high');
  assert.equal(models[0].isDefault, true);
  assert.equal(models[0].label, 'Gemini 4 Neon (High)');
  assert.equal(models[2].id, 'claude-opus-5-5-high');
});

test('listAgyModels gives a French message when Antigravity times out', async () => {
  await assert.rejects(listAgyModels({
    findExecutable: async () => 'agy.exe',
    runModels: async () => { throw Object.assign(new Error('Command failed: agy.exe models'), { killed: true }); },
  }), { message: 'Antigravity met trop de temps à renvoyer les modèles Gemini.' });
});

test('findAgyExecutable locates agy binary from LOCALAPPDATA and PATH', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-agy-bin-'));
  try {
    const binName = process.platform === 'win32' ? 'agy.exe' : 'agy';
    const binDir = process.platform === 'win32' ? path.join(dir, 'agy', 'bin') : dir;
    await fs.mkdir(binDir, { recursive: true });
    const binPath = path.join(binDir, binName);
    await fs.writeFile(binPath, 'mock-binary');
    const found = await findAgyExecutable({
      env: process.platform === 'win32' ? { PATH: '', LOCALAPPDATA: dir } : { PATH: dir },
      readVersion: async () => '1.5.14',
    });
    assert.equal(found, await fs.realpath(binPath));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('runAgyImage stages image from conversation brain dir and refuses outside paths or reference echo', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-agy-run-'));
  try {
    const jobFolder = path.join(dir, 'job');
    const brainRoot = path.join(dir, 'brain');
    const convId = 'conv-12345678';
    const convBrain = path.join(brainRoot, convId);
    await fs.mkdir(jobFolder, { recursive: true });
    await fs.mkdir(convBrain, { recursive: true });

    const refPath = path.join(jobFolder, 'reference.png');
    await fs.writeFile(refPath, Buffer.from('ref-bytes'));
    const genPath = path.join(convBrain, 'radis_walk.jpg');
    const genBytes = Buffer.from([255, 216, 255, 224, 1, 2, 3, 4]);
    await fs.writeFile(genPath, genBytes);

    let capturedArgs: string[] = [];
    const staged = await runAgyImage({
      folder: jobFolder,
      inputPath: refPath,
      model: 'gemini-4-neon-high',
      prompt: 'Génère une marche de Radis.',
      aspectRatio: '16:9',
      signal: new AbortController().signal,
      executable: 'agy.exe',
      brainRoots: [brainRoot],
      launch: (_bin, args) => {
        capturedArgs = args;
        return fakeChild(JSON.stringify({
          conversation_id: convId,
          status: 'SUCCESS',
          structured_output: { status: 'completed', imagePath: genPath, message: 'ok' },
        }));
      },
    });

    assert.equal(staged, path.join(jobFolder, 'agy-output.jpg'));
    assert.deepEqual(await fs.readFile(staged), genBytes);
    assert.ok(capturedArgs.includes('--model') && capturedArgs.includes('gemini-4-neon-high'));
    assert.ok(agyImageArguments('schema.json', 'hello', 'gemini-4-neon-high').includes('--json-schema'));

    // Reject a file outside task folder and conversation brain dir
    const outsidePath = path.join(dir, 'outside.png');
    await fs.writeFile(outsidePath, Buffer.from('secret'));
    await assert.rejects(
      () => runAgyImage({
        folder: jobFolder,
        inputPath: refPath,
        prompt: 'test',
        signal: new AbortController().signal,
        executable: 'agy.exe',
        brainRoots: [brainRoot],
        launch: () => fakeChild(JSON.stringify({
          conversation_id: convId,
          status: 'SUCCESS',
          structured_output: { status: 'completed', imagePath: outsidePath, message: 'ok' },
        })),
      }),
      /hors des dossiers autorisés/,
    );

    // Reject echoing the input reference file
    await assert.rejects(
      () => runAgyImage({
        folder: jobFolder,
        inputPath: refPath,
        prompt: 'test',
        signal: new AbortController().signal,
        executable: 'agy.exe',
        brainRoots: [brainRoot],
        launch: () => fakeChild(JSON.stringify({
          conversation_id: convId,
          status: 'SUCCESS',
          structured_output: { status: 'completed', imagePath: refPath, message: 'ok' },
        })),
      }),
      /image de référence/,
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
