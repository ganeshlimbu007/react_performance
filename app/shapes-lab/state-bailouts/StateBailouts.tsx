"use client";

import { useReducer, useState } from "react";
import { count } from "../../_lab-kit/counters";
import { LabProfiler } from "../../_lab-kit/LabProfiler";
import { Readout } from "../Readout";

function StateComponent() {
  count("StateComponent");
  const [n, setN] = useState(0);
  return (
    <div className="sh-cell">
      <div className="sl-metric">
        <span>useState value</span>
        <span className="mono">{n}</span>
      </div>
      <div className="sl-controls">
        <button onClick={() => setN(0)}>set 0</button>
        <button onClick={() => setN(1)}>set 1</button>
      </div>
    </div>
  );
}

type NoopAction = { type: "noop" };
function noopReducer(s: number, _a: NoopAction): number {
  return s;
}

function ReducerComponent() {
  count("ReducerComponent");
  const [n, dispatch] = useReducer(noopReducer, 0);
  return (
    <div className="sh-cell">
      <div className="sl-metric">
        <span>useReducer value</span>
        <span className="mono">{n}</span>
      </div>
      <div className="sl-controls">
        <button onClick={() => dispatch({ type: "noop" })}>
          dispatch noop
        </button>
      </div>
    </div>
  );
}

export function StateBailouts() {
  return (
    <>
      <LabProfiler id="state">
        <StateComponent />
      </LabProfiler>
      <Readout counters={["StateComponent"]} profilerIds={["state"]} showPhases />

      <LabProfiler id="reducer">
        <ReducerComponent />
      </LabProfiler>
      <Readout
        counters={["ReducerComponent"]}
        profilerIds={["reducer"]}
        showPhases
      />
    </>
  );
}
