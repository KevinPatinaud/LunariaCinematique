import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ImageTask } from "../../shared/imageTasks.js";
import { api } from "../browserBridge.js";

function useTaskRegistry() {
  const [tasks, setTasks] = useState<ImageTask[]>([]),
    [error, setError] = useState("");
  const pending = useRef<Promise<void> | undefined>(undefined);
  const live = useRef(true);
  const refresh = useCallback(() => {
    if (pending.current) return pending.current;
    const operation = (async () => {
      try {
        const next = await api.listImageTasks();
        if (live.current) {
          setTasks(next);
          setError("");
        }
      } catch (reason) {
        if (live.current)
          setError(reason instanceof Error ? reason.message : String(reason));
      }
    })();
    pending.current = operation;
    return operation.finally(() => {
      pending.current = undefined;
    });
  }, []);
  useEffect(() => {
    live.current = true;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      await refresh();
      if (live.current) timer = setTimeout(() => void poll(), 1200);
    }
    void poll();
    return () => {
      live.current = false;
      clearTimeout(timer);
    };
  }, [refresh]);
  return { tasks, error, refresh };
}
const Context = createContext<ReturnType<typeof useTaskRegistry> | null>(null);
export function ImageTasksProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Context.Provider value={useTaskRegistry()}>{children}</Context.Provider>
  );
}
export function useImageTasks() {
  const value = useContext(Context);
  if (!value) throw Error("Suivi des tâches absent.");
  return value;
}
