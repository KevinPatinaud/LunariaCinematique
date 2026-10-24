import React, { useEffect, useRef, useState } from "react";
import type { Asset } from "../../shared/model.js";
import type { SoundDefinition } from "../../shared/presentation/types.js";

/** One bounded voice, stopped on navigation or replacement, including pending play promises. */
export function SoundPreview({
  sound,
  assets,
  label = "Écouter",
}: {
  sound?: SoundDefinition;
  assets: Asset[];
  label?: string;
}) {
  const player = useRef<HTMLAudioElement | null>(null),
    [playing, setPlaying] = useState(false),
    [error, setError] = useState("");
  const stop = () => {
    const audio = player.current;
    player.current = null;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    setPlaying(false);
  };
  useEffect(() => {
    stop();
    setError("");
    return () => {
      const audio = player.current;
      player.current = null;
      audio?.pause();
      audio?.removeAttribute("src");
    };
  }, [sound?.id, sound?.asset]);
  useEffect(() => {
    if (player.current && sound) {
      player.current.volume = sound.volume;
      player.current.loop = sound.loop;
    }
  }, [sound?.volume, sound?.loop]);
  return (
    <span className="lp-sound-preview">
      <button
        disabled={!sound}
        aria-label={label}
        onClick={() => {
          if (player.current) {
            stop();
            return;
          }
          const asset = assets.find((a) => a.ref === sound?.asset);
          if (!sound || !asset) {
            setError("Fichier absent de la bibliothèque liée.");
            return;
          }
          const audio = new Audio(asset.url);
          player.current = audio;
          audio.volume = sound.volume;
          audio.loop = sound.loop;
          audio.preservesPitch = false;
          audio.playbackRate =
            1 + (Math.random() * 2 - 1) * sound.pitchVariation;
          audio.onended = () => {
            if (player.current === audio) stop();
          };
          setPlaying(true);
          setError("");
          void audio
            .play()
            .then(() => {
              if (player.current !== audio) audio.pause();
            })
            .catch(() => {
              if (player.current === audio) {
                stop();
                setError("Lecture impossible. Vérifie le fichier audio.");
              }
            });
        }}
      >
        {playing ? "Arrêter" : label}
      </button>
      {error && <small role="alert">{error}</small>}
    </span>
  );
}
