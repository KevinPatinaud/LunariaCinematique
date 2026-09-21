import { useCallback, useEffect, useState } from 'react';
/** Editor-only clock; no changes to document, audio, dialogue or undo history. */
export function useMotionPreview(key: string, duration: number, suspended: boolean) {
  const [state, setState] = useState<{time: number; running: boolean} | null>(null);
  const stop = useCallback(() => setState(null), []);
  useEffect(stop, [key, stop]);
  useEffect(() => { setState(s => s ? {...s, time: Math.min(s.time, duration)} : s); }, [duration]);
  useEffect(() => {
    if (!state?.running || suspended) return;
    let frame = 0, last = performance.now();
    const tick = (now: number) => {
      const delta = (now - last) / 1000; last = now;
      if (!document.hidden) setState(s => s?.running ? {...s, time: (s.time + delta) % Math.max(1, duration)} : s);
      frame = requestAnimationFrame(tick);
    };
    const hide = () => { last = performance.now(); if (document.hidden) setState(s => s ? {...s, running: false} : null); };
    frame = requestAnimationFrame(tick); document.addEventListener('visibilitychange', hide);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', hide); };
  }, [state?.running, duration, suspended]);
  return { active: state !== null, time: state?.time ?? 0, running: !!state?.running && !suspended, stop,
    start: () => setState({time: 0, running: true}),
    toggle: () => setState(s => s ? {...s, running: !s.running} : {time: 0, running: true}),
    seek: (time: number) => setState({time: Math.max(0, Math.min(duration, Number.isFinite(time) ? time : 0)), running: false}) };
}
