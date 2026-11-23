"use client";

import { useState } from "react";
import { burn } from "../../_lab-kit/burn";
import { makeItems } from "../../_lab-kit/seeded";

const ROWS = makeItems(5000, 7);
const PER_ROW_MS = 0.03; // ~150 ms of synthetic cost in total
const DEADLINE_MS = 50;

// Narrow type instead of `any`: scheduler.yield is not in every lib.dom yet.
type SchedulerWithYield = { yield?: () => Promise<void> };
const sched = (globalThis as { scheduler?: SchedulerWithYield }).scheduler;
const hasYield = typeof sched?.yield === "function";

const yieldToMain = () =>
  hasYield
    ? (sched as { yield: () => Promise<void> }).yield()
    : new Promise<void>((r) => setTimeout(r, 0));

const timeoutYield = () => new Promise<void>((r) => setTimeout(r, 0));

export function YieldStation({
  mode,
}: {
  mode: "block" | "yield" | "timeout";
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [scratch, setScratch] = useState("");

  async function build() {
    setBusy(true);
    setSummary(null);
    setProgress(0);
    const started = performance.now();
    let checksum = 0;

    if (mode === "block") {
      for (let i = 0; i < ROWS.length; i++) {
        burn(PER_ROW_MS);
        checksum += ROWS[i].length;
      }
      setProgress(ROWS.length);
    } else {
      const giveWay = mode === "timeout" ? timeoutYield : yieldToMain;
      let deadline = performance.now() + DEADLINE_MS;
      for (let i = 0; i < ROWS.length; i++) {
        burn(PER_ROW_MS);
        checksum += ROWS[i].length;
        if (performance.now() >= deadline) {
          setProgress(i + 1);
          await giveWay();
          deadline = performance.now() + DEADLINE_MS;
        }
      }
      setProgress(ROWS.length);
    }

    const total = performance.now() - started;
    setSummary(
      `${ROWS.length.toLocaleString()} rows · checksum ${checksum} · ${Math.round(
        total,
      )} ms wall clock`,
    );
    setBusy(false);
  }

  return (
    <>
      <div className="sl-controls">
        <button onClick={build} disabled={busy}>
          Build report
        </button>
        <div className="sl-field">
          <label htmlFor="yield-scratch">
            Type here while the report builds
          </label>
          <input
            id="yield-scratch"
            value={scratch}
            onChange={(e) => setScratch(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="sl-log">
        <div className="sl-metric">
          <span>scheduler.yield in this browser</span>
          <span className="mono">
            {hasYield ? "supported" : "not supported — falls back to setTimeout"}
          </span>
        </div>
        <div className="sl-metric">
          <span>progress</span>
          <span className="mono">
            {progress.toLocaleString()} / {ROWS.length.toLocaleString()}
          </span>
        </div>
        <div className="sl-metric">
          <span>result</span>
          <span className="mono">{summary ?? "—"}</span>
        </div>
      </div>
    </>
  );
}
