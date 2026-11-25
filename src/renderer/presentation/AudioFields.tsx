import React from "react";
import type { Asset } from "../../shared/model.js";
import type { SoundDefinition } from "../../shared/presentation/types.js";
import { AssetChoice, Choose } from "./PresentationFields.js";
import { Num } from "../game/CombatFields.js";
import { SoundPreview } from "./SoundPreview.js";

export function AudioFields({
  value,
  assets,
  patch,
}: {
  value: SoundDefinition;
  assets: Asset[];
  patch: (p: Record<string, unknown>, key?: string) => void;
}) {
  return (
    <>
      <AssetChoice
        label="Fichier audio de la bibliothèque"
        value={value.asset}
        audio
        assets={assets}
        change={(asset) => patch({ asset })}
      />
      <Choose
        label="Catégorie / volume du jeu"
        value={value.bus}
        options={[
          { id: "sfx", name: "Effets sonores" },
          { id: "music", name: "Musique" },
          { id: "ambience", name: "Ambiance (volume sonore)" },
        ]}
        change={(bus) => patch({ bus })}
      />
      <div className="gd-form-grid">
        <Num
          label="Volume (0 à 1)"
          value={value.volume}
          max={1}
          change={(volume) => patch({ volume })}
        />
        <Num
          label="Variation de hauteur (±)"
          value={value.pitchVariation}
          max={0.2}
          change={(pitchVariation) => patch({ pitchVariation })}
        />
        <Num
          label="Instances simultanées max."
          value={value.maxInstances}
          min={1}
          max={32}
          integer
          change={(maxInstances) => patch({ maxInstances })}
        />
      </div>
      <label>
        <input
          type="checkbox"
          checked={value.loop}
          onChange={(e) => patch({ loop: e.target.checked })}
        />{" "}
        Boucle (arrêt à la disparition du porteur / de la scène)
      </label>
      <p>
        <SoundPreview sound={value} assets={assets} />
      </p>
    </>
  );
}
