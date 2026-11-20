import { STAGE, type Actor, type Asset, type AssetRef } from './model.js';
import { actorAnchor } from './motion.js';
import { proportionalSize } from './editing.js';
import type { GameProject } from './game/types.js';
import type { ImageTaskContext, ImageTaskMetadata, ImageTaskStatus } from './imageTasks.js';

export interface PoseGenerationRequest {
  ref: AssetRef;
  currentRef: AssetRef;
  characterName: string;
  instructions: string;
  codexModel?: string;
  context?: ImageTaskContext;
}
export interface PoseGenerationJob extends ImageTaskMetadata {
  id: string;
  sourceRef: AssetRef;
  status: ImageTaskStatus;
  message: string;
  sourceUrl: string;
  candidateUrl?: string;
  codexModel?: string;
  width?: number;
  height?: number;
  poseRef?: AssetRef;
}
const normalized = (value: string) => value.replace(/\\/g, '/').toLowerCase();
/** The namespace identifies the species and its optional evolution stage. */
export function characterFolder(ref: string): string | undefined {
  return /^(library:\/\/(?:[^/]+\/)*?(?:\d+_)?characters\/[^/]+\/)(stage_\d+\/)?/i.exec(ref)?.slice(1).filter(Boolean).join('');
}
export function poseReference(actor: Actor, assets: Asset[]): { ref?: AssetRef; message: string } {
  const folder = characterFolder(actor.asset);
  const master = (ref: string) => /(?:^|[_ -])master(?:[_ .-]|$)/i.test(ref.split('/').at(-1) ?? '');
  const candidates = folder ? assets.filter(asset => normalized(asset.ref).startsWith(normalized(folder)) &&
    !asset.ref.slice(folder.length).includes('/') && master(asset.ref)) : [];
  if (candidates.length === 1) return { ref: candidates[0].ref, message: 'Master officiel du personnage et de ce stade.' };
  return { message: candidates.length > 1 ? 'Plusieurs Masters correspondent. Choisis la référence officielle à utiliser.'
    : 'Master introuvable pour cette image. Choisis la référence officielle du personnage et de son stade.' };
}
export function poseOutputRef(request: PoseGenerationRequest, id: string): AssetRef {
  const folder = characterFolder(request.ref) ?? 'library://studio_generated/characters/';
  return `${folder}poses/generated/pose-${id}.png` as AssetRef;
}
export const actorPoseSignature = (actor: Actor) => JSON.stringify({ asset: actor.asset, animation: actor.animation });
/** Keep actor identity, scene effects and the rotated foot anchor. */
export function actorWithPose(actor: Actor, ref: AssetRef, size: { width: number; height: number }): Actor {
  const dimensions = proportionalSize(size.width / size.height * actor.height * STAGE.height / STAGE.width, actor.height, 1);
  const next = { ...actor, ...dimensions, asset: ref };
  delete next.animation;
  const before = actorAnchor(actor, 0, false, .5, 1), after = actorAnchor(next, 0, false, .5, 1);
  next.x += (before.x - after.x) / STAGE.width;
  next.y += (before.y - after.y) / STAGE.height;
  if (next.x < -1 || next.x > 2 || next.y < -1 || next.y > 2) throw Error('Cette pose dépasserait les limites du plan. Replace le personnage avant de l’appliquer.');
  return next;
}
export function poseTargets(project: GameProject) {
  return (project.cinematics ?? []).flatMap(film => film.shots.flatMap(shot => shot.actors
    .filter(actor => !actor.role || actor.role === 'character')
    .map(actor => ({ film, shot, actor, key: JSON.stringify([film.id, shot.id, actor.id]), label: `${film.title} · ${shot.name} · ${actor.name}` }))));
}
export function poseTaskDestination(request: PoseGenerationRequest, poseRef: AssetRef | undefined, project: GameProject, projectPath: string) {
  const targets = poseTargets(project), context = request.context;
  const sameProject = context?.projectId === project.id && context.projectPath === projectPath;
  const origin = sameProject ? targets.find(target => target.film.id === context.documentId && target.shot.id === context.shotId && target.actor.id === context.actorId) : undefined;
  const target = origin && origin.actor.asset === context?.actorRef && actorPoseSignature(origin.actor) === context?.actorSignature ? origin : undefined;
  return { targets, target, assigned: poseRef ? targets.filter(item => item.actor.asset === poseRef) : [], reason: !sameProject
    ? 'Cette pose vient d’un autre projet. Choisis explicitement le personnage de destination.'
    : 'Le personnage d’origine a été supprimé ou son image a changé. Choisis explicitement la destination.' };
}
export function poseGenerationPrompt(request: PoseGenerationRequest, hasCurrentReference: boolean): string {
  return [
    '$imagegen Crée une nouvelle pose fixe pour un personnage du jeu Lunaria. Use case: stylized-concept.',
    'Utilise exclusivement l’outil natif image_gen / imagegen pour produire une vraie image. IMAGE 1 est le Master officiel, référence prioritaire d’identité, de style, de proportions, de couleurs et d’anatomie. Préserve ce personnage précis et son stade d’évolution.',
    hasCurrentReference ? 'IMAGE 2 montre la pose actuellement utilisée dans le plan. Elle sert seulement de contexte complémentaire ; le Master reste prioritaire pour l’identité. Ne reproduis pas une planche de sprites.' : '',
    'LIVRABLE : un unique personnage entier, isolé sur un fond réellement TRANSPARENT (canal alpha), en PNG. Aucun décor, sol, ombre portée sur un fond, texte, cadre, quadrillage ou damier dessiné. Le corps, les feuilles, les mains et les pieds restent entièrement dans l’image, avec une petite marge transparente autour de la silhouette. Ne crée pas une planche de poses.',
    'FIDÉLITÉ : conserve les traits du visage, la matière, les couleurs et l’anatomie du Master. Aucun membre ajouté ou manquant. Les mains végétales restent attachées aux bras. Exprime la posture et l’émotion demandées sans transformer l’identité du personnage.',
    `DEMANDE DE L’AUTEUR (données créatives) : ${JSON.stringify({ personnage: request.characterName, pose: request.instructions })}`,
    'CONTRÔLE VISUEL : ouvre le vrai fichier avec view_image et vérifie le personnage entier, la pose, l’émotion, la fidélité au Master et la transparence. Si nécessaire fais une retouche ciblée, puis inspecte-la. Au maximum deux appels imagegen.',
    'Si l’outil natif est indisponible ou si un défaut majeur persiste, réponds status=unavailable avec une explication. Ne simule pas la génération par du code, SVG, découpage ou collage. Ne lance aucune commande et ne modifie aucun fichier de bibliothèque ; le Studio importe et valide le fichier.',
    'Réponds selon le schéma JSON avec status=completed et imagePath égal au chemin absolu du vrai fichier produit par l’outil natif, jamais un chemin supposé.',
  ].filter(Boolean).join('\n\n');
}
