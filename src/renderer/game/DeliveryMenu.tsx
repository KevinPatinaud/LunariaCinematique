import React, { useEffect, useRef } from "react";
import type { DeliveryAction } from "./ProjectDelivery.js";

interface DeliveryMenuProps {
  busy: boolean;
  disabled: boolean;
  errorCount: number;
  onExecute: (action: DeliveryAction) => void;
  onShowIssues: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function DeliveryMenu({
  busy,
  disabled,
  errorCount,
  onExecute,
  onShowIssues,
  onOpenChange,
}: DeliveryMenuProps) {
  const deliveryRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        deliveryRef.current?.open &&
        !deliveryRef.current.contains(event.target as Node)
      ) {
        deliveryRef.current.open = false;
        onOpenChange?.(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [onOpenChange]);

  useEffect(() => {
    if (disabled && deliveryRef.current?.open) {
      deliveryRef.current.open = false;
      onOpenChange?.(false);
    }
  }, [disabled, onOpenChange]);

  return (
    <details
      ref={deliveryRef}
      className="gd-delivery"
      onToggle={(event) => onOpenChange?.(event.currentTarget.open)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.currentTarget.open = false;
          onOpenChange?.(false);
          event.currentTarget.querySelector("summary")?.focus();
        }
      }}
    >
      <summary
        aria-label="Publier et exporter"
        title="Publier la campagne ou exporter le jeu"
        aria-disabled={disabled || undefined}
        onClick={(event) => {
          if (disabled) event.preventDefault();
        }}
      >
        <span>Publier</span>
        {errorCount > 0 && (
          <span
            className="gd-delivery-badge"
            title={`${errorCount} point${errorCount > 1 ? "s" : ""} à corriger`}
            aria-hidden="true"
          />
        )}
      </summary>
      <div
        className="gd-delivery-menu"
        onClick={(event) => {
          if (
            (event.target as Element).closest("button") &&
            deliveryRef.current
          ) {
            deliveryRef.current.open = false;
            onOpenChange?.(false);
          }
        }}
      >
        <p>
          <strong>Le projet reste ton fichier de travail.</strong> Ces actions
          préparent sa version jouable.
        </p>
        {errorCount > 0 && (
          <button
            type="button"
            className="gd-delivery-errors"
            onClick={onShowIssues}
          >
            {errorCount} point{errorCount > 1 ? "s" : ""} à corriger avant de
            continuer →
          </button>
        )}
        <button
          type="button"
          className="gd-publish"
          disabled={busy || errorCount > 0}
          onClick={() => onExecute({ kind: "publish" })}
        >
          Publier la campagne
        </button>
        <button
          type="button"
          className="gd-build"
          disabled={busy || errorCount > 0}
          title="Préparer le premier niveau jouable du parcours et choisir où le publier"
          onClick={() => onExecute({ kind: "publishWeb" })}
        >
          Publier le premier niveau sur le Web
        </button>
        <button
          type="button"
          className="gd-build gd-build-pc"
          disabled={busy || errorCount > 0}
          title="Synchroniser la campagne puis générer build/windows/Lunaria.exe"
          onClick={() => onExecute({ kind: "build", target: "windows" })}
        >
          Exporter pour PC
        </button>
        <button
          type="button"
          className="gd-build gd-build-android"
          disabled={busy || errorCount > 0}
          title="Synchroniser la campagne puis générer build/android/Lunaria.apk"
          onClick={() => onExecute({ kind: "build", target: "android" })}
        >
          Exporter pour Android
        </button>
        <button
          type="button"
          className="gd-build gd-deploy-android"
          disabled={busy || errorCount > 0}
          title="Compiler l’APK Android, l’installer sur le téléphone autorisé puis lancer Lunaria"
          onClick={() => onExecute({ kind: "deployAndroid" })}
        >
          Builder et Déployer sur le téléphone connecté
        </button>
        <small>
          La publication met à jour le jeu sélectionné. Un export crée ensuite
          son application PC ou Android.
        </small>
      </div>
    </details>
  );
}
