import type {Point,WalkRig,WalkLeg} from './types.js';

export const WALK_STANCE=.6;
export const WALK_ROWS=[0,.55,.65,.7,.74,.76,.77,.78,.82,.86,.9,.94,.98,1];
export const WALK_COLUMNS=32;
export function insidePolygon(p:Point,polygon:Point[]):boolean{
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }
 return inside;
}
/** Linear ground contact cancels world travel; the other foot swings forward.
 * Coordinates, stance ratio and mesh topology are shared with Godot.
 */
export function walkFoot(rig:WalkRig,leg:number,time:number,period:number,size:Point,amplitude=1):Point{
 const p=((time/Math.max(.05,period)+leg*.5)%1+1)%1;
 const swing=Math.max(0,(p-WALK_STANCE)/(1-WALK_STANCE));
 const u=p<WALK_STANCE?p/WALK_STANCE:1-swing*swing*(3-2*swing);
 const lift=Math.min(rig.lift*amplitude,(rig.legs[leg].foot.y-rig.legs[leg].hip.y)*size.y*.4);
 return {x:rig.legs[leg].hip.x+(rig.stride/2-rig.stride*u)*amplitude/size.x,
  y:rig.ground-(p<WALK_STANCE?0:Math.sin(Math.PI*swing)*lift)/size.y};
}
export function walkWeight(p:Point,rig:WalkRig,leg:number):number{
 const l=rig.legs[leg];
 if(!insidePolygon(p,l.polygon))return 0;
 return bendWeight(p,l);
}
export function bendWeight(p:Point,l:WalkLeg):number{
 const smooth=(y:number)=>{const t=Math.min(1,Math.max(0,(y-l.hip.y)/Math.max(.01,(l.foot.y-l.hip.y)*.65)));return t*t*(3-2*t);};
 // Linear within each mesh strip: clipped edge triangles cannot invert when
 // the otherwise smooth shear is applied to a narrow cutout at the silhouette.
 for(let row=1;row<WALK_ROWS.length;row++)if(p.y<=WALK_ROWS[row]){
  const a=WALK_ROWS[row-1],b=WALK_ROWS[row],u=Math.min(1,Math.max(0,(p.y-a)/(b-a)));
  return smooth(a)+(smooth(b)-smooth(a))*u;
 }
 return 1;
}
export function walkPoint(p:Point,rig:WalkRig,time:number,period:number,size:Point,amplitude=1):Point{
 const result={...p};
 for(let i=0;i<rig.legs.length;i++){
  const weight=walkWeight(p,rig,i),foot=walkFoot(rig,i,time,period,size,amplitude);
  result.x+=(foot.x-rig.legs[i].foot.x)*weight;
  result.y+=(foot.y-rig.legs[i].foot.y)*weight;
 }
 return result;
}
