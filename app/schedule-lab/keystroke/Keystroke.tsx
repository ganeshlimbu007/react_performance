"use client";

import {
  memo,
  useDeferredValue,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { burn } from "../../_lab-kit/burn";
import { count } from "../../_lab-kit/counters";
import { makeItems } from "../../_lab-kit/seeded";
import { LabProfiler } from "../../_lab-kit/LabProfiler";
import type { KeystrokeMode } from "./page";

const ITEMS = makeItems(400, 42);

function Row({ item, cost }: { item: string; cost: number }) {
  count("Row");
  burn(cost);
  return <div className="sl-row">{item}</div>;
}

function List({
  query,
  rows,
  cost,
}: {
  query: string;
  rows: number;
  cost: number;
}) {
  count("List");
  const matches = ITEMS.filter((i) => i.includes(query)).slice(0, rows);
  return (
    <div className="sl-rows">
      {matches.map((item) => (
        <Row key={item} item={item} cost={cost} />
      ))}
    </div>
  );
}

// Declared at module scope, so the memo identity is stable across renders.
const MemoList = memo(List);

export function Keystroke({
  mode,
  rows,
  cost,
  probe,
}: {
  mode: KeystrokeMode;
  rows: number;
  cost: number;
  probe: boolean;
}) {
  const [q, setQ] = useState("");
  const [listQ, setListQ] = useState("");
  const [isPending, startTransition] = useTransition();
  const [clicks, setClicks] = useState(0);
  const dq = useDeferredValue(q);

  /* ---- flush-order probe ---- */
  const seq = useRef<string[]>([]);
  const recording = useRef(false);
  const [sequence, setSequence] = useState<string>("");

  if (probe && recording.current) seq.current.push("render");

  useLayoutEffect(() => {
    if (probe && recording.current) seq.current.push("commit");
  });

  function startProbe(source: string) {
    seq.current = [`${source} handler`];
    recording.current = true;
    queueMicrotask(() => {
      if (recording.current) seq.current.push("microtask");
      recording.current = false;
      setSequence(seq.current.join("  →  "));
    });
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (probe) startProbe("input");
    if (mode === "transition") {
      setQ(value);
      startTransition(() => setListQ(value));
    } else {
      setQ(value);
    }
  }

  function onProbeClick() {
    if (probe) startProbe("button");
    setClicks((c) => c + 1);
  }

  const listQuery =
    mode === "sync" ? q : mode === "transition" ? listQ : dq;

  return (
    <>
      <div className="sl-controls">
        <div className="sl-field">
          <label htmlFor="ks-input">Filter items</label>
          <input
            id="ks-input"
            value={q}
            onChange={onChange}
            placeholder="type item-1"
            autoComplete="off"
          />
        </div>
        {probe && (
          <button onClick={onProbeClick}>Probe click ({clicks})</button>
        )}
        {mode === "transition" && isPending && (
          <span className="sl-pending" role="status">
            updating…
          </span>
        )}
      </div>

      {probe && (
        <div className="sl-log">
          <strong>last interaction:</strong>{" "}
          {sequence || "interact to record a sequence"}
        </div>
      )}

      <LabProfiler id="list">
        {mode === "deferred" ? (
          <MemoList query={listQuery} rows={rows} cost={cost} />
        ) : (
          <List query={listQuery} rows={rows} cost={cost} />
        )}
      </LabProfiler>
    </>
  );
}
