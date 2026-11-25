import React, { useEffect } from "react";
import type { Diagnostic } from "../../shared/diagnostics.js";
import { Diagnostics } from "../components/Diagnostics.js";
import { Icon } from "../components/Icon.js";

interface CinematicHelpModalProps {
  modal: "help" | "issues";
  busy: boolean;
  playing: boolean;
  diagnostics: Diagnostic[];
  onClose: () => void;
  onFocusDiagnostic: (issue: Diagnostic) => void;
  onFixDiagnostic: (issue: Diagnostic) => void;
  onChooseLibrary: () => void;
}

export function CinematicHelpModal({
  modal,
  busy,
  playing,
  diagnostics,
  onClose,
  onFocusDiagnostic,
  onFixDiagnostic,
  onChooseLibrary,
}: CinematicHelpModalProps) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const surface = document.querySelector<HTMLElement>(".modal");
    const focusables = () => [
      ...(surface?.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([hidden]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
      ) ?? []),
    ];
    const timer = setTimeout(() => focusables()[0]?.focus(), 0);
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const first = items[0],
        last = items[items.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !surface?.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !surface?.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", trap, true);
      previous?.focus();
    };
  }, [modal]);

  return (
    <div
      className="modal-backdrop"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={
          modal === "help"
            ? "Prendre en main le studio"
            : "Vérification de la cinématique"
        }
      >
        <button
          disabled={busy}
          className="icon-button modal-close"
          aria-label="Fermer"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
        {modal === "help" ? (
          <>
            <span className="overline">LUNARIA STUDIO</span>
            <h2>Ton histoire, plan par plan.</h2>
            <div className="help-step">
              <b>01</b>
              <div>
                <h3>Connecte la bibliothèque commune.</h3>
                <p>
                  Sélectionne le dossier qui contient les continents. Garde
                  personnages, objets (07_props) et bulles dans cette même
                  racine. L’enregistrement du projet conserve les références ; «
                  Sauvegarder la campagne… » copie aussi ses images et sons.
                </p>
              </div>
            </div>
            <div className="help-step">
              <b>02</b>
              <div>
                <h3>Compose un plan.</h3>
                <p>
                  Double-clique sur un décor, puis glisse tes PNG dans la scène.
                  Sélectionne un personnage avant d’ajouter sa bulle : la queue
                  le suivra.
                </p>
              </div>
            </div>
            <div className="help-step">
              <b>03</b>
              <div>
                <h3>Écris, puis regarde.</h3>
                <p>
                  Sélectionne une vignette puis « Lire depuis ce plan » en haut
                  à droite (Maj+Espace hors saisie). La lecture démarre au début
                  de ce plan, puis poursuit les suivants. « Tout lire » repart
                  du premier plan. Échap revient au plan sélectionné. Les bulles
                  se lisent dans l’ordre indiqué. Règle « Animation de la bulle
                  » et « Animation du texte », puis utilise « Tester la réplique
                  ». Un premier clic termine l’apparition du texte ; le suivant
                  passe à la réplique suivante. Pour un personnage, ennemi ou
                  objet, règle son entrée, ses Mouvements, sa destination B et
                  sa Disparition. Les boutons de test donnent un aperçu avec
                  curseur de temps.
                </p>
              </div>
            </div>
            <div className="help-step">
              <b>04</b>
              <div>
                <h3>Enregistre le JSON.</h3>
                <p>
                  Pour changer l’ordre, sélectionne un plan puis utilise les
                  flèches ou le menu Position au-dessus des vignettes. Tu peux
                  aussi faire glisser les plans. Ctrl+S enregistre ; Ctrl+Z
                  annule dans tout le projet. Le bouton Historique montre les
                  dernières actions. Le menu du fichier donne accès aux projets
                  récents et à Enregistrer sous. Le dossier godot du projet
                  contient le lecteur et son guide d’intégration.
                </p>
              </div>
            </div>
            <button className="button primary" onClick={onClose}>
              Commencer à créer
            </button>
          </>
        ) : (
          <>
            <Diagnostics
              issues={diagnostics}
              onFocus={onFocusDiagnostic}
              onFix={onFixDiagnostic}
              disabled={busy || playing}
            />
            <div className="modal-actions">
              <button
                className="button subtle"
                disabled={busy || playing}
                onClick={() => {
                  onClose();
                  onChooseLibrary();
                }}
              >
                Reconnecter la bibliothèque
              </button>
              <button className="button primary" onClick={onClose}>
                Retour à la scène
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
