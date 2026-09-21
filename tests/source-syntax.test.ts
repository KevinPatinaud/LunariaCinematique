import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
/** Catches malformed TSX, which the pure model test configuration does not otherwise include.
 * Syntax only: npm run typecheck is still required with the actual React/Electron declarations.
 */
test('all Studio TS/TSX/CTS sources transpile without syntax errors',async()=>{
 const errors:string[]=[];
 async function walk(dir:string){for(const entry of await fs.readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);if(entry.isDirectory()){await walk(file);continue;}
  if(!/\.(ts|tsx|cts)$/.test(file)||/\.d\.ts$/.test(file))continue;
  const source=await fs.readFile(file,'utf8');const result=ts.transpileModule(source,{fileName:file,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}});
  for(const diagnostic of result.diagnostics??[])if(diagnostic.category===ts.DiagnosticCategory.Error)errors.push(file+': '+ts.flattenDiagnosticMessageText(diagnostic.messageText,' '));
 }}
 await walk(path.join(process.cwd(),'src'));assert.deepEqual(errors,[]);
});
