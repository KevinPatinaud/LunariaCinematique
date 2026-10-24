/** Home composition in the game's fixed 1280 × 720 design coordinates.
 * Elements are painted from first to last; all rectangles use a top-left origin.
 * Plant rectangles identify the actor's centre and selection bounds; scale retains
 * the shared species visual's authored dimensions and anchor.
 */
export const HOME_ELEMENT_KINDS=['panel','text','button','image','plant','line','progress','halo'] as const;
export type HomeElementKind=typeof HOME_ELEMENT_KINDS[number];
export const HOME_ACTIONS=['continue','map','collection','options'] as const;
export type HomeAction=typeof HOME_ACTIONS[number];
export type HomeFont='body'|'bold'|'title';
export type HomeFit='cover'|'contain'|'stretch';
export interface HomeRect {x:number;y:number;w:number;h:number}
/** Fields specific to a kind are optional here and checked by homeScreenIssues.
 * A flat record lets authoring switch kinds without losing the common geometry.
 */
export interface HomeElement {
 id:string;name:string;kind:HomeElementKind;visible:boolean;rect:HomeRect;opacity:number;
 showIfPlantUnlocked?:string;hideIfPlantUnlocked?:string;
 text?:string;font?:HomeFont;fontSize?:number;lineHeight?:number;maxLines?:number;align?:'left'|'center'|'right';
 color?:string;fill?:string;textColor?:string;borderColor?:string;borderWidth?:number;radius?:number;shadow?:boolean;
 action?:HomeAction;image?:string;fit?:HomeFit;flipH?:boolean;
 plantId?:string;scale?:number;animated?:boolean;
 lineWidth?:number;trackColor?:string;startAngle?:number;endAngle?:number;
}
export interface HomeScreen {
 background:{mode:'garden'|'image'|'color';chapter:number;color:string;image:string;fit:HomeFit;opacity:number;overlayColor:string;overlayOpacity:number};
 continueLabels:{start:string;continue:string;battle:string;cinematic:string;finished:string;unavailable:string;suffix:string};
 elements:HomeElement[];
}
export const HOME_ELEMENT_LABELS:Record<HomeElementKind,string>={panel:'Panneau',text:'Texte',button:'Bouton',image:'Image',plant:'Plante',line:'Ligne',progress:'Progression',halo:'Halo'};
export const HOME_ACTION_LABELS:Record<HomeAction,string>={continue:'Continuer l’aventure',map:'Carnet de voyage',collection:'La troupe',options:'Paramètres'};
const INK='#183e37',FOREST='#345a49',CREAM='#fff5de',GOLD='#f6c864',MINT='#d0e3bb';
export function newHomeElement(kind:HomeElementKind,id=`home_${globalThis.crypto.randomUUID().replaceAll('-','').slice(0,12)}`):HomeElement {
 const base:HomeElement={id,name:HOME_ELEMENT_LABELS[kind],kind,visible:true,rect:{x:640,y:300,w:240,h:80},opacity:1};
 const defaults:Record<HomeElementKind,Partial<HomeElement>>={
  panel:{fill:INK,borderColor:MINT,borderWidth:1,radius:20,shadow:true},
  text:{text:'Nouveau texte',font:'body',fontSize:24,lineHeight:32,maxLines:3,align:'left',color:CREAM},
  button:{text:'La troupe',action:'collection',fill:CREAM,textColor:INK,borderColor:'#6e8970',borderWidth:2,radius:15,shadow:true,font:'bold',fontSize:21},
  image:{image:'',fit:'contain',flipH:false},plant:{plantId:'radish',scale:2,animated:true},
  line:{color:MINT,lineWidth:2,rect:{x:640,y:300,w:240,h:0}},
  progress:{fill:GOLD,trackColor:'#102e29',radius:5,rect:{x:640,y:300,w:240,h:10}},
  halo:{fill:'#fff5de13',borderColor:'#d0e3bb4d',borderWidth:2,startAngle:-2.55,endAngle:.45,rect:{x:640,y:240,w:300,h:300}},
 };
 return {...base,...defaults[kind]};
}
export function defaultHomeScreen():HomeScreen {
 const e=(id:string,name:string,kind:HomeElementKind,x:number,y:number,w:number,h:number,fields:Partial<HomeElement>={}):HomeElement=>({...newHomeElement(kind,id),name,rect:{x,y,w,h},...fields});
 const text=(id:string,name:string,value:string,x:number,baseline:number,w:number,size:number,color:string,font:HomeFont='body',fields:Partial<HomeElement>={})=>e(id,name,'text',x,baseline-size,w,size+8,{text:value,fontSize:size,lineHeight:size+8,maxLines:1,color,font,...fields});
 return {
  background:{mode:'garden',chapter:-1,color:INK,image:'',fit:'cover',opacity:1,overlayColor:INK,overlayOpacity:.1},
  continueLabels:{start:"Commencer l'aventure",continue:'Continuer le voyage',battle:'Reprendre la bataille',cinematic:'Découvrir la suite',finished:'Retrouver la troupe',unavailable:'Aucune mission publiée',suffix:'  →'},
  elements:[
   e('navigation_panel','Panneau de navigation','panel',40,35,548,650,{fill:'#183e37f6',radius:32,borderColor:'#86aa8c',borderWidth:2}),
   e('navigation_inset','Contour intérieur','panel',52,47,524,626,{fill:'#345a492e',radius:25,borderColor:'#d0e3bb1f',borderWidth:1,shadow:false}),
   e('badge_panel','Fond du bandeau','panel',78,68,256,32,{fill:MINT,radius:10,borderColor:'#00000000',borderWidth:0,shadow:false}),
   text('badge_text','Bandeau','LES GRAINES DU VOYAGE',78,89.44,256,16,INK,'bold',{align:'center'}),
   text('title','Titre','LUNARIA',73,194,480,82,GOLD,'title'),
   text('subtitle','Sous-titre','La révolte des racines',79,239,472,30,CREAM,'bold'),
   text('intro','Introduction','Un jardin à sauver. Des compagnons à rencontrer. Un monde à faire refleurir.',80,286,458,23,MINT,'body',{rect:{x:80,y:263,w:458,h:96},lineHeight:32,maxLines:3}),
   e('divider','Séparateur','line',80,363,468,0,{color:'#d0e3bb47',lineWidth:2}),
   e('continue','Bouton principal','button',78,383,472,70,{text:'{continue}',action:'continue',fill:GOLD,borderColor:'#ba874a',fontSize:26}),
   e('map','Carnet de voyage','button',78,472,228,54,{text:'Carnet de voyage',action:'map'}),
   e('collection','La troupe','button',322,472,228,54,{text:'La troupe',action:'collection'}),
   e('options','Paramètres','button',78,540,472,54,{text:'Paramètres',action:'options'}),
   text('progress_label','Libellé progression','PROGRESSION',79,626,350,14,MINT,'bold'),
   text('progress_count','Compteur progression','{completed} / {total}',507,626,68,16,CREAM,'bold'),
   e('progress_bar','Barre de progression','progress',79,642,471,9),
   e('hero_halo','Halo des héros','halo',718,174,432,432,{fill:'#fff5de13',borderWidth:0}),
   e('hero_arc','Arc des héros','halo',705,161,458,458,{fill:'#00000000',borderColor:'#d0e3bb4d',borderWidth:2,startAngle:-2.55,endAngle:.45}),
   e('hero_rose','Rose','plant',938.5,290.5,265,265,{plantId:'rose',scale:2.65}),
   e('hero_radish','Radis','plant',624.5,276.5,365,365,{plantId:'radish',scale:3.65}),
   e('hero_baobab','Baobab débloqué','plant',920,433,210,210,{plantId:'baobab',scale:2.1,showIfPlantUnlocked:'baobab'}),
   e('hero_hazel','Noisetier débloqué','plant',938,445,210,210,{plantId:'hazel',scale:2.1,showIfPlantUnlocked:'hazel',hideIfPlantUnlocked:'baobab'}),
   e('tagline_panel','Panneau de signature','panel',664,584,552,91,{fill:'#183e37e6',radius:23,borderColor:'#d0e3bb8c',borderWidth:1}),
   e('tagline_accent','Accent de signature','panel',688,601,5,55,{fill:GOLD,radius:0,borderWidth:0,shadow:false}),
   text('tagline','Signature','Petites plantes. Grande rébellion.',703,619.5,493,25,GOLD,'bold',{align:'center'}),
   text('tagline_detail','Détail de signature','Le premier chapitre de votre aventure botanique',703,649.28,493,17,CREAM,'body',{align:'center'}),
   text('version','Version','Lunaria · {version}',1171,705,109,14,CREAM),
  ],
 };
}
