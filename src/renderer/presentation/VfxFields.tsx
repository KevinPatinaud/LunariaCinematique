import React, { useEffect, useState } from "react";
import type { Asset } from "../../shared/model.js";
import type { VfxDefinition } from "../../shared/presentation/types.js";
import { VfxGlyph } from "./CuePrimitives.js";
import { AssetChoice, Choose } from "./PresentationFields.js";
import { Num } from "../game/CombatFields.js";

export function VfxFields({
  value: v,
  assets,
  patch,
}: {
  value: VfxDefinition;
  assets: Asset[];
  patch: (p: Record<string, unknown>, key?: string) => void;
}) {
  const [time, setTime] = useState(0),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    let handle = 0,
      start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      setTime(t);
      if (t < v.duration) handle = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [playing, v.duration]);
  return (
    <>
      <Choose
        label="Préréglage VFX"
        value={v.preset}
        options={[
          "impact",
          "dust",
          "leaves",
          "halo",
          "flash",
          "explosion",
          "trail",
          "smoke",
        ].map((id) => ({ id, name: id }))}
        change={(preset) => patch({ preset })}
      />
      <svg className="lp-vfx" viewBox="-180 -180 360 360">
        <VfxGlyph definition={v} age={time} assets={assets} />
      </svg>
      <button
        onClick={() => {
          setTime(0);
          setPlaying(true);
        }}
      >
        Prévisualiser le VFX
      </button>
      <div className="gd-form-grid">
        <Num
          label="Durée VFX (s)"
          value={v.duration}
          min={0.01}
          max={10}
          change={(duration) => patch({ duration })}
        />
        <Num
          label="Taille"
          value={v.size}
          min={1}
          max={300}
          change={(size) => patch({ size })}
        />
        <Num
          label="Intensité"
          value={v.intensity}
          max={1}
          change={(intensity) => patch({ intensity })}
        />
        <Num
          label="Quantité"
          value={v.quantity}
          min={1}
          max={64}
          integer
          change={(quantity) => patch({ quantity })}
        />
        <Num
          label="Instances VFX max."
          value={v.maxInstances}
          min={1}
          max={128}
          integer
          change={(maxInstances) => patch({ maxInstances })}
        />
        <label className="gd-field">
          <span>Couleur</span>
          <input
            type="color"
            value={v.color}
            onChange={(e) => patch({ color: e.target.value })}
          />
        </label>
      </div>
      <Choose
        label="Attache par défaut"
        value={v.attach}
        options={["center", "feet", "head", "launch"].map((id) => ({
          id,
          name: id,
        }))}
        change={(attach) => patch({ attach })}
      />
      <AssetChoice
        label="Image optionnelle"
        value={v.asset}
        assets={assets}
        empty
        change={(asset) => patch({ asset })}
      />
      <p>
        Ce VFX ne provoque ni dégât ni changement de vitesse. Les particules
        sont plafonnées ; la réduction des mouvements remplace les projections
        par un halo discret.
      </p>
    </>
  );
}
