import type { GameAPI, GameProject } from '../../shared/game/types.js';
import { parseGameProject, parseGameDraft } from '../../shared/game/validation.js';
declare global {interface Window {lunariaGame?:GameAPI}}
function download(project:GameProject){const url=URL.createObjectURL(new Blob([JSON.stringify(project,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=project.id+'.game.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
const browser:GameAPI={
 async inspectConflict(){return null;},
 async reconcile(){throw Error('La comparaison des fichiers locaux nécessite le Studio pour ordinateur.');},
 async bootstrap(){let recovery:GameProject|null=null,recoveryContext;try{const source=localStorage.getItem('lunaria-game-recovery')??'null';recovery=parseGameDraft(JSON.parse(source));const meta=JSON.parse(localStorage.getItem('lunaria-game-recovery-meta')??'null');if(meta?.source===source&&typeof meta.path==='string')recoveryContext={base:parseGameDraft(meta.base),path:meta.path};}catch{}return {recovery,recoveryContext,recent:[]};},
 async open(){return new Promise((resolve,reject)=>{const input=document.createElement('input');input.type='file';input.accept='.json';input.oncancel=()=>resolve(null);input.onchange=async()=>{try{const f=input.files?.[0];if(!f)return resolve(null);if(f.size>32*1024*1024)throw new Error('Fichier supérieur à 32 Mo.');resolve({project:parseGameProject(JSON.parse(await f.text())),path:f.name,token:crypto.randomUUID()});}catch(e){reject(e);}};input.click();});},
 async openRecent(){throw new Error('Ouvre ce fichier avec le bouton Ouvrir dans le navigateur.');},
 async save(project,token){const valid=parseGameProject(project);for(const film of valid.campaign?.cinematics??[])if(!valid.cinematics?.some(doc=>doc.id===film.documentId))throw Error('Intègre toutes les cinématiques au projet avant de l’enregistrer.');download(valid);return {project:valid,path:valid.id+'.game.json',token:token||crypto.randomUUID()};},
 async backup(){throw new Error('La sauvegarde complète avec images et sons nécessite l’application Lunaria Studio pour ordinateur.');},
 async recover(project,context){const source=JSON.stringify(project);localStorage.setItem('lunaria-game-recovery',source);if(context)localStorage.setItem('lunaria-game-recovery-meta',JSON.stringify({...context,source}));else localStorage.removeItem('lunaria-game-recovery-meta');},
 async clearRecovery(){localStorage.removeItem('lunaria-game-recovery');localStorage.removeItem('lunaria-game-recovery-meta');},
 async checkCampaign(){throw new Error('La vérification des ressources locales nécessite le Studio desktop.');},
 async testAbility(){throw new Error('Le test de combat nécessite Lunaria Studio pour ordinateur.');},
 async playLevel(){throw new Error('Le lancement d’un niveau nécessite l’application Lunaria Studio pour ordinateur.');},
 async build(){throw new Error('La construction PC et Android nécessite l’application Lunaria Studio pour ordinateur.');},
 async deployAndroid(){throw new Error('Le déploiement sur téléphone nécessite l’application Lunaria Studio pour ordinateur.');},
 async publishWeb(){throw Error('La publication du niveau Web nécessite Lunaria Studio pour ordinateur.');},
 onAndroidDeploymentProgress(){return()=>{};},
 async publish(){throw new Error('La publication groupée (parcours, films et bibliothèque partagée) est disponible dans Electron. Le navigateur permet seulement d’enregistrer le projet du Studio.');}
};
export const gameAPI:GameAPI=window.lunariaGame??browser;
