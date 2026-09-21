import type { GameAPI, GameProject } from '../../shared/game/types.js';
import { parseGameProject, parseGameDraft } from '../../shared/game/validation.js';
declare global {interface Window {lunariaGame?:GameAPI}}
function download(project:GameProject){const url=URL.createObjectURL(new Blob([JSON.stringify(project,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=project.id+'.game.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
const browser:GameAPI={
 async bootstrap(){let recovery:GameProject|null=null;try{const v=JSON.parse(localStorage.getItem('lunaria-game-recovery')??'null');recovery=parseGameDraft(v);}catch{}return {recovery,recent:[]};},
 async open(){return new Promise((resolve,reject)=>{const input=document.createElement('input');input.type='file';input.accept='.json';input.oncancel=()=>resolve(null);input.onchange=async()=>{try{const f=input.files?.[0];if(!f)return resolve(null);if(f.size>5*1024*1024)throw new Error('Fichier supérieur à 5 Mo.');resolve({project:parseGameProject(JSON.parse(await f.text())),path:f.name,token:crypto.randomUUID()});}catch(e){reject(e);}};input.click();});},
 async openRecent(){throw new Error('Ouvre ce fichier avec le bouton Ouvrir dans le navigateur.');},
 async save(project,token){const valid=parseGameProject(project);download(valid);return {project:valid,path:valid.id+'.game.json',token:token||crypto.randomUUID()};},
 async recover(project){localStorage.setItem('lunaria-game-recovery',JSON.stringify(project));},
 async clearRecovery(){localStorage.removeItem('lunaria-game-recovery');},
 async campaignFolder(){return '';},
 async chooseCampaignFolder(){throw new Error('La liaison à un dossier de films est disponible dans l’application Electron.');},
 async addCampaignFilm(){throw new Error('Ouvre le Studio desktop pour lier des cinématiques locales.');},
 async editCampaignFilm(){throw new Error('L’édition d’un fichier lié nécessite le Studio desktop.');},
 async presentationUsages(project){return {references:{},errors:project.campaign?.cinematics.length?['La lecture des films liés nécessite le Studio Electron.']:[]};},
 async checkCampaign(){throw new Error('La vérification des ressources locales nécessite le Studio desktop.');},
 async publish(){throw new Error('La publication groupée (parcours, films et bibliothèque partagée) est disponible dans Electron. Le navigateur permet seulement d’enregistrer le projet du Studio.');}
};
export const gameAPI:GameAPI=window.lunariaGame??browser;
