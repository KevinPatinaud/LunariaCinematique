import type { Actor, Asset, AssetRef } from './model.js';
import type { ImageSize } from './backgroundCorrection.js';
import type { AiImageProvider } from './aiProviders.js';
import type { ImageTaskContext, ImageTaskMetadata, ImageTaskStatus } from './imageTasks.js';
import type { AnimationFrame, AnimationScope } from './presentation/types.js';
import { characterFolder, poseReference } from './poseGeneration.js';

export type AnimationPreset = 'walk' | 'idle' | 'talk' | 'run' | 'jump' | 'custom';
export type AnimationFacing = 'right' | 'left';

export interface AnimationPresetSpec {
  id: AnimationPreset;
  label: string;
  slot: string;
  description: string;
  columns: number;
  rows: number;
  fps: number;
  loop: boolean;
  stridePx?: number;
  defaultInstructions: string;
}

export const ANIMATION_PRESETS: Record<AnimationPreset, AnimationPresetSpec> = {
  walk: {
    id: 'walk',
    label: 'Marche (prioritaire)',
    slot: 'move',
    description: 'Cycle de marche 2D en 6 poses nettes (3 × 2) : alternance franche jambe avant / jambe arrière, zéro patinage.',
    columns: 3,
    rows: 2,
    fps: 8,
    loop: true,
    stridePx: 110,
    defaultInstructions: 'Cycle de marche naturel, fluide et bouclable, en conservant strictement l’expression du visage, la forme, les couleurs et les proportions de l’image statique de référence.',
  },
  idle: {
    id: 'idle',
    label: 'Repos · Respiration',
    slot: 'idle',
    description: 'Respiration vivante sur place en 4 poses douces, idéale avant et après un déplacement.',
    columns: 4,
    rows: 1,
    fps: 6,
    loop: true,
    defaultInstructions: 'Animation d’attente vivante sur place : légère respiration, micro-balancement des feuilles et regard attentif.',
  },
  talk: {
    id: 'talk',
    label: 'Parole',
    slot: 'talk',
    description: '4 poses expressives pour accompagner les bulles de dialogue.',
    columns: 4,
    rows: 1,
    fps: 7,
    loop: true,
    defaultInstructions: 'Animation de parole chaleureuse : bouche qui s’anime et petits gestes expressifs des bras tout en gardant les pieds fixes.',
  },
  run: {
    id: 'run',
    label: 'Course',
    slot: 'run',
    description: 'Cycle dynamique en 8 poses légèrement penché vers l’avant.',
    columns: 4,
    rows: 2,
    fps: 13,
    loop: true,
    stridePx: 165,
    defaultInstructions: 'Cycle de course énergique, corps légèrement incliné vers l’avant, foulées rapides et bouclables.',
  },
  jump: {
    id: 'jump',
    label: 'Saut',
    slot: 'jump',
    description: '6 poses : impulsion, envol, sommet et réception.',
    columns: 3,
    rows: 2,
    fps: 10,
    loop: false,
    defaultInstructions: 'Saut complet en 6 étapes : flexion d’élan, décollage, sommet en l’air, descente et réception souple.',
  },
  custom: {
    id: 'custom',
    label: 'Animation libre',
    slot: 'custom_anim',
    description: 'Décris librement n’importe quelle animation réutilisable (joie, surprise, peur, salut…).',
    columns: 4,
    rows: 1,
    fps: 8,
    loop: true,
    defaultInstructions: 'Décris précisément l’action et la progression d’une case à l’autre.',
  },
};

export function animationPresetSpec(preset: AnimationPreset, scope?: AnimationScope): AnimationPresetSpec {
  const spec = ANIMATION_PRESETS[preset];
  return preset === 'walk' && scope === 'cinematic'
    ? { ...spec, columns: 4, rows: 2, fps: 12, description: 'Deux pas en huit poses, avec transfert du poids et alternance des appuis.' }
    : spec;
}

export function usesWalkPoseGuide(request: Pick<AnimationGenerationRequest, 'preset' | 'scope' | 'columns' | 'rows'>) {
  return request.preset === 'walk' && request.scope === 'cinematic' && request.rows === 2 &&
    (request.columns === 3 || request.columns === 4);
}

export interface AnimationGenerationRequest {
  speciesId?: string;
  characterName: string;
  animationName?: string;
  preset: AnimationPreset;
  slot: string;
  scope?: AnimationScope;
  ref: AssetRef;
  columns: number;
  rows: number;
  fps: number;
  loop: boolean;
  facing: AnimationFacing;
  stridePx?: number;
  instructions: string;
  aiProvider?: AiImageProvider;
  codexModel?: string;
  context?: ImageTaskContext;
}

export interface AnimationGenerationJob extends ImageTaskMetadata {
  id: string;
  sourceRef: AssetRef;
  speciesId?: string;
  characterName: string;
  animationName: string;
  preset: AnimationPreset;
  slot: string;
  scope?: AnimationScope;
  columns: number;
  rows: number;
  frameCount: number;
  fps: number;
  loop: boolean;
  facing: AnimationFacing;
  recommendedStridePx?: number;
  status: ImageTaskStatus;
  message: string;
  sourceUrl: string;
  candidateUrl?: string;
  aiProvider?: AiImageProvider;
  codexModel?: string;
  width?: number;
  height?: number;
  cellWidth?: number;
  cellHeight?: number;
  sheetRef?: AssetRef;
}

export function defaultAnimationReference(options: {
  scope: AnimationScope;
  actor?: Pick<Actor, 'asset' | 'name' | 'animation'>;
  actorSpeciesId?: string;
  speciesId?: string;
  speciesSpriteRef?: AssetRef;
  assets: Asset[];
}): { ref?: AssetRef; masterRef?: AssetRef; fromActorAsset: boolean } {
  const actorMatchesTarget = Boolean(
    options.actor?.asset &&
    (!options.speciesId || !options.actorSpeciesId || options.actorSpeciesId === options.speciesId),
  );
  const masterRef = actorMatchesTarget && options.actor
    ? poseReference(options.actor as Actor, options.assets).ref
    : options.speciesSpriteRef
      ? poseReference({ asset: options.speciesSpriteRef } as Actor, options.assets).ref
      : undefined;

  if (options.scope === 'cinematic') {
    if (actorMatchesTarget && options.actor?.asset) {
      return { ref: options.actor.asset, masterRef, fromActorAsset: true };
    }
    return {
      ref: options.speciesSpriteRef ?? masterRef,
      masterRef,
      fromActorAsset: false,
    };
  }

  return {
    ref: masterRef ?? options.speciesSpriteRef ?? options.actor?.asset,
    masterRef,
    fromActorAsset: false,
  };
}

function normalizeLabelToken(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cleanStaticReferenceLabel(ref: string, assetName?: string): { label: string; isMaster: boolean } {
  const filename = (ref.split('/').at(-1) ?? '').replace(/\.[^.]+$/, '');
  const isMaster = /(?:^|[_ -])master(?:[_ .-]|$)/i.test(filename);
  const raw = (assetName?.trim() || filename)
    .replace(/(?:\s*·\s*|[_ -]+)v\d+$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { label: raw, isMaster };
}

export function defaultAnimationName(options: {
  characterName: string;
  preset: AnimationPreset;
  scope: AnimationScope;
  ref?: AssetRef;
  assetName?: string;
}): string {
  const presetLabel = ANIMATION_PRESETS[options.preset].label.replace(' (prioritaire)', '');
  const baseName = options.characterName.trim() || 'Personnage';
  if (options.scope !== 'cinematic' || !options.ref) {
    return `${baseName} — ${presetLabel}`.slice(0, 160);
  }
  const { label, isMaster } = cleanStaticReferenceLabel(options.ref, options.assetName);
  if (isMaster || !label) {
    return `${baseName} — ${presetLabel}`.slice(0, 160);
  }
  const normBase = normalizeLabelToken(baseName);
  const normLabel = normalizeLabelToken(label);
  if (!normLabel || normLabel === normBase || normBase.includes(normLabel)) {
    return `${baseName} — ${presetLabel}`.slice(0, 160);
  }
  if (normLabel.startsWith(`${normBase} `)) {
    return `${label} — ${presetLabel}`.slice(0, 160);
  }
  return `${baseName} (${label}) — ${presetLabel}`.slice(0, 160);
}

export function animationOutputRef(request: Pick<AnimationGenerationRequest, 'ref' | 'preset' | 'slot' | 'scope'>, id: string): AssetRef {
  const folder = characterFolder(request.ref) ?? 'library://studio_generated/characters/';
  const slug = (request.preset === 'custom' ? request.slot : request.preset)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'anim';
  const bucket = request.scope === 'cinematic' ? 'cinematics' : 'generated';
  return `${folder}animations/${bucket}/${slug}-${id}.png` as AssetRef;
}

export function animationFramesFromSheet(
  sheetRef: AssetRef,
  size: ImageSize,
  columns: number,
  rows: number,
  fps: number,
): AnimationFrame[] {
  const frameDuration = Math.max(0.01, Math.min(60, Number((1 / Math.max(1, fps)).toFixed(4))));
  const frames: AnimationFrame[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const left = Math.floor((col * size.width) / columns);
      const top = Math.floor((row * size.height) / rows);
      const width = Math.max(1, Math.floor(((col + 1) * size.width) / columns) - left);
      const height = Math.max(1, Math.floor(((row + 1) * size.height) / rows) - top);
      frames.push({
        asset: sheetRef,
        duration: frameDuration,
        region: { x: left, y: top, width, height },
        anchor: { x: 0.5, y: 1 },
      });
    }
  }
  return frames;
}

function phaseBreakdown(preset: AnimationPreset, columns: number, rows: number): string {
  const count = columns * rows;
  if (preset === 'walk') {
    if (columns === 3 && rows === 2) {
      return [
        'DÉCOMPOSITION STRICTE DES 6 CASES (grille 3 colonnes × 2 lignes, lecture gauche→droite, haut→bas) — ATTENTION, LA LIGNE 2 NE DOIT JAMAIS COPIER LA LIGNE 1 :',
        'Différencie clairement la JAMBE PROCHE (premier plan, teinte vive éclairée, passe DEVANT le corps) et la JAMBE LOINTAINE (arrière-plan, teinte plus sombre/ombrée, passe DERRIÈRE le corps), et fais de même pour les deux bras en opposition avec les jambes.',
        '- Case 1 (Ligne 1, Col 1 — Contact A) : JAMBE PROCHE tendue VERS L’AVANT (pied posé devant), JAMBE LOINTAINE (sombre) tendue VERS L’ARRIÈRE ; BRAS PROCHE balancé vers l’arrière, BRAS LOINTAIN vers l’avant.',
        '- Case 2 (Ligne 1, Col 2 — Appui/Passage A) : JAMBE PROCHE plantée VERTICALEMENT sous le corps (corps légèrement abaissé), JAMBE LOINTAINE (sombre) pliée et légèrement levée en passant DERRIÈRE la jambe proche ; bras près du corps.',
        '- Case 3 (Ligne 1, Col 3 — Impulsion A) : JAMBE PROCHE pousse vers l’arrière, JAMBE LOINTAINE (sombre) s’avance VERS L’AVANT genou levé ; corps légèrement plus haut.',
        '- Case 4 (Ligne 2, Col 1 — Contact B, PAS OPPOSÉ) : le personnage regarde TOUJOURS DANS LE MÊME SENS, mais c’est maintenant la JAMBE LOINTAINE (sombre, derrière) qui est tendue VERS L’AVANT et la JAMBE PROCHE (claire, devant) qui est tendue VERS L’ARRIÈRE ; BRAS PROCHE balancé vers l’avant, BRAS LOINTAIN vers l’arrière.',
        '- Case 5 (Ligne 2, Col 2 — Appui/Passage B) : JAMBE LOINTAINE (sombre) plantée VERTICALEMENT sous le corps (corps légèrement abaissé), JAMBE PROCHE (claire) pliée et levée en passant DEVANT la jambe lointaine ; bras près du corps.',
        '- Case 6 (Ligne 2, Col 3 — Impulsion B) : JAMBE LOINTAINE pousse vers l’arrière, JAMBE PROCHE (claire) s’avance VERS L’AVANT prête à se poser pour reboucler sur la Case 1 ; corps légèrement plus haut.',
      ].join('\n');
    }
    if (columns === 4 && rows === 2) {
      return [
        'DÉCOMPOSITION STRICTE DES 8 CASES (4 colonnes × 2 lignes) — LA LIGNE 2 DOIT ALTERNER LA JAMBE OPPOSÉE, JAMAIS COPIER LA LIGNE 1 :',
        'Différencie clairement la JAMBE PROCHE (claire, au premier plan) et la JAMBE LOINTAINE (plus sombre, à l’arrière-plan), avec bras en opposition.',
        '1. Contact A : JAMBE PROCHE devant, JAMBE LOINTAINE (sombre) derrière ; bras proche arrière, bras lointain avant.',
        '2. Appui bas A : poids sur la JAMBE PROCHE au sol (corps bas), jambe lointaine décolle derrière.',
        '3. Passage A : JAMBE PROCHE verticale au sol, JAMBE LOINTAINE (sombre) pliée passe derrière elle.',
        '4. Sommet A : JAMBE PROCHE pousse arrière, JAMBE LOINTAINE (sombre) s’avance devant.',
        '5. Contact B (PAS OPPOSÉ, MÊME ORIENTATION) : JAMBE LOINTAINE (sombre) devant, JAMBE PROCHE (claire) derrière ; bras proche avant, bras lointain arrière.',
        '6. Appui bas B : poids sur la JAMBE LOINTAINE au sol (corps bas), jambe proche décolle derrière.',
        '7. Passage B : JAMBE LOINTAINE verticale au sol, JAMBE PROCHE (claire) pliée passe DEVANT elle.',
        '8. Sommet B : JAMBE LOINTAINE pousse arrière, JAMBE PROCHE (claire) s’avance prête à reboucler sur la case 1.',
      ].join('\n');
    }
    return `Produis ${count} poses progressives d’un cycle de marche fluide qui alterne véritablement jambe proche (claire) et jambe lointaine (plus sombre) et reboucle proprement.`;
  }
  if (preset === 'run') {
    return `Produis ${count} poses dynamiques d’un cycle de course en boucle en alternant franchement jambe proche (claire) et jambe lointaine (plus sombre), bras et feuilles en opposition, corps légèrement incliné vers l’avant.`;
  }
  if (preset === 'idle') {
    return `Produis ${count} poses douces d’attente sur place en boucle (respiration subtile, léger mouvement des feuilles/cheveux, pieds parfaitement fixes au sol).`;
  }
  if (preset === 'talk') {
    return `Produis ${count} poses expressives de dialogue en boucle (bouche qui s’ouvre/varie, expressions et gestes naturels, pieds fixes au sol).`;
  }
  if (preset === 'jump') {
    return `Produis ${count} poses successives d’un saut complet (flexion d’élan → décollage → sommet → descente → réception amortie).`;
  }
  return `Produis ${count} poses progressives cohérentes pour l’animation décrite ci-dessous.`;
}

export function animationGenerationPrompt(
  request: AnimationGenerationRequest,
  variant: 'codex' | 'gemini' = 'codex',
  background: 'transparent' | 'magenta' = variant === 'codex' ? 'transparent' : 'magenta',
): string {
  const count = request.columns * request.rows;
  const facingText = request.facing === 'left'
    ? 'ORIENTATION VERROUILLÉE : le personnage regarde et avance vers la GAUCHE (vue profil 3/4 vers la gauche) dans ABSOLUMENT TOUTES les cases. Ne le retourne JAMAIS vers la droite.'
    : 'ORIENTATION VERROUILLÉE : le personnage regarde et avance vers la DROITE (vue profil 3/4 vers la droite) dans ABSOLUMENT TOUTES les cases. Ne le retourne JAMAIS vers la gauche.';

  const isCinematic = request.scope === 'cinematic';
  const hasWalkGuide = usesWalkPoseGuide(request);
  const fidelityRule = isCinematic
    ? 'FIDÉLITÉ ABSOLUE À L’IMAGE STATIQUE DE RÉFÉRENCE : IMAGE 1 est l’image statique préalablement sélectionnée dans le plan. Conserve STRICTEMENT son expression faciale et son émotion exactes (regard, yeux, sourcils, bouche, mimique — ne remplace JAMAIS son expression par un sourire neutre générique), ainsi que sa forme, sa silhouette, ses feuilles/accessoires, ses couleurs, son style peint 2D et ses PROPORTIONS COMPACTES dans CHAQUE case. N’ALLONGE PAS ses jambes en longues tiges fines : garde exactement la taille de jambes, de pieds et de bras visible sur IMAGE 1.'
    : 'FIDÉLITÉ ANATOMIQUE ABSOLUE : IMAGE 1 est la référence officielle du personnage. Reproduis STRICTEMENT son visage, son expression, ses yeux, ses feuilles, sa forme, son style peint 2D, ses couleurs et ses PROPORTIONS COMPACTES dans CHAQUE case. N’ALLONGE PAS ses jambes en longues tiges fines : garde exactement la taille de jambes, de pieds et de bras visible sur IMAGE 1.';

  const core = [
    `Crée une planche de sprites (spritesheet) d’animation 2D de qualité professionnelle pour le personnage « ${request.characterName} » du jeu Lunaria.`,
    fidelityRule,
    `GRILLE RÉGULIÈRE STRICTE : exactement ${request.columns} colonnes × ${request.rows} lignes (${count} cases de taille STRICTEMENT identique), réparties uniformément sur toute l’image. Laisse une marge confortable autour du personnage dans chaque case afin qu’aucune feuille, main ou pied ne touche le bord ni une case voisine.`,
    'ÉCHELLE & ANCRAGE CONSTANTS : la tête et le torse gardent leur taille et leur alignement horizontal. Le pied d’appui touche la ligne de sol virtuelle. Le pied libre se soulève.',
    facingText,
    ...(hasWalkGuide ? [
      'IMAGE 2 — GUIDE DE MOUVEMENT : reproduis la disposition des membres case par case. Orange = membre proche, bleu = membre éloigné. Garde l’identité de ces membres quand ils se croisent et rends l’échange des appuis net, y compris dans les deux poses de passage. Utilise le dessin original de l’image 1 pour la tête, les feuilles, la texture, les couleurs et les proportions. Les traits et couleurs du guide ne figurent pas dans le rendu.',
      'Le corps reste presque immobile horizontalement et s’abaisse légèrement à la prise d’appui. Un pied reste au sol dans chaque pose. Fais passer l’autre pied près du sol, avec un changement visible du contact à la flexion puis à l’extension. Les bras compensent en douceur, et l’amplitude du pas suit la consigne de l’auteur. Termine juste avant le premier contact pour raccorder la boucle.',
    ] : []),
    phaseBreakdown(request.preset, request.columns, request.rows),
    background === 'transparent'
      ? 'PNG AVEC CANAL ALPHA : tout l’espace autour des personnages et entre les jambes, bras et feuilles doit être réellement transparent. Dessine uniquement les poses demandées sans décor, dégradé, ombre portée, texte, grille ni damier peint.'
      : 'FOND DE DÉTOURAGE : remplis tout le fond, y compris entre les cases, les jambes, les bras et les feuilles, en MAGENTA PUR UNI (#FF00FF, RGB 255,0,255). Utilise un aplat uniforme, sans dégradé, décor, ombre, reflet rose, ligne de grille, cadre, numéro, texte ou damier. Le Studio convertira ce fond en transparence.',
    `CONSIGNE DE L’AUTEUR : ${JSON.stringify({ personnage: request.characterName, animation: request.animationName || ANIMATION_PRESETS[request.preset].label, boucle: request.loop, details: request.instructions })}`,
  ];

  if (variant === 'codex') {
    return [
      '$imagegen ' + core[0] + ' Use case: stylized-concept.',
      background === 'transparent'
        ? 'Appelle une seule fois l’outil natif image_gen / imagegen avec transparent_background=true. Demande explicitement un PNG avec un vrai canal alpha dans le prompt de l’outil.'
        : 'Appelle une seule fois l’outil natif image_gen / imagegen avec transparent_background=false. Demande explicitement un fond #FF00FF dans le prompt de l’outil.',
      ...(hasWalkGuide ? ['Joins les deux images à cet appel dans cet ordre : le personnage à reproduire, puis le guide des poses.'] : []),
      ...core.slice(1),
      'Le Studio contrôle la transparence et la grille à partir des pixels. Renvoie le vrai PNG dès que l’outil l’a produit, même si le fond ou certaines poses diffèrent de la consigne.',
      'Réponds status=unavailable uniquement si l’outil natif n’a produit aucun fichier. Ne simule pas la planche par du code ou du collage. Ne modifie aucun fichier de bibliothèque.',
      'Réponds selon le schéma JSON avec status=completed et imagePath égal au chemin absolu du vrai fichier produit par l’outil natif.',
    ].join('\n\n');
  }
  return core.join('\n\n');
}
