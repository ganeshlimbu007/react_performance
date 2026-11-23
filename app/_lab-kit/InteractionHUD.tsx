"use client";

import { useEffect, useRef, useState } from "react";
import { read as readCounters, reset as resetCounters } from "./counters";
import { readProfiler, resetProfiler, type ProfilerStats } from "./LabProfiler";

/* ---- Minimal shapes for APIs that TS lib.dom may not type yet ---- */
type EventTimingEntry = PerformanceEntry & {
  interactionId?: number;
  processingStart: number;
  processingEnd: number;
  duration: number;
};
type LoAFEntry = PerformanceEntry & { blockingDuration?: number };

type Interaction = {
  id: number;
  name: string;
  duration: number;
  inputDelay: number;
  processing: number;
  presentation: number;
};

type InpDetail = {
  value?: number;
  rating?: string;
  inputDelay?: number;
  processingDuration?: number;
  presentationDelay?: number;
  loadState?: string;
  interactionTarget?: string;
  interactionType?: string;
  longestScriptSource?: string;
  longestScriptInvoker?: string;
};

const supports = (type: string) =>
  typeof PerformanceObserver !== "undefined" &&
  Array.isArray(PerformanceObserver.supportedEntryTypes) &&
  PerformanceObserver.supportedEntryTypes.includes(type);

const r1 = (n: number) => Math.round(n * 10) / 10;

export function InteractionHUD({ lab }: { lab?: string }) {
  // The HUD reports on browser-only APIs, and its feature detection would
  // disagree with the server render. Mount it client-side only.
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [longTasks, setLongTasks] = useState(0);
  const [worstBlocking, setWorstBlocking] = useState(0);
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [profiler, setProfiler] = useState<Record<string, ProfilerStats>>({});
  const [inp, setInp] = useState<InpDetail | null>(null);
  const [fallbackRow, setFallbackRow] = useState<string | null>(null);

  // Largest-duration entry per interactionId.
  const byId = useRef(new Map<number, Interaction>());

  useEffect(() => setMounted(true), []);

  /* ---- Event Timing: split every interaction into its three parts ---- */
  useEffect(() => {
    if (!supports("event")) return;
    const po = new PerformanceObserver((list) => {
      let changed = false;
      for (const raw of list.getEntries() as EventTimingEntry[]) {
        const id = raw.interactionId ?? 0;
        if (!id) continue; // 0 means "not part of an interaction"
        const prev = byId.current.get(id);
        if (prev && prev.duration >= raw.duration) continue;
        byId.current.set(id, {
          id,
          name: raw.name,
          duration: raw.duration,
          inputDelay: raw.processingStart - raw.startTime,
          processing: raw.processingEnd - raw.processingStart,
          presentation: raw.startTime + raw.duration - raw.processingEnd,
        });
        changed = true;
      }
      if (changed) {
        setInteractions(
          [...byId.current.values()].sort((a, b) => a.id - b.id),
        );
      }
    });
    po.observe({ type: "event", buffered: true, durationThreshold: 16 });
    return () => po.disconnect();
  }, []);

  /* ---- Long tasks ---- */
  useEffect(() => {
    if (!supports("longtask")) return;
    const po = new PerformanceObserver((list) => {
      setLongTasks((n) => n + list.getEntries().length);
    });
    po.observe({ type: "longtask", buffered: true });
    return () => po.disconnect();
  }, []);

  /* ---- Long animation frames ---- */
  useEffect(() => {
    if (!supports("long-animation-frame")) return;
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntries() as LoAFEntry[]) {
        const b = e.blockingDuration ?? 0;
        setWorstBlocking((w) => (b > w ? b : w));
      }
    });
    po.observe({ type: "long-animation-frame", buffered: true });
    return () => po.disconnect();
  }, []);

  /* ---- INP attribution from instrumentation-client.ts ---- */
  useEffect(() => {
    const onInp = (e: Event) => setInp((e as CustomEvent<InpDetail>).detail);
    window.addEventListener("inp-attribution", onInp);
    return () => window.removeEventListener("inp-attribution", onInp);
  }, []);

  /* ---- Poll counters + profiler at most 4x/second ---- */
  useEffect(() => {
    const t = setInterval(() => {
      setCounters(readCounters());
      setProfiler(readProfiler());
    }, 250);
    return () => clearInterval(t);
  }, []);

  const worst = interactions.reduce<Interaction | null>(
    (acc, i) => (!acc || i.duration > acc.duration ? i : acc),
    null,
  );
  const recent = interactions.slice(-6).reverse();

  const profilerIds = Object.keys(profiler);
  const anyFired = profilerIds.some((k) => profiler[k].fired);
  const commitsText = anyFired
    ? profilerIds.map((k) => `${k}: ${profiler[k].commits}`).join(", ")
    : "— (needs `npm run build:profile`)";

  function buildRow(): string {
    const variant =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).toString() || "default"
        : "";
    const path =
      typeof window !== "undefined" ? window.location.pathname : lab ?? "";
    const parts = worst
      ? `${r1(worst.duration)} = ${r1(worst.inputDelay)} + ${r1(
          worst.processing,
        )} + ${r1(worst.presentation)}`
      : "";
    const loaf = supports("long-animation-frame")
      ? `${longTasks} / ${r1(worstBlocking)}`
      : `${longTasks} / n-a`;
    const commits = anyFired
      ? profilerIds.map((k) => profiler[k].commits).join("+")
      : "—";
    const bodies = Object.entries(counters)
      .map(([k, v]) => `${k}:${v}`)
      .join(" ");
    // RESULTS.md column order:
    // Station | Variant | CPU | Duration = input + processing + presentation
    // | Long tasks / LoAF | Commits | Row bodies | Notes
    return `| ${path} | ${variant} |  | ${parts} | ${loaf} | ${commits} | ${bodies} |  |`;
  }

  async function copyRow() {
    const row = buildRow();
    try {
      await navigator.clipboard.writeText(row);
      setFallbackRow(null);
    } catch {
      setFallbackRow(row);
    }
  }

  function resetAll() {
    byId.current.clear();
    setInteractions([]);
    setLongTasks(0);
    setWorstBlocking(0);
    setInp(null);
    setFallbackRow(null);
    resetCounters();
    resetProfiler();
    setCounters(readCounters());
    setProfiler(readProfiler());
  }

  if (!mounted) return null;

  return (
    <aside className={`hud ${open ? "hud-open" : "hud-closed"}`}>
      <button className="hud-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? "▾" : "▸"} Interaction HUD{lab ? ` · ${lab}` : ""}
      </button>

      {open && (
        <div className="hud-body">
          <section className="hud-sec">
            <h4>Interactions</h4>
            {!supports("event") && (
              <p className="hud-note">
                Event Timing not supported in this browser.
              </p>
            )}
            {supports("event") && recent.length === 0 && (
              <p className="hud-note">No interaction ≥ 16 ms yet.</p>
            )}
            {recent.map((i) => (
              <div key={i.id} className="hud-row">
                <span className="hud-k">{i.name}</span>
                <span className="hud-v mono">
                  {r1(i.duration)} = {r1(i.inputDelay)} + {r1(i.processing)} +{" "}
                  {r1(i.presentation)}
                </span>
              </div>
            ))}
            {worst && (
              <div className="hud-row hud-worst">
                <span className="hud-k">worst</span>
                <span className="hud-v mono">
                  {r1(worst.duration)} ({worst.name})
                </span>
              </div>
            )}
            <p className="hud-note">
              duration is rounded to 8 ms; the parts are not; interactions under
              16 ms are not reported
            </p>
          </section>

          <section className="hud-sec">
            <h4>Blocking</h4>
            <div className="hud-row">
              <span className="hud-k">long tasks</span>
              <span className="hud-v mono">
                {supports("longtask") ? longTasks : "not supported"}
              </span>
            </div>
            <div className="hud-row">
              <span className="hud-k">worst LoAF blocking</span>
              <span className="hud-v mono">
                {supports("long-animation-frame")
                  ? `${r1(worstBlocking)} ms`
                  : "not supported"}
              </span>
            </div>
          </section>

          <section className="hud-sec">
            <h4>Counters</h4>
            {Object.keys(counters).length === 0 && (
              <p className="hud-note">none yet</p>
            )}
            {Object.entries(counters).map(([k, v]) => (
              <div key={k} className="hud-row">
                <span className="hud-k">{k} bodies</span>
                <span className="hud-v mono">{v}</span>
              </div>
            ))}
            <div className="hud-row">
              <span className="hud-k">commits</span>
              <span className="hud-v mono">{commitsText}</span>
            </div>
            {anyFired &&
              profilerIds.map((k) => (
                <div key={k} className="hud-row">
                  <span className="hud-k">{k} last / total</span>
                  <span className="hud-v mono">
                    {r1(profiler[k].lastActual)} / {r1(profiler[k].totalActual)}{" "}
                    ms ({profiler[k].lastPhase})
                  </span>
                </div>
              ))}
          </section>

          <section className="hud-sec">
            <h4>Latest INP attribution</h4>
            {!inp && <p className="hud-note">waiting for an INP report…</p>}
            {inp && (
              <>
                <div className="hud-row">
                  <span className="hud-k">value</span>
                  <span className="hud-v mono">
                    {r1(inp.value ?? 0)} ms ({inp.rating})
                  </span>
                </div>
                <div className="hud-row">
                  <span className="hud-k">parts</span>
                  <span className="hud-v mono">
                    {r1(inp.inputDelay ?? 0)} + {r1(inp.processingDuration ?? 0)}{" "}
                    + {r1(inp.presentationDelay ?? 0)}
                  </span>
                </div>
                <div className="hud-row">
                  <span className="hud-k">loadState</span>
                  <span className="hud-v mono">{inp.loadState}</span>
                </div>
                <div className="hud-row">
                  <span className="hud-k">target</span>
                  <span className="hud-v mono">{inp.interactionTarget}</span>
                </div>
                {inp.longestScriptSource && (
                  <div className="hud-row">
                    <span className="hud-k">longest script</span>
                    <span className="hud-v mono">
                      {inp.longestScriptSource} ({inp.longestScriptInvoker})
                    </span>
                  </div>
                )}
              </>
            )}
          </section>

          <div className="hud-actions">
            <button onClick={resetAll}>Reset</button>
            <button onClick={copyRow}>Copy row</button>
          </div>
          {fallbackRow && (
            <textarea
              className="hud-fallback"
              readOnly
              rows={3}
              value={fallbackRow}
              aria-label="Markdown results row (copy manually)"
            />
          )}
        </div>
      )}
    </aside>
  );
}
