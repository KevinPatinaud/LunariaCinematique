import type {AnimationFrame, Region} from '../../shared/presentation/types.js';

export interface SheetGrid {columns:number;rows:number}

function overlappingBands(regions:Region[], axis:'x'|'y'){
 const size=axis==='x'?'width':'height';
 const bands:{start:number;end:number}[]=[];
 for(const region of [...regions].sort((a,b)=>a[axis]-b[axis])){
  const start=region[axis],end=start+region[size];
  const match=bands.find(band=>Math.max(0,Math.min(end,band.end)-Math.max(start,band.start))>=Math.min(end-start,band.end-band.start)*.5);
  if(match){match.start=Math.min(match.start,start);match.end=Math.max(match.end,end);}
  else bands.push({start,end});
 }
 return bands.length;
}

/** Existing sprite crops may differ by a few pixels within the same row or column. */
export function sheetGrid(frames:AnimationFrame[]):SheetGrid{
 if(frames.length<2||frames.some(frame=>frame.asset!==frames[0].asset||!frame.region))return {columns:4,rows:1};
 const regions=frames.map(frame=>frame.region!);
 return {columns:overlappingBands(regions,'x'),rows:overlappingBands(regions,'y')};
}

function candidateCounts(profile:number[],density:number){
 const length=profile.length,threshold=Math.min(.06,density*.14),minWidth=Math.max(2,Math.round(length*.003));
 const gaps:{start:number;end:number}[]=[];
 for(let start=0;start<length;){
  if(profile[start]>threshold){start++;continue;}
  let end=start+1;while(end<length&&profile[end]<=threshold)end++;
  if(end-start>=minWidth&&start>length*.04&&end<length*.96)gaps.push({start,end});
  start=end;
 }
 const counts:number[]=[];
 for(let count=Math.min(16,Math.floor(length/8));count>=2;count--){
  const tolerance=length/count*.08;
  if(Array.from({length:count-1},(_,index)=>(index+1)*length/count).every(boundary=>gaps.some(gap=>boundary>=gap.start-tolerance&&boundary<=gap.end+tolerance)))counts.push(count);
 }
 return [...counts,1];
}

/** Detect an evenly spaced transparent gutter before proposing a sheet format. */
export function sheetGridFromPixels(width:number,height:number,pixels:Uint8ClampedArray):SheetGrid|null{
 if(width<2||height<2||pixels.length<width*height*4)return null;
 const xCounts=new Uint32Array(width),yCounts=new Uint32Array(height);
 const integral=new Uint32Array((width+1)*(height+1));
 let opaque=0;
 for(let y=0;y<height;y++){
  let rowTotal=0;
  for(let x=0;x<width;x++){
   if(pixels[(y*width+x)*4+3]>32){xCounts[x]++;yCounts[y]++;opaque++;rowTotal++;}
   integral[(y+1)*(width+1)+x+1]=integral[y*(width+1)+x+1]+rowTotal;
  }
 }
 const density=opaque/(width*height);
 if(density<.01||density>.98)return null;
 const columns=candidateCounts(Array.from(xCounts,count=>count/height),density);
 const rows=candidateCounts(Array.from(yCounts,count=>count/width),density);
 for(const columnCount of columns)for(const rowCount of rows){
  if(columnCount*rowCount===1)continue;
  const filled=Array.from({length:columnCount*rowCount},(_,index)=>{
   const x=index%columnCount,y=Math.floor(index/columnCount);
   const left=Math.floor(x*width/columnCount),right=Math.floor((x+1)*width/columnCount),top=Math.floor(y*height/rowCount),bottom=Math.floor((y+1)*height/rowCount);
   const count=integral[bottom*(width+1)+right]-integral[top*(width+1)+right]-integral[bottom*(width+1)+left]+integral[top*(width+1)+left];
   return count/((right-left)*(bottom-top))>.02;
  });
  if(filled.every(Boolean))return {columns:columnCount,rows:rowCount};
 }
 return null;
}

export async function detectSheetGrid(url:string):Promise<SheetGrid|null>{
 const image=new Image();image.crossOrigin='anonymous';image.src=url;await image.decode();
 const scale=Math.min(1,1024/image.naturalWidth,1024/image.naturalHeight);
 const width=Math.max(1,Math.round(image.naturalWidth*scale)),height=Math.max(1,Math.round(image.naturalHeight*scale));
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const context=canvas.getContext('2d',{willReadFrequently:true});
 if(!context)throw Error('Analyse de la planche indisponible.');
 context.drawImage(image,0,0,width,height);
 return sheetGridFromPixels(width,height,context.getImageData(0,0,width,height).data);
}
