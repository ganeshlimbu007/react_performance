"use client";

import { useEffect, useRef, useState } from "react";
import { Readout } from "../Readout";
import { ParentModule } from "./ParentModule";
import { ParentInline } from "./ParentInline";
import { ParentInlineDirect } from "./ParentInlineDirect";
import { ParentInlineCompiled } from "./ParentInlineCompiled";
import { ParentInlineHooksCompiled } from "./ParentInlineHooksCompiled";
import { mountStore, observe, resetMounts, subscribe } from "./mountStore";
import { LabProfiler } from "../../_lab-kit/LabProfiler";

export type RemountMode =
  | "module"
  | "inline"
  | "inline-direct"
  | "inline-compiled"
  | "inline-hooks-compiled";

function MountReadout() {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
  return (
    <div className="sl-log">
      <div className="sl-metric">
        <span>parent updates</span>
        <span className="mono">{mountStore.updates}</span>
      </div>
      <div className="sl-metric">
        <span>element nodes added on the last update</span>
        <span className="mono">{mountStore.lastAdded}</span>
      </div>
      <div className="sl-metric">
        <span>element nodes added in total</span>
        <span className="mono">{mountStore.totalAdded}</span>
      </div>
      <div className="sl-controls" style={{ marginTop: "0.5rem" }}>
        <button onClick={resetMounts}>Reset mount counts</button>
      </div>
    </div>
  );
}

export function Remount({ mode }: { mode: RemountMode }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    return observe(hostRef.current);
  }, []);

  return (
    <>
      <div ref={hostRef}>
        <LabProfiler id="list">
          {mode === "module" && <ParentModule />}
          {mode === "inline" && <ParentInline />}
          {mode === "inline-direct" && <ParentInlineDirect />}
          {mode === "inline-compiled" && <ParentInlineCompiled />}
          {mode === "inline-hooks-compiled" && <ParentInlineHooksCompiled />}
        </LabProfiler>
      </div>
      <MountReadout />
      <Readout counters={["Row", "List"]} profilerIds={["list"]} />
    </>
  );
}
