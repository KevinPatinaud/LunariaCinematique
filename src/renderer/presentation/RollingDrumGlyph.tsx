import type {RollingDrum,Point} from '../../shared/presentation/types.js';
import {drumQuads} from '../../shared/presentation/rollingDrum.js';

export function matrix(s:Point[],d:Point[]):string|undefined {
 const sx=s[1].x-s[0].x,sy=s[1].y-s[0].y,tx=s[2].x-s[0].x,ty=s[2].y-s[0].y,det=sx*ty-sy*tx;
 if(Math.abs(det)<1e-8)return;
 const dx=d[1].x-d[0].x,dy=d[1].y-d[0].y,ex=d[2].x-d[0].x,ey=d[2].y-d[0].y;
 const a=(dx*ty-ex*sy)/det,b=(dy*ty-ey*sy)/det,c=(ex*sx-dx*tx)/det,e=(ey*sx-dy*tx)/det;
 return `matrix(${a} ${b} ${c} ${e} ${d[0].x-a*s[0].x-c*s[0].y} ${d[0].y-b*s[0].x-e*s[0].y})`;
}

/** Same original-image projection as Godot; SVG keeps authoring and cinematic previews live. */
export function RollingDrumGlyph({drum,angle,id,url,width,height,origin={x:0,y:0},imageWidth=width,imageHeight=height}:{drum:RollingDrum;angle:number;id:string;url:string;width:number;height:number;origin?:Point;imageWidth?:number;imageHeight?:number}) {
 const pixel=(p:Point)=>({x:origin.x+p.x*width,y:origin.y+p.y*height});
 const triangles=drumQuads(drum,angle).flatMap((q,i)=>[[0,1,2],[0,2,3]].map((indices,j)=>{
  const s=indices.map(k=>pixel(q.source[k])),d=indices.map(k=>pixel(q.destination[k]));
  return {id:id+'-'+i+'-'+j,points:d.map(p=>p.x+','+p.y).join(' '),matrix:matrix(s,d),opacity:q.opacity};
 }));
 const left=drum.left,right=drum.right;
 const px=(p:Point)=>{const v=pixel(p);return v.x+' '+v.y;};
 const bounds={x:Math.min(left.top.x,left.curve.x,left.bottom.x),y:Math.min(left.top.y,right.top.y),width:Math.max(right.top.x,right.curve.x,right.bottom.x)-Math.min(left.top.x,left.curve.x,left.bottom.x),height:Math.max(left.bottom.y,right.bottom.y)-Math.min(left.top.y,right.top.y)};
 return <g data-rolling-drum="true" mask={'url(#'+id+'-vertical)'}>
  <defs>
   <linearGradient id={id+'-fade-x'}><stop offset="0" stopColor="black"/><stop offset="10%" stopColor="white"/><stop offset="94%" stopColor="white"/><stop offset="100%" stopColor="black"/></linearGradient>
   <linearGradient id={id+'-fade-y'} x2="0" y2="1"><stop offset="0" stopColor="black"/><stop offset="8%" stopColor="white"/><stop offset="92%" stopColor="white"/><stop offset="100%" stopColor="black"/></linearGradient>
   <mask id={id+'-horizontal'}><path d={`M${px(left.top)} L${px(right.top)} Q${px(right.curve)} ${px(right.bottom)} L${px(left.bottom)} Q${px(left.curve)} ${px(left.top)}Z`} fill={'url(#'+id+'-fade-x)'}/></mask>
   <mask id={id+'-vertical'}><rect x={origin.x+bounds.x*width} y={origin.y+bounds.y*height} width={bounds.width*width} height={bounds.height*height} fill={'url(#'+id+'-fade-y)'} mask={'url(#'+id+'-horizontal)'}/></mask>
   {triangles.map(t=><clipPath key={t.id} id={t.id}><polygon points={t.points}/></clipPath>)}
  </defs>
  {triangles.map(t=>t.matrix&&<g key={t.id} clipPath={'url(#'+t.id+')'} opacity={t.opacity}><image href={url} width={imageWidth} height={imageHeight} transform={t.matrix}/></g>)}
 </g>;
}
