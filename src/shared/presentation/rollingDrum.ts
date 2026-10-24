import type {Point,RollingDrum} from './types.js';

/** A curved patch of the original sprite. Values stay in source-image coordinates. */
export function drumPoint(drum:RollingDrum,u:number,v:number):Point {
 const edge=(side:RollingDrum['left'])=>({
  x:(1-v)**2*side.top.x+2*v*(1-v)*side.curve.x+v*v*side.bottom.x,
  y:(1-v)**2*side.top.y+2*v*(1-v)*side.curve.y+v*v*side.bottom.y,
 });
 const l=edge(drum.left),r=edge(drum.right);
 return {x:l.x+(r.x-l.x)*u,y:l.y+(r.y-l.y)*u};
}
export function drumRadius(drum:RollingDrum,height:number):number {
 return Math.max(1,(drum.left.bottom.y-drum.left.top.y+drum.right.bottom.y-drum.right.top.y)*height/4);
}
export interface DrumQuad {destination:Point[];source:Point[];opacity:number}

/** Front half-cylinder; a short overlap hides the repeated material's wrap seam.
 * Its original end caps, mud at the silhouette and metal supports remain static.
 * Godot uses exactly the same angular rows and source coordinates.
 */
export function drumQuads(drum:RollingDrum,angle:number):DrumQuad[] {
 const mod=(a:number,b:number)=>((a%b)+b)%b;
 const phase=mod(Math.floor(angle/Math.PI*256+.5)/256,1),cuts=new Set<number>([0,1]);
 for(let i=1;i<40;i++)cuts.add(i/40);
 for(const q of [0,.86,1]){const t=mod(q-phase,1);if(t>1e-7&&t<1-1e-7)cuts.add(t);}
 const rows=[...cuts].sort((a,b)=>a-b),result:DrumQuad[]=[];
 const v=(t:number)=>(1-Math.cos(t*Math.PI))/2;
 for(let i=1;i<rows.length;i++){
  const a=rows[i-1],b=rows[i],mid=(a+b)/2,cycle=Math.floor(mid+phase);
  const q0=Math.min(1,Math.max(0,a+phase-cycle)),q1=Math.min(1,Math.max(0,b+phase-cycle));
  const destination=[drumPoint(drum,0,v(a)),drumPoint(drum,1,v(a)),drumPoint(drum,1,v(b)),drumPoint(drum,0,v(b))];
  result.push({destination,source:[drumPoint(drum,0,v(q0)),drumPoint(drum,1,v(q0)),drumPoint(drum,1,v(q1)),drumPoint(drum,0,v(q1))],opacity:1});
  if((q0+q1)/2>.86){
   const mix=(q:number)=>{const x=Math.min(1,Math.max(0,(q-.86)/.14));return x*x*(3-2*x);};
   result.push({destination,source:[drumPoint(drum,0,v(q0-1)),drumPoint(drum,1,v(q0-1)),drumPoint(drum,1,v(q1-1)),drumPoint(drum,0,v(q1-1))],opacity:(mix(q0)+mix(q1))/2});
  }
 }
 return result;
}
