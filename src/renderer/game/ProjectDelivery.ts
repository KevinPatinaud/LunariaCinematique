import type { ProjectSession } from '../../shared/projectSession.js';
import type { AndroidDeploymentProgress, GameAPI, GameBuildResult, GameBuildTarget } from '../../shared/game/types.js';

export type DeliveryAction = { kind: 'publish' } | { kind: 'playLevel'; levelId: string }
  | { kind: 'build'; target: GameBuildTarget } | { kind: 'deployAndroid' } | { kind: 'publishWeb' };
export interface AndroidDeploymentStatusState {
  phase: AndroidDeploymentProgress['phase'] | 'save';
  message: string;
  startedAt: number;
  status: 'running' | 'success' | 'error' | 'canceled';
}
type DeliveryAPI = Pick<GameAPI, 'publish' | 'publishWeb' | 'playLevel' | 'build' | 'deployAndroid' | 'onAndroidDeploymentProgress'>;
const artifactInfo = (result: GameBuildResult) => `${result.artifact}\n${(result.bytes / 1048576).toFixed(1)} Mo · SHA-256 ${result.sha256}`;

/** One save-before-delivery protocol; ProjectSession remains the sole document and operation lock. */
export class ProjectDelivery {
  private deployment: AndroidDeploymentStatusState | null = null;
  private listeners = new Set<() => void>();
  private generation = 0;
  private unsubscribeProgress?: () => void;

  constructor(private readonly session: ProjectSession, private readonly api: DeliveryAPI) {}

  getSnapshot = () => this.deployment;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private publish(state: AndroidDeploymentStatusState | null): void {
    this.deployment = state;
    for (const listener of this.listeners) listener();
  }
  private status(status: AndroidDeploymentStatusState['status'], message: string): void {
    if (this.deployment) this.publish({ ...this.deployment, status, message });
  }
  dismiss = (): void => {
    if (this.deployment?.status !== 'running') this.publish(null);
  };
  private reset(): void {
    this.generation++;
    this.unsubscribeProgress?.();
    this.unsubscribeProgress = undefined;
    this.publish(null);
  }
  connect = (): (() => void) => {
    let epoch = this.session.getSnapshot().epoch;
    const unsubscribe = this.session.subscribe(() => {
      const next = this.session.getSnapshot().epoch;
      if (next !== epoch) { epoch = next; this.reset(); }
    });
    return () => { unsubscribe(); this.reset(); };
  };

  execute = async (action: DeliveryAction): Promise<void> => {
    await this.session.run(async () => {
      // run() has synchronously committed the active field before this callback.
      const project = this.session.project, epoch = this.session.getSnapshot().epoch;
      const generation = ++this.generation;
      const current = () => generation === this.generation && epoch === this.session.getSnapshot().epoch;
      const android = action.kind === 'deployAndroid';
      if (android) this.publish({ phase: 'save', message: 'Enregistrement du projet…', startedAt: Date.now(), status: 'running' });
      try {
        if (action.kind === 'playLevel' && !project.levels.some(level => level.id === action.levelId))
          throw Error('Ce niveau n’existe plus dans le projet.');
        const saved = await this.session.saveCurrent(false, project);
        if (!current()) return;
        if (!saved) {
          if (android) {
            const message = this.session.getSnapshot().conflict
              ? 'Le fichier a changé sur le disque. Compare les versions avant de relancer le déploiement.'
              : 'Déploiement annulé : le projet doit être enregistré avant son envoi au téléphone.';
            this.status('canceled', message);
            this.session.message(message);
          }
          return;
        }
        const state = this.session.getSnapshot();
        if (state.dirty || state.conflict || this.session.project !== project)
          throw Error('Le projet a changé pendant l’enregistrement. Enregistre à nouveau avant de lancer cette action.');
        if (action.kind === 'playLevel' && !this.session.project.levels.some(level => level.id === action.levelId))
          throw Error('Ce niveau n’existe plus dans le projet.');

        switch (action.kind) {
          case 'publish': {
            const result = await this.api.publish(project);
            if (current()) this.session.message(result ? `Publié : ${result.path}\nRelance le jeu pour utiliser ces données.` : 'Publication annulée.');
            break;
          }
          case 'publishWeb': {
            this.session.message('Préparation du premier niveau pour le Web… La compilation Godot peut prendre quelques minutes.');
            const result = await this.api.publishWeb(project);
            if (current()) this.session.message(result
              ? `« ${result.title} » ${result.target === 'live' ? `est en ligne sur ${result.url}` : `est prêt sur le site local. ${result.path}`}\nJournal : ${result.logPath}`
              : 'Publication Web annulée.');
            break;
          }
          case 'playLevel': {
            const result = await this.api.playLevel(project, action.levelId);
            if (current()) this.session.message(result
              ? `Lunaria lancé sur « ${result.title} » dans une copie temporaire du jeu. La campagne publiée et la progression du joueur sont conservées.`
              : 'Test du niveau annulé.');
            break;
          }
          case 'build': {
            const label = action.target === 'windows' ? 'PC' : 'Android';
            this.session.message(`Export ${label} en cours… La campagne est synchronisée avant l’export.`);
            const result = await this.api.build(project, action.target);
            if (current()) this.session.message(result ? `Export ${label} terminé : ${artifactInfo(result)}` : `Export ${label} annulé.`);
            break;
          }
          case 'deployAndroid': {
            const requestId = globalThis.crypto.randomUUID();
            this.session.message('Préparation du déploiement Android…');
            const unsubscribe = this.api.onAndroidDeploymentProgress(progress => {
              if (!current() || progress.requestId !== requestId || this.deployment?.status !== 'running') return;
              this.publish({ ...this.deployment, phase: progress.phase, message: progress.message });
              this.session.message(progress.message);
            });
            this.unsubscribeProgress = unsubscribe;
            try {
              const result = await this.api.deployAndroid(project, requestId);
              if (!current()) return;
              const message = result
                ? `Lunaria installé et lancé sur ${result.device.name} (${result.device.serial}).\nAPK : ${artifactInfo(result)}`
                : 'Déploiement Android annulé.';
              this.status(result ? 'success' : 'canceled', message);
              this.session.message(message);
            } finally {
              unsubscribe();
              if (this.unsubscribeProgress === unsubscribe) this.unsubscribeProgress = undefined;
            }
            break;
          }
        }
      } catch (error) {
        if (!current()) return;
        if (android) this.status('error', error instanceof Error ? error.message : String(error));
        throw error; // ProjectSession reports once and releases its existing lock.
      }
    });
  };
}
