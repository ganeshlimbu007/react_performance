"use client";

import { memo, useEffect, useRef, useState } from "react";
import { count } from "../../_lab-kit/counters";
import { LabProfiler } from "../../_lab-kit/LabProfiler";
import { Readout } from "../Readout";

const INITIAL = 1000;

type Row = { id: number; label: string };

function makeRows(n: number, startId: number): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i < n; i++) {
    rows.push({ id: startId + i, label: `row ${startId + i}` });
  }
  return rows;
}

const RowView = memo(function RowView({ row }: { row: Row }) {
  count("Row");
  return (
    <li className="sh-row">
      <input defaultValue={"note for " + row.label} aria-label={row.label} />
    </li>
  );
});

/** Mutation records grouped by type, for the last update. */
const mutStore = {
  characterData: 0,
  childList: 0,
  attributes: 0,
};
const listeners = new Set<() => void>();
function emit() {
  for (const fn of listeners) fn();
}

function MutationReadout() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return (
    <div className="sl-log">
      <div className="sl-metric">
        <span>characterData records</span>
        <span className="mono">{mutStore.characterData}</span>
      </div>
      <div className="sl-metric">
        <span>childList records</span>
        <span className="mono">{mutStore.childList}</span>
      </div>
      <div className="sl-metric">
        <span>attributes records</span>
        <span className="mono">{mutStore.attributes}</span>
      </div>
    </div>
  );
}

export function Keys({ keys }: { keys: "index" | "id" }) {
  const [rows, setRows] = useState<Row[]>(() => makeRows(INITIAL, 1));
  const nextId = useRef(INITIAL + 1);
  const hostRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "characterData") mutStore.characterData += 1;
        else if (r.type === "childList") mutStore.childList += 1;
        else if (r.type === "attributes") mutStore.attributes += 1;
      }
      emit();
    });
    mo.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
    return () => mo.disconnect();
  }, []);

  function prepend() {
    mutStore.characterData = 0;
    mutStore.childList = 0;
    mutStore.attributes = 0;
    emit();
    const id = nextId.current++;
    setRows((r) => [{ id, label: `row ${id}` }, ...r]);
  }

  function reset() {
    mutStore.characterData = 0;
    mutStore.childList = 0;
    mutStore.attributes = 0;
    emit();
    nextId.current = INITIAL + 1;
    setRows(makeRows(INITIAL, 1));
  }

  return (
    <>
      <div className="sl-controls">
        <button onClick={prepend}>Prepend one row</button>
        <button onClick={reset}>Reset list</button>
        <span className="mono">{rows.length} rows</span>
      </div>

      <LabProfiler id="list">
        <ul className="sh-list" ref={hostRef}>
          {rows.map((row, i) => (
            <RowView key={keys === "index" ? i : row.id} row={row} />
          ))}
        </ul>
      </LabProfiler>

      <MutationReadout />
      <Readout counters={["Row"]} profilerIds={["list"]} />
    </>
  );
}
