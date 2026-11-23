"use client";

import { Profiler, type ReactNode } from "react";

export type ProfilerStats = {
  /**
   * False until onRender has fired at least once. A plain production build
   * strips React's profiling timing, so onRender never fires — the HUD must
   * show "—", not 0, so you can tell "not measurable" from "no commits".
   */
  fired: boolean;
  commits: number;
  totalActual: number;
  lastActual: number;
  lastBase: number;
  lastPhase: string;
};

const store = new Map<string, ProfilerStats>();

function blank(): ProfilerStats {
  return {
    fired: false,
    commits: 0,
    totalActual: 0,
    lastActual: 0,
    lastBase: 0,
    lastPhase: "",
  };
}

export function readProfiler(): Record<string, ProfilerStats> {
  return Object.fromEntries(store);
}

export function resetProfiler(): void {
  store.clear();
}

export function LabProfiler({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <Profiler
      id={id}
      onRender={(
        profilerId,
        phase,
        actualDuration,
        baseDuration,
      ) => {
        const prev = store.get(profilerId) ?? blank();
        store.set(profilerId, {
          fired: true,
          commits: prev.commits + 1,
          totalActual: prev.totalActual + actualDuration,
          lastActual: actualDuration,
          lastBase: baseDuration,
          lastPhase: phase,
        });
      }}
    >
      {children}
    </Profiler>
  );
}
