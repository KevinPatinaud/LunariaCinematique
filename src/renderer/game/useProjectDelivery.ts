import { useEffect, useState, useSyncExternalStore } from 'react';
import type { ProjectSession } from '../../shared/projectSession.js';
import { gameAPI } from './bridge.js';
import { ProjectDelivery } from './ProjectDelivery.js';

export function useProjectDelivery(session: ProjectSession) {
  const [delivery] = useState(() => new ProjectDelivery(session, gameAPI));
  useEffect(() => delivery.connect(), [delivery]);
  const androidDeployment = useSyncExternalStore(delivery.subscribe, delivery.getSnapshot);
  return { execute: delivery.execute, dismiss: delivery.dismiss, androidDeployment };
}
