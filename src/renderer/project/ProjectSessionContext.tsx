import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { ProjectSession } from "../../shared/projectSession.js";
import { gameAPI } from "../game/bridge.js";
import { api } from "../browserBridge.js";

const Context = createContext<ProjectSession | null>(null);
export function ProjectSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session] = useState(
    () => new ProjectSession(gameAPI, (reason) => api.confirmUnsaved(reason)),
  );
  useEffect(() => {
    void session.boot();
    return () => session.dispose();
  }, [session]);
  return <Context.Provider value={session}>{children}</Context.Provider>;
}
export function useProjectSession() {
  const session = useContext(Context);
  if (!session) throw Error("Session de projet absente.");
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot);
  return { session, ...state, project: state.history.present };
}
