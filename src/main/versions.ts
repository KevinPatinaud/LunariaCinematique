import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { atomicJson, readJson } from './files.js';
import { parseCinematic } from '../shared/schema.js';
import { copy, type Cinematic, type LocalVersion, type VersionSummary } from '../shared/model.js';
const SAFE = /^[a-f0-9-]{32,64}$/i;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export const validVersionKey = (key:unknown):key is string => typeof key==='string' && SAFE.test(key);
export function fileVersionKey(file:string) {
  const resolved=path.resolve(file); return createHash('sha256').update(process.platform==='win32'?resolved.toLowerCase():resolved).digest('hex');
}
const digest=(doc:Cinematic)=>createHash('sha256').update(JSON.stringify(doc)).digest('hex');
const summary=({cinematic:_cinematic,...meta}:LocalVersion):VersionSummary=>meta;
/** JSON-only checkpoints in userData, not in the image library or exported game. */
export class VersionStore {
  private queue:Promise<unknown>=Promise.resolve();
  private lastAuto=new Map<string,number>();
  constructor(private readonly root:string, private readonly limit=20, private readonly clock:()=>number=Date.now) {}
  private serial<T>(fn:()=>Promise<T>) { const next=this.queue.then(fn,fn); this.queue=next.catch(()=>undefined); return next; }
  private directory(key:string) { if(!validVersionKey(key)) throw new Error('Identifiant de versions invalide.'); return path.join(this.root,key); }
  private filename(key:string,id:string) { if(!UUID.test(id)) throw new Error('Identifiant de version invalide.'); return path.join(this.directory(key),id+'.json'); }
  private async read(key:string,id:string):Promise<LocalVersion> {
    const file=this.filename(key,id); if((await fs.lstat(this.directory(key))).isSymbolicLink()) throw new Error('Dossier de versions symbolique refusé.'); if((await fs.lstat(file)).isSymbolicLink()) throw new Error('Lien symbolique de version refusé.');
    const v=await readJson(file,6*1024*1024) as Partial<LocalVersion>;
    if(v.id!==id || typeof v.createdAt!=='string' || !Number.isFinite(Date.parse(v.createdAt)) || typeof v.label!=='string' || typeof v.libraryRoot!=='string') throw new Error('Version locale endommagée.');
    const cinematic=copy(parseCinematic(v.cinematic));
    return {id,createdAt:v.createdAt,label:v.label.slice(0,120),title:cinematic.title,shots:cinematic.shots.length,libraryRoot:v.libraryRoot,cinematic};
  }
  private async entries(key:string):Promise<LocalVersion[]> {
    let names:string[];
    try {const directory=this.directory(key); if((await fs.lstat(directory)).isSymbolicLink()) throw new Error('Dossier de versions symbolique refusé.'); names=await fs.readdir(directory);}
    catch(e) {if((e as NodeJS.ErrnoException).code==='ENOENT') return []; throw e;}
    const records:LocalVersion[]=[];
    for(const name of names.filter(n=>n.endsWith('.json')&&UUID.test(n.slice(0,-5))).slice(0,1000)) {
      try {records.push(await this.read(key,name.slice(0,-5)));} catch { /* One corrupt checkpoint must not hide the remaining healthy ones. */ }
    }
    return records.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id));
  }
  list(key:string):Promise<VersionSummary[]> {return this.serial(async()=> (await this.entries(key)).map(summary));}
  load(key:string,id:string):Promise<LocalVersion> {return this.serial(()=>this.read(key,id));}
  create(key:string,input:Cinematic,libraryRoot:string,label:string,automatic=false,interval=30000):Promise<VersionSummary> {
    const cinematic=copy(parseCinematic(input)); if(typeof label!=='string' || label.length>120) throw new Error('Libellé de version invalide.');
    return this.serial(async()=>{
      const directory=this.directory(key), previous=await this.entries(key), latest=previous[0];
      const now=this.clock();
      if(automatic && latest && ((digest(latest.cinematic)===digest(cinematic) && latest.libraryRoot===libraryRoot) || now-(this.lastAuto.get(key)??Date.parse(latest.createdAt))<interval)) return summary(latest);
      const version:LocalVersion={id:randomUUID(),createdAt:new Date(Math.max(now,latest?Date.parse(latest.createdAt)+1:0)).toISOString(),label:label||'Version locale',title:cinematic.title,shots:cinematic.shots.length,libraryRoot,cinematic};
      await atomicJson(path.join(directory,version.id+'.json'),version);
      this.lastAuto.set(key,now);
      for(const old of previous.slice(Math.max(0,this.limit-1))) await fs.unlink(this.filename(key,old.id)).catch(e=>{if((e as NodeJS.ErrnoException).code!=='ENOENT') throw e;});
      return summary(version);
    });
  }
  /** Save As copies history, it never removes the original document's checkpoints. */
  fork(from:string,to:string):Promise<void> {
    return this.serial(async()=>{
      if(from===to) return; const source=await this.entries(from), destination=await this.entries(to), ids=new Set(destination.map(v=>v.id));
      for(const v of source) if(!ids.has(v.id)) await atomicJson(this.filename(to,v.id),v);
      const all=await this.entries(to); for(const old of all.slice(this.limit)) await fs.unlink(this.filename(to,old.id));
    });
  }
}
