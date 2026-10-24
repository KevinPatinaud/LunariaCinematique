import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { queryCodexModels } from '../src/main/codexModels.js';

async function fakeCodex(script: string, run: (launch: (executable: string, args: string[]) => ChildProcessWithoutNullStreams) => Promise<void>) {
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-model-discovery-'));
  const scriptPath = path.join(folder, 'server.cjs');
  await fs.writeFile(scriptPath, `const send = value => process.stdout.write(JSON.stringify(value) + '\\n');
require('node:readline').createInterface({input:process.stdin}).on('line', line => {
const message = JSON.parse(line);
if (!['initialize','initialized','model/list'].includes(message.method)) process.exit(8);
${script}
});`);
  const children: ChildProcessWithoutNullStreams[] = [], closed: Promise<void>[] = [];
  try {
    await run((_executable, args) => {
      assert.deepEqual(args.slice(0, 5), ['app-server', '--listen', 'stdio://', '-c', 'model_provider="openai"']);
      const child = spawn(process.execPath, [scriptPath], { windowsHide: true, stdio: ['pipe','pipe','pipe'] });
      children.push(child); closed.push(new Promise(resolve => child.on('close', () => resolve())));
      return child;
    });
  } finally {
    for (const child of children) if (child.exitCode === null) child.kill();
    await Promise.all(closed); await fs.rm(folder, { recursive: true, force: true });
  }
}

test('discovers all pages using model identifiers, excluding hidden and text-only models', () => fakeCodex(`
if (message.method === 'initialize') {
  if (message.params.clientInfo.name !== 'lunaria_studio') process.exit(9);
  send({id:message.id,result:{}});
}
if (message.method === 'model/list') {
  if (message.params.includeHidden !== false) process.exit(10);
  if (!message.params.cursor) send({id:message.id,result:{data:[
    {id:'catalog-id',model:'vision-a',displayName:'Vision A',description:'First',inputModalities:['text','image'],isDefault:true},
    {model:'secret',hidden:true}, {model:'text-only',inputModalities:['text']}, {model:'--bad'}
  ],nextCursor:'page-2'}});
  else send({id:message.id,result:{data:[{model:'vision-a',displayName:'Vision A',description:'First',isDefault:true},{model:'legacy',displayName:'Older model'}],nextCursor:null}});
}`, async launch => {
  assert.deepEqual(await queryCodexModels('fake', { launch }), [
    { id:'vision-a',label:'Vision A',description:'First',isDefault:true },
    { id:'legacy',label:'Older model',description:'',isDefault:false },
  ]);
}));

test('handles fragmented UTF-8 protocol output and an empty catalog', () => fakeCodex(`
if (message.method === 'initialize') send({id:message.id,result:{}});
if (message.method === 'model/list') {
  process.stdout.write('log ignored\\n');
  const data = Buffer.from(JSON.stringify({id:message.id,result:{data:[],nextCursor:null}})+'\\n');
  process.stdout.write(data.subarray(0,9));setTimeout(()=>process.stdout.write(data.subarray(9)),10);
}`, async launch => assert.deepEqual(await queryCodexModels('fake', { launch }), [])));

test('rejects an RPC error without leaking its diagnostics or returning fabricated models', () => fakeCodex(`
send({id:message.id,error:{message:'sensitive diagnostic'}});
`, async launch => {
  await assert.rejects(queryCodexModels('fake', { launch }), error => error instanceof Error && /connexion/.test(error.message) && !error.message.includes('sensitive'));
}));

test('bounds stalled discovery and closes its process', () => fakeCodex('', async launch => {
  await assert.rejects(queryCodexModels('fake', { launch, timeoutMs: 100 }), /trop de temps/);
}));

test('rejects malformed and looping model pages', async () => {
  for (const result of [{data:'invalid'}, {data:[],nextCursor:'repeat'}]) {
    await fakeCodex(`
if(message.method === 'initialize') send({id:message.id,result:{}});
if(message.method === 'model/list') send({id:message.id,result:${JSON.stringify(result)}});
`, async launch => { await assert.rejects(queryCodexModels('fake', { launch }), /illisible|pagination/); });
  }
});
