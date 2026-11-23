"use client";

import { Suspense, lazy, useEffect, useLayoutEffect, useState } from "react";
import { commitLog, record, resetLog, startUpdate, subscribe } from "./commitLog";

// At module scope: created once.
const ChartModule = lazy(() => import("./Chart"));

function Fallback() {
  useLayoutEffect(() => {
    record("fallback");
  });
  return <div className="sh-chart sh-fallback">loading chart…</div>;
}

function CommitSequence() {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
  return (
    <div className="sl-log">
      <div className="sl-metric">
        <span>commit sequence (— marks each parent update)</span>
        <span className="mono">
          {commitLog.entries.length
            ? commitLog.entries.join("  ")
            : "click to record"}
        </span>
      </div>
      <div className="sl-controls" style={{ marginTop: "0.5rem" }}>
        <button onClick={resetLog}>Reset sequence</button>
      </div>
    </div>
  );
}

function InsideParent() {
  const [v, setV] = useState(0);
  // The lazy() call is in the parent's body, so it runs on every render.
  const Chart = lazy(() => import("./Chart"));
  return (
    <>
      <div className="sl-controls">
        <button
          onClick={() => {
            startUpdate();
            setV((x) => x + 1);
          }}
        >
          Re-render parent ({v})
        </button>
      </div>
      <Suspense fallback={<Fallback />}>
        <Chart />
      </Suspense>
    </>
  );
}

function ModuleParent() {
  const [v, setV] = useState(0);
  return (
    <>
      <div className="sl-controls">
        <button
          onClick={() => {
            startUpdate();
            setV((x) => x + 1);
          }}
        >
          Re-render parent ({v})
        </button>
      </div>
      <Suspense fallback={<Fallback />}>
        <ChartModule />
      </Suspense>
    </>
  );
}

export function LazyInRender({ mode }: { mode: "inside" | "module" }) {
  return (
    <>
      {mode === "inside" ? <InsideParent /> : <ModuleParent />}
      <CommitSequence />
    </>
  );
}
