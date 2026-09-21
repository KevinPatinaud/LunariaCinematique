import {promises as fs} from 'node:fs';
import {resolveAsset} from './files.js';
import type {GameProject} from '../shared/game/types.js';
import type {SpriteSource} from '../shared/presentation/types.js';
/** Bounded header reader, no browser/Electron mock needed for Node preflight. */
export function imageDimensions(b:Buffer):{width:number;height:number}{
 if(b.length>=24&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
 if(b.length>=30&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'){
  const kind=b.toString('ascii',12,16);if(kind==='VP8X')return {width:1+b.readUIntLE(24,3),height:1+b.readUIntLE(27,3)};
  if(kind==='VP8 '&&b.length>=30)return {width:b.readUInt16LE(26)&0x3fff,height:b.readUInt16LE(28)&0x3fff};
  if(kind==='VP8L'&&b.length>=25){const n=b.readUInt32LE(21);return {width:1+(n&0x3fff),height:1+((n>>>14)&0x3fff)};}
 }
 if(b.length>4&&b.readUInt16BE(0)===0xffd8){let i=2;while(i+4<=b.length){if(b[i++]!==255)continue;while(i<b.length&&b[i]===255)i++;const marker=b[i++];if(marker===217||marker===218)break;if(marker===216||marker===1||marker>=208&&marker<=215)continue;if(i+2>b.length)break;const n=b.readUInt16BE(i);if(n<2||i+n>b.length)break;if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)&&n>=7)return {height:b.readUInt16BE(i+3),width:b.readUInt16BE(i+5)};i+=n;}}
 throw Error('Dimensions graphiques illisibles (PNG/JPEG/WebP attendu).');
}
export async function validatePresentationRegions(project:GameProject,root:string):Promise<void>{
 const sources:SpriteSource[]=[...project.balance.plants,...project.balance.enemies].flatMap(x=>x.visual?[x.visual.sprite]:[]);
 for(const a of project.presentation?.animations??[])sources.push(...a.frames);
 const cache=new Map<string,{width:number;height:number}>();
 for(const source of sources){let dimensions=cache.get(source.asset);if(!dimensions){const file=await resolveAsset(root,source.asset);const handle=await fs.open(file,'r');try{const buffer=Buffer.alloc(1024*1024);const {bytesRead}=await handle.read(buffer,0,buffer.length,0);dimensions=imageDimensions(buffer.subarray(0,bytesRead));}finally{await handle.close();}cache.set(source.asset,dimensions);}
  if(dimensions.width<1||dimensions.height<1||dimensions.width*dimensions.height>64*1024*1024)throw Error('Image trop grande ou vide : '+source.asset);
  const r=source.region;if(r&&(r.x+r.width>dimensions.width||r.y+r.height>dimensions.height))throw Error(`Découpe hors image : ${source.asset} (${dimensions.width} × ${dimensions.height}).`);
 }
}
