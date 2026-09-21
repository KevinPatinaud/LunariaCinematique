import { newShot, newBubble, type Cinematic, type AssetRef } from './model.js';
export function demoCinematic(): Cinematic {
  const greenhouse = 'library://01_europe/lunaria/interieur_serre/greenhouse_aisle_wide_variant_v01.png' as AssetRef;
  const dawn = 'library://01_europe/lunaria/exterieur_et_entree/aube_sur_la_boutique_lunaria_v01.png' as AssetRef;
  const a = newShot(greenhouse); a.name = 'La serre endormie'; a.duration = 7; a.camera.preset = 'zoom_in';
  const intro = newBubble(null, 'narration'); intro.text = 'Sous la verrière, le jour se glissait entre les feuilles.';
  intro.x = 0.24; intro.y = 0.12; intro.width = 0.52; intro.style = 'simple';
  intro.frameAsset = 'library://06_ui/dialogues/dialogue_panel_simple_v01.png'; a.bubbles.push(intro);
  const b = newShot(greenhouse); b.name = 'Un bruit dans les feuilles'; b.duration = 6; b.camera.preset = 'pan_right';
  const speech = newBubble(); speech.text = 'Tu as entendu ?'; speech.x = 0.48; speech.y = 0.22; speech.width = 0.33;
  speech.tail.x = 0.34; speech.tail.y = 0.7; b.bubbles.push(speech);
  const c = newShot(dawn); c.name = 'Dehors, un autre monde'; c.duration = 5; c.camera.preset = 'zoom_out';
  return { schemaVersion: 1, id: 'CIN_EXEMPLE_SERRE', title: 'Le murmure de la serre', stage: { width: 1600, height: 900 }, shots: [a, b, c] };
}
