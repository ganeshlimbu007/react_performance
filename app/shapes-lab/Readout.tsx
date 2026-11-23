"use client";

import { useEffect, useState } from "react";
import { read as readCounters } from "../_lab-kit/counters";
import { readProfiler, type ProfilerStats } from "../_lab-kit/LabProfiler";

/**
 * A readout that polls the counters and the Profiler store on its own.
 *
 * It is deliberately a sibling of the measured subtree with its own state, so
 * updating it re-renders only itself — a station's heavy child is never
 * re-rendered just because the numbers on screen changed.
 */
export function Readout({
  counters,
  profilerIds = [],
  showPhases = false,
  extra,
}: {
  counters: string[];
  profilerIds?: string[];
  showPhases?: boolean;
  extra?: Array<[string, string]>;
}) {
  const [values, setValues] = useState<Record<string, number>>({});
  const [profiler, setProfiler] = useState<Record<string, ProfilerStats>>({});

  useEffect(() => {
    const t = setInterval(() => {
      setValues(readCounters());
      setProfiler(readProfiler());
    }, 250);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="sl-log">
      {counters.map((name) => (
        <div className="sl-metric" key={name}>
          <span>{name} bodies</span>
          <span className="mono">{values[name] ?? 0}</span>
        </div>
      ))}

      {profilerIds.map((id) => {
        const p = profiler[id];
        return (
          <div key={id}>
            <div className="sl-metric">
              <span>{id} commits</span>
              <span className="mono">
                {p?.fired
                  ? p.commits
                  : "— (needs `npm run build:profile`)"}
              </span>
            </div>
            {p?.fired && (
              <div className="sl-metric">
                <span>{id} last actualDuration</span>
                <span className="mono">
                  {Math.round(p.lastActual * 10) / 10} ms
                </span>
              </div>
            )}
            {showPhases && p?.fired && (
              <div className="sl-metric">
                <span>{id} recent phases</span>
                <span className="mono">{p.recentPhases.join(" → ")}</span>
              </div>
            )}
          </div>
        );
      })}

      {extra?.map(([k, v]) => (
        <div className="sl-metric" key={k}>
          <span>{k}</span>
          <span className="mono">{v}</span>
        </div>
      ))}
    </div>
  );
}
