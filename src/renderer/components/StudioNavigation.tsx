import React, { useEffect, useRef } from "react";
import type { PresentationSection } from "../../shared/presentation/types.js";
import "./studioNavigation.css";

export type GameSection =
  | "lunas"
  | "campaign"
  | "levels"
  | "plants"
  | "enemies"
  | "audit"
  | "abilities"
  | "behaviors"
  | "variables"
  | PresentationSection;

export const ADVANCED_SECTIONS: ReadonlyArray<{
  id: GameSection;
  icon: string;
  label: string;
  shortLabel: string;
  hint: string;
}> = [
  {
    id: "abilities",
    icon: "✧",
    label: "Modèles de capacités",
    shortLabel: "Capacités",
    hint: "Capacités réutilisables",
  },
  {
    id: "behaviors",
    icon: "◇",
    label: "Modèles de comportements",
    shortLabel: "Comportements",
    hint: "Comportements réutilisables",
  },
  {
    id: "variables",
    icon: "⚑",
    label: "Variables",
    shortLabel: "Variables",
    hint: "État scénarisé",
  },
  {
    id: "animations",
    icon: "▶",
    label: "Animations communes",
    shortLabel: "Animations",
    hint: "Pour tous les personnages",
  },
  {
    id: "profiles",
    icon: "♟",
    label: "Profils avancés",
    shortLabel: "Profils",
    hint: "Liaisons et sons",
  },
  {
    id: "audio",
    icon: "♪",
    label: "Sons",
    shortLabel: "Sons",
    hint: "Ambiances et attaques",
  },
  {
    id: "vfx",
    icon: "✦",
    label: "Effets visuels",
    shortLabel: "Effets",
    hint: "Impacts et particules",
  },
];

export function isAdvancedSection(section: GameSection): boolean {
  return ADVANCED_SECTIONS.some((item) => item.id === section);
}

export function isMoreSection(section: GameSection): boolean {
  return section === "lunas" || isAdvancedSection(section);
}

export function advancedSectionMeta(section: GameSection) {
  return ADVANCED_SECTIONS.find((item) => item.id === section);
}

interface StudioNavigationProps {
  mode: "cinematics" | "levels";
  section: GameSection;
  levelCount: number;
  cinematicCount: number;
  disabled: boolean;
  onSelectCinematics: () => void;
  onSelectSection: (section: GameSection) => void;
}

export function StudioNavigation({
  mode,
  section,
  levelCount,
  cinematicCount,
  disabled,
  onSelectCinematics,
  onSelectSection,
}: StudioNavigationProps) {
  const [moreOpen, setMoreOpen] = React.useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMoreOpen(false);
        moreTriggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (disabled && moreOpen) {
      setMoreOpen(false);
    }
  }, [disabled, moreOpen]);

  const activeInMore = mode === "levels" && isMoreSection(section);
  const activeAdvanced = mode === "levels" ? advancedSectionMeta(section) : undefined;
  const moreLabel =
    mode === "levels" && section === "lunas"
      ? "Économie Luna"
      : activeAdvanced
        ? `Avancé · ${activeAdvanced.shortLabel}`
        : "Plus";

  const chooseFromMore = (target: GameSection) => {
    setMoreOpen(false);
    onSelectSection(target);
  };

  return (
    <nav className="studio-sections" aria-label="Navigation du Studio">
      <button
        type="button"
        className={mode === "levels" && section === "campaign" ? "active" : ""}
        aria-pressed={mode === "levels" && section === "campaign"}
        disabled={disabled}
        onClick={() => onSelectSection("campaign")}
      >
        Campagne
      </button>
      <button
        type="button"
        className={mode === "levels" && section === "levels" ? "active" : ""}
        aria-pressed={mode === "levels" && section === "levels"}
        disabled={disabled}
        onClick={() => onSelectSection("levels")}
      >
        Niveaux
        <span className="studio-nav-count" aria-hidden="true">
          {levelCount}
        </span>
      </button>
      <button
        type="button"
        className={mode === "cinematics" ? "active" : ""}
        aria-pressed={mode === "cinematics"}
        disabled={disabled}
        onClick={onSelectCinematics}
      >
        Cinématiques
        {cinematicCount > 0 && (
          <span className="studio-nav-count" aria-hidden="true">
            {cinematicCount}
          </span>
        )}
      </button>
      <button
        type="button"
        className={mode === "levels" && section === "plants" ? "active" : ""}
        aria-pressed={mode === "levels" && section === "plants"}
        disabled={disabled}
        onClick={() => onSelectSection("plants")}
      >
        Plantes
      </button>
      <button
        type="button"
        className={mode === "levels" && section === "enemies" ? "active" : ""}
        aria-pressed={mode === "levels" && section === "enemies"}
        disabled={disabled}
        onClick={() => onSelectSection("enemies")}
      >
        Ennemis
      </button>
      <button
        type="button"
        className={mode === "levels" && section === "audit" ? "active" : ""}
        aria-pressed={mode === "levels" && section === "audit"}
        disabled={disabled}
        onClick={() => onSelectSection("audit")}
      >
        Audit
      </button>
      <div
        ref={moreRef}
        className={`studio-more-menu${activeInMore ? " active" : ""}${moreOpen ? " open" : ""}`}
      >
        <button
          ref={moreTriggerRef}
          type="button"
          className={`studio-more-trigger${activeInMore || moreOpen ? " active" : ""}`}
          aria-label="Plus de sections et options avancées"
          aria-expanded={moreOpen}
          disabled={disabled}
          onClick={() => setMoreOpen((open) => !open)}
        >
          <span>{moreLabel}</span>
        </button>
        {moreOpen && (
          <div className="studio-more-popover" role="region" aria-label="Autres écrans et options avancées">
            <div className="studio-more-group">
              <span className="studio-more-heading">Économie</span>
              <button
                type="button"
                className={mode === "levels" && section === "lunas" ? "active" : ""}
                disabled={disabled}
                onClick={() => chooseFromMore("lunas")}
              >
                <span className="studio-more-icon" aria-hidden="true">☾</span>
                <span>
                  <b>Économie Luna</b>
                  <small>Drops aléatoires, primes et synthèse</small>
                </span>
              </button>
            </div>
            <div className="studio-more-group">
              <span className="studio-more-heading">
                Options avancées · modèles et ressources partagés
              </span>
              <div className="studio-more-grid">
                {ADVANCED_SECTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={mode === "levels" && section === item.id ? "active" : ""}
                    disabled={disabled}
                    onClick={() => chooseFromMore(item.id)}
                  >
                    <span className="studio-more-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>
                      <b>{item.label}</b>
                      <small>{item.hint}</small>
                    </span>
                  </button>
                ))}
              </div>
              <p className="studio-more-note">
                Les réglages quotidiens se font directement sur la fiche de chaque plante ou ennemi.
              </p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
