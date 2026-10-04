import type { Rule } from './schema.js';
import {HOME_ACTIONS,HOME_ELEMENT_KINDS,type HomeElementKind} from './homeScreen.js';
const str=(maxLength=200,minLength=0):Rule=>({type:'string',minLength,maxLength});
const num=(minimum:number,maximum:number,integer=false):Rule=>({type:'number',minimum,maximum,...(integer?{multipleOf:1}:{})});
const obj=(properties:Record<string,Rule>,required=Object.keys(properties)):Rule=>({type:'object',additionalProperties:false,required,properties});
const color:Rule={type:'string',pattern:'^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$'};
const id:Rule={...str(120,1),pattern:'^[a-zA-Z0-9_-]+$'};
const optionalId:Rule={...str(120),pattern:'^[a-zA-Z0-9_-]*$'};
const fit:Rule={type:'string',enum:['cover','contain','stretch']};
const image:Rule={...str(1000),pattern:'^(|library://.+[.]([Pp][Nn][Gg]|[Jj][Pp][Ee]?[Gg]|[Ww][Ee][Bb][Pp]))$'};
export const HOME_KIND_FIELDS:Record<HomeElementKind,string[]>={
 panel:['fill','borderColor','borderWidth','radius','shadow'],
 text:['text','font','fontSize','lineHeight','maxLines','align','color'],
 button:['text','action','fill','textColor','borderColor','borderWidth','radius','shadow','font','fontSize'],
 image:['image','fit','flipH'],plant:['plantId','scale','animated'],line:['color','lineWidth'],
 progress:['fill','trackColor','radius'],halo:['fill','borderColor','borderWidth','startAngle','endAngle'],
};
const element=obj({
 id,name:str(120,1),kind:{type:'string',enum:[...HOME_ELEMENT_KINDS]},visible:{type:'boolean'},
 rect:obj({x:num(-2560,2560),y:num(-1440,1440),w:num(0,5120),h:num(0,2880)}),opacity:num(0,1),
 showIfPlantUnlocked:optionalId,hideIfPlantUnlocked:optionalId,
 text:str(2000),font:{type:'string',enum:['body','bold','title']},fontSize:num(8,240,true),lineHeight:num(8,320),maxLines:num(1,30,true),align:{type:'string',enum:['left','center','right']},
 color,fill:color,textColor:color,borderColor:color,borderWidth:num(0,32,true),radius:num(0,500,true),shadow:{type:'boolean'},
 action:{type:'string',enum:[...HOME_ACTIONS]},image,fit,flipH:{type:'boolean'},
 plantId:id,scale:num(.05,12),animated:{type:'boolean'},lineWidth:num(.1,64),trackColor:color,startAngle:num(-Math.PI*2,Math.PI*2),endAngle:num(-Math.PI*2,Math.PI*2),
},['id','name','kind','visible','rect','opacity']);
// JSON-schema consumers get the same kind-specific requirements as Studio's
// bounded validator, which performs these checks in homeScreenIssues.
element.allOf=HOME_ELEMENT_KINDS.map(kind=>({if:{properties:{kind:{const:kind}},required:['kind']},then:{required:HOME_KIND_FIELDS[kind]}}));
export const HOME_SCREEN_SCHEMA:Rule=obj({
 background:obj({mode:{type:'string',enum:['garden','image','color']},chapter:num(-1,4,true),color,image,fit,opacity:num(0,1),overlayColor:color,overlayOpacity:num(0,1)}),
 continueLabels:obj(Object.fromEntries(['start','continue','battle','outro','epilogue','unavailable','suffix'].map(key=>[key,str(160)]))),
 elements:{type:'array',minItems:0,maxItems:100,items:element},
});
