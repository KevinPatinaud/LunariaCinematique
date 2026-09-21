import { ACTOR_ANIMATION_SCHEMA,CATALOG_LINK_SCHEMA } from './presentation/schema.js';
import { isImage, isAudio } from './assets.js';
import { hasV2Features, hasV3Features, type Cinematic } from './model.js';
import { bubbleLayout } from './geometry.js';
type Rule = { type?: string | string[]; const?: unknown; enum?: unknown[]; minimum?: number; maximum?: number;
  minLength?: number; maxLength?: number; pattern?: string; minItems?: number; maxItems?: number;
  items?: Rule; properties?: Record<string, Rule>; required?: string[]; additionalProperties?: boolean };
const str = (max = 180): Rule => ({ type: 'string', maxLength: max });
const id: Rule = { ...str(100), minLength: 1 };
const num = (minimum: number, maximum: number): Rule => ({ type: 'number', minimum, maximum });
const en = (...values: string[]): Rule => ({ type: 'string', enum: values });
const obj = (properties: Record<string, Rule>, optional: string[] = []): Rule => ({ type: 'object', properties,
  required: Object.keys(properties).filter(k => !optional.includes(k)), additionalProperties: false });
const arr = (items: Rule, maxItems: number, minItems = 0): Rule => ({ type: 'array', items, minItems, maxItems });
const bool: Rule = { type: 'boolean' };
const ref: Rule = { type: 'string', minLength: 11, maxLength: 1024, pattern: '^library://[^\\\\\\u0000-\\u001f:?#]+$' };
const nullableRef: Rule = { ...ref, type: ['string', 'null'] };
const nullableId: Rule = { ...id, type: ['string', 'null'] };
const box = { x: num(-1, 2), y: num(-1, 2), width: num(0.03, 2), height: num(0.03, 2) };
const actor = obj({ ...box, animation:ACTOR_ANIMATION_SCHEMA as Rule,id, name: str(180), asset: ref, flipX: bool, opacity: num(0, 1),
  entry: obj({ preset: en('none', 'fade', 'left', 'right', 'bottom', 'top', 'pop', 'zoom'), duration: num(0.1, 10), delay: num(0, 300) }),
  exit: obj({ preset: en('none', 'fade', 'left', 'right', 'top', 'bottom', 'shrink'), start: num(0, 300), duration: num(0.1, 10) }),
  role: en('character', 'enemy', 'prop'), rotation: num(-180, 180), pivot: en('center', 'top', 'bottom'),
  motion: obj({ preset: en('none', 'float', 'sway', 'pulse', 'spin', 'shake', 'bounce', 'nod', 'recoil', 'heartbeat', 'flutter'), intensity: num(0, 1),
    period: num(0.2, 60), delay: num(0, 300), loop: bool, reverse: bool }),
  movement: obj({ enabled: bool, dx: num(-3, 3), dy: num(-3, 3), duration: num(0.1, 300), delay: num(0, 300),
    easing: en('smooth', 'linear'), repeat: en('once', 'pingpong') })
}, ['role', 'rotation', 'pivot', 'motion', 'movement', 'exit','animation']);
const bubble = obj({ ...box, id, kind: en('speech', 'narration'), style: en('parchment', 'plain', 'simple', 'ornate'), frameAsset: nullableRef,
  speakerId: nullableId, text: str(1500), fontSize: num(18, 72), autoHeight: bool,
  tail: obj({ mode: en('auto', 'manual', 'none'), x: num(-1, 2), y: num(-1, 2) }),
  textAnimation: obj({ reveal: en('instant', 'typewriter', 'words', 'fade'), effect: en('none', 'shout', 'wave', 'shake', 'bounce'),
    speed: num(0.5, 120), delay: num(0, 30), duration: num(0.1, 10), intensity: num(0, 1), loop: bool }),
  advance: obj({ mode: en('click', 'auto'), seconds: num(0.5, 120) }), lines: arr(str(1500), 1501) }, ['lines', 'textAnimation']);
const audio: Rule = { ...obj({ asset: ref, volume: num(0, 1), loop: bool }), type: ['object', 'null'] };
const shot = obj({ id, name: str(180), duration: num(1, 300), background: obj({ asset: nullableRef, fit: en('cover', 'contain') }),
  camera: obj({ preset: en('fixed', 'zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'pan_up', 'pan_down'), intensity: num(0, 1) }),
  transition: obj({ type: en('cut', 'fade'), duration: num(0, 3) }), actors: arr(actor, 50), bubbles: arr(bubble, 100),
  dialogueStart: num(0, 300), audio });
export const cinematicSchema = { $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Lunaria Cinematic v1 / v2 / v3', ...obj({ schemaVersion: { type: 'number', enum: [1, 2, 3,4] }, id, title: str(200),presentationCatalog:CATALOG_LINK_SCHEMA as Rule,
    stage: obj({ width: { const: 1600 }, height: { const: 900 } }), shots: arr(shot, 500, 1) },['presentationCatalog']) };
export function isSafeAssetRef(value: unknown): value is `library://${string}` {
  if (typeof value !== 'string' || !value.startsWith('library://') || value.length > 1024) return false;
  const relative = value.slice(10);
  return relative.length > 0 && !/[\\\u0000-\u001f:?#]/.test(relative)
    && relative.split('/').every(part => part !== '' && part !== '.' && part !== '..');
}
function walk(rule: Rule, value: unknown, path: string, issues: string[]): void {
  if (issues.length > 30) return;
  if ('const' in rule && value !== rule.const) { issues.push(`${path} : valeur attendue ${rule.const}.`); return; }
  const kind = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  if (rule.type && !(Array.isArray(rule.type) ? rule.type : [rule.type]).includes(kind)) { issues.push(`${path} : type incorrect (${kind}).`); return; }
  if (value === null) return;
  if (rule.enum && !rule.enum.includes(value)) issues.push(`${path} : valeur non reconnue.`);
  if (typeof value === 'number' && (!Number.isFinite(value) || (rule.minimum !== undefined && value < rule.minimum) || (rule.maximum !== undefined && value > rule.maximum))) issues.push(`${path} : nombre hors limites.`);
  if (typeof value === 'string') {
    if ([...value].length < (rule.minLength ?? 0) || [...value].length > (rule.maxLength ?? Infinity)) issues.push(`${path} : longueur incorrecte.`);
    if (rule.pattern && !new RegExp(rule.pattern).test(value)) issues.push(`${path} : référence ou texte invalide.`);
    if (rule.pattern?.startsWith('^library:') && !isSafeAssetRef(value)) issues.push(`${path} : chemin interdit.`);
  }
  if (Array.isArray(value)) {
    if (value.length < (rule.minItems ?? 0) || value.length > (rule.maxItems ?? Infinity)) issues.push(`${path} : nombre d’éléments incorrect.`);
    if (rule.items) value.forEach((item, i) => walk(rule.items!, item, `${path}[${i}]`, issues));
  } else if (value && typeof value === 'object' && rule.properties) {
    const record = value as Record<string, unknown>;
    for (const key of rule.required ?? []) if (!Object.hasOwn(record, key)) issues.push(`${path}.${key} : champ requis.`);
    for (const [key, item] of Object.entries(record)) {
      if (Object.hasOwn(rule.properties, key)) walk(rule.properties[key], item, `${path}.${key}`, issues);
      else if (rule.additionalProperties === false) issues.push(`${path}.${key} : champ inconnu.`);
    }
  }
}
export function validationIssues(value: unknown): string[] {
  const issues: string[] = [];
  walk(cinematicSchema, value, 'cinematic', issues);
  if (issues.length) return issues;
  const doc = value as Cinematic;
  if(doc.shots.some(s=>s.actors.some(a=>a.animation))&&(!doc.presentationCatalog||doc.schemaVersion!==4))issues.push('Les animations partagées nécessitent un lien explicite au catalogue et la version 4.');
  if(doc.presentationCatalog?.file&&(!/^[a-zA-Z0-9_./ -]+\.json$/.test(doc.presentationCatalog.file)||doc.presentationCatalog.file.split('/').some(x=>!x||x==='..'||x==='.')))issues.push('Chemin du catalogue non portable.');
  const allIds = new Set<string>();
  if (doc.schemaVersion === 1 && hasV2Features(doc)) issues.push('Les rôles (ennemi, objet) ou mouvements nécessitent schemaVersion: 2.');
  if (doc.schemaVersion < 3 && hasV3Features(doc)) issues.push('Les nouvelles animations et le texte animé nécessitent schemaVersion: 3.');
  const unique = (id: string) => { if (allIds.has(id)) issues.push(`Identifiant répété : ${id}.`); allIds.add(id); };
  for (const shot of doc.shots) {
    const imageRef = (value: string | null) => { if (value && !isImage(value)) issues.push(`${shot.name} : la source graphique n’est pas une image prise en charge.`); };
    imageRef(shot.background.asset); shot.actors.forEach(a => imageRef(a.asset)); shot.bubbles.forEach(b => imageRef(b.frameAsset));
    if (shot.audio && !isAudio(shot.audio.asset)) issues.push(`${shot.name} : format audio non pris en charge.`);
    unique(shot.id); shot.actors.forEach(a => unique(a.id)); shot.bubbles.forEach(b => unique(b.id));
    if (shot.dialogueStart > shot.duration) issues.push(`${shot.name} : début des dialogues après la durée minimale.`);
    if (shot.transition.duration > shot.duration) issues.push(`${shot.name} : transition plus longue que le plan.`);
    for (const b of shot.bubbles) {
      if (b.speakerId && !shot.actors.some(a => a.id === b.speakerId)) issues.push(`${shot.name} : personnage de bulle introuvable.`);
      if (b.tail.mode === 'auto' && !b.speakerId) issues.push(`${shot.name} : queue automatique sans personnage.`);
      if ((b.style === 'simple' || b.style === 'ornate') && !b.frameAsset) issues.push(`${shot.name} : cadre texturé sans image.`);
    }
  }
  return issues;
}
export function parseCinematic(value: unknown): Cinematic {
  const issues = validationIssues(value);
  if (issues.length) throw new Error(issues.slice(0, 8).join('\n'));
  if (new TextEncoder().encode((JSON.stringify(value, null, 2) + '\n')).byteLength > 5 * 1024 * 1024) throw new Error('Cinématique trop volumineuse (maximum 5 Mo).');
  return value as Cinematic;
}
/** Warnings do not prevent saving a work in progress. */
export function contentWarnings(doc: Cinematic): string[] {
  const warnings: string[] = [];
  doc.shots.forEach((s, i) => {
    if (!s.background.asset) warnings.push(`Plan ${i + 1} : aucun décor.`);
    for (const a of s.actors) {
      if (a.x + a.width <= 0 || a.y + a.height <= 0 || a.x >= 1 || a.y >= 1) warnings.push(`Plan ${i + 1} : « ${a.name} » est hors champ ; utilise Recentrer.`);
      if (a.entry.preset !== 'none' && a.entry.delay + a.entry.duration > s.duration) warnings.push(`Plan ${i + 1} : l’entrée de « ${a.name} » se termine après la durée minimale.`);
    }
    for (const b of s.bubbles) {
      const l = bubbleLayout(b);
      if (l.overflow) warnings.push(`Plan ${i + 1} : une bulle est trop petite pour son texte.`);
      if (b.x < 0 || b.y < 0 || b.x + b.width > 1 || b.y + l.height / 900 > 1) warnings.push(`Plan ${i + 1} : une bulle dépasse du cadre.`);
      if (!b.text.trim()) warnings.push(`Plan ${i + 1} : une bulle est vide.`);
    }
  });
  return warnings;
}
