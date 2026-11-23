"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { burn } from "../../_lab-kit/burn";
import { count } from "../../_lab-kit/counters";
import { LabProfiler } from "../../_lab-kit/LabProfiler";
import { Readout } from "../Readout";

const HEAVY_MS = 60;

function Heavy({ value }: { value: number }) {
  count("Heavy");
  burn(HEAVY_MS); // synthetic cost
  return (
    <div id="heavy-out" className="sh-heavy">
      derived value: {value}
    </div>
  );
}

/** Reads #heavy-out once per animation frame for 300 ms after a click. */
const frameStore = {
  frames: [] as string[],
  listeners: new Set<() => void>(),
};
function emitFrames() {
  for (const fn of frameStore.listeners) fn();
}
function logFrames() {
  const frames: string[] = [];
  const start = performance.now();
  function tick() {
    frames.push(document.getElementById("heavy-out")?.textContent ?? "(gone)");
    if (performance.now() - start < 300) {
      requestAnimationFrame(tick);
    } else {
      frameStore.frames = frames;
      emitFrames();
    }
  }
  requestAnimationFrame(tick);
}

/** Run-length encodes the frame sequence, e.g. "old ×2 → new ×16". */
function FrameLog() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    frameStore.listeners.add(fn);
    return () => {
      frameStore.listeners.delete(fn);
    };
  }, []);

  const runs: Array<[string, number]> = [];
  for (const f of frameStore.frames) {
    const last = runs[runs.length - 1];
    if (last && last[0] === f) last[1]++;
    else runs.push([f, 1]);
  }

  return (
    <div className="sl-log">
      <div className="sl-metric">
        <span>frames after the click (300 ms)</span>
        <span className="mono">
          {runs.length
            ? runs.map(([text, n]) => `${text} ×${n}`).join("  →  ")
            : "click to record"}
        </span>
      </div>
    </div>
  );
}

function DeriveParent() {
  const [n, setN] = useState(0);
  const value = n * 2;
  return (
    <>
      <div className="sl-controls">
        <button
          onClick={() => {
            logFrames();
            setN((v) => v + 1);
          }}
        >
          Increment n ({n})
        </button>
      </div>
      <LabProfiler id="heavy">
        <Heavy value={value} />
      </LabProfiler>
    </>
  );
}

function EffectParent() {
  const [n, setN] = useState(0);
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(n * 2);
  }, [n]);
  return (
    <>
      <div className="sl-controls">
        <button
          onClick={() => {
            logFrames();
            setN((v) => v + 1);
          }}
        >
          Increment n ({n})
        </button>
      </div>
      <LabProfiler id="heavy">
        <Heavy value={value} />
      </LabProfiler>
    </>
  );
}

function LayoutEffectParent() {
  const [n, setN] = useState(0);
  const [value, setValue] = useState(0);
  useLayoutEffect(() => {
    setValue(n * 2);
  }, [n]);
  return (
    <>
      <div className="sl-controls">
        <button
          onClick={() => {
            logFrames();
            setN((v) => v + 1);
          }}
        >
          Increment n ({n})
        </button>
      </div>
      <LabProfiler id="heavy">
        <Heavy value={value} />
      </LabProfiler>
    </>
  );
}

export function Cascade({
  mode,
}: {
  mode: "derive" | "effect" | "layout-effect";
}) {
  return (
    <>
      {mode === "derive" && <DeriveParent />}
      {mode === "effect" && <EffectParent />}
      {mode === "layout-effect" && <LayoutEffectParent />}
      <Readout counters={["Heavy"]} profilerIds={["heavy"]} showPhases />
      <FrameLog />
    </>
  );
}
