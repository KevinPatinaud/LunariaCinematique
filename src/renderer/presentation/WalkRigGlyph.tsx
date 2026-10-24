import type {WalkRig,Point} from '../../shared/presentation/types.js';
import {WALK_ROWS,WALK_COLUMNS,walkFoot,bendWeight} from '../../shared/presentation/walkRig.js';
import {matrix} from './RollingDrumGlyph.js';

/** Body and legs are cut out before skinning, so crossed feet never fold the image. */
export function WalkRigGlyph({rig,time,period,amplitude,id,url,width,height,size,origin,imageWidth,imageHeight}:{rig:WalkRig;time:number;period:number;amplitude:number;id:string;url:string;width:number;height:number;size:Point;origin:Point;imageWidth:number;imageHeight:number}){
 const pixel=(p:Point)=>({x:origin.x+p.x*width,y:origin.y+p.y*height});
 const polygon=(points:Point[])=>points.map(p=>{const q=pixel(p);return q.x+','+q.y;}).join(' ');
 const triangles:{id:string;leg:number;points:string;transform:string|undefined}[]=[];
 for(const leg of [1,0]){
  const foot=walkFoot(rig,leg,time,period,size,amplitude),rest=rig.legs[leg].foot;
  const deform=(p:Point)=>{const w=bendWeight(p,rig.legs[leg]);return pixel({x:p.x+(foot.x-rest.x)*w,y:p.y+(foot.y-rest.y)*w});};
  for(let row=1;row<WALK_ROWS.length;row++){
   if(WALK_ROWS[row]<rig.legs[leg].hip.y)continue;
   for(let col=0;col<WALK_COLUMNS;col++){
    const corners=[{x:col/WALK_COLUMNS,y:WALK_ROWS[row-1]},{x:(col+1)/WALK_COLUMNS,y:WALK_ROWS[row-1]},
     {x:(col+1)/WALK_COLUMNS,y:WALK_ROWS[row]},{x:col/WALK_COLUMNS,y:WALK_ROWS[row]}];
    for(const indices of [[0,1,2],[0,2,3]]){
     const source=indices.map(i=>pixel(corners[i])),dest=indices.map(i=>deform(corners[i]));
     const center={x:source.reduce((s,p)=>s+p.x,0)/3,y:source.reduce((s,p)=>s+p.y,0)/3};
     const overlap=source.map(p=>{const d=Math.hypot(p.x-center.x,p.y-center.y);return {x:p.x+(p.x-center.x)*.15/Math.max(.001,d),y:p.y+(p.y-center.y)*.15/Math.max(.001,d)};});
     triangles.push({id:id+'-'+triangles.length,leg,points:overlap.map(p=>p.x+','+p.y).join(' '),transform:matrix(source,dest)});
    }
   }
  }
 }
 return <g data-walk-rig="true"><defs>
  <mask id={id+'-body'} maskUnits="userSpaceOnUse" x={origin.x} y={origin.y} width={width} height={height}>
   <rect x={origin.x} y={origin.y} width={width} height={height} fill="white"/>
   {rig.legs.map((leg,i)=><polygon key={i} points={polygon(leg.polygon)} fill="black"/>)}
  </mask>
  {rig.legs.map((leg,i)=><clipPath key={i} id={id+'-leg-'+i}><polygon points={polygon(leg.polygon)}/></clipPath>)}
  {triangles.map(t=><clipPath key={t.id} id={t.id}><polygon points={t.points}/></clipPath>)}
 </defs>
  <image href={url} width={imageWidth} height={imageHeight} mask={'url(#'+id+'-body)'}/>
  {triangles.map(t=>t.transform&&<g key={t.id} data-walk-triangle={t.leg} transform={t.transform}><g clipPath={'url(#'+t.id+')'}><image href={url} width={imageWidth} height={imageHeight} clipPath={'url(#'+id+'-leg-'+t.leg+')'}/></g></g>)}
 </g>;
}
