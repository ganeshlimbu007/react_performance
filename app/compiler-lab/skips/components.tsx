"use client";

import { useEffect, useRef, useState } from "react";
import { count } from "../../_lab-kit/counters";

function Child({ owner }: { owner: string }) {
  count(`${owner}.Child`);
  return <span className="cl-child">child of {owner}</span>;
}

/* ------------------------------- Control -------------------------------- */

export function Control() {
  "use memo";

  const [n, setN] = useState(0);
  return (
    <div className="sh-cell">
      <strong>Control</strong>
      <div className="sl-controls">
        <button onClick={() => setN(n + 1)}>Bump ({n})</button>
      </div>
      <Child owner="Control" />
    </div>
  );
}

/* ----------------------------- WritesOutside ----------------------------- */

const registry: { last: number } = { last: 0 };

export function WritesOutside() {
  "use memo";

  const [n, setN] = useState(0);
  registry.last = n;
  return (
    <div className="sh-cell">
      <strong>WritesOutside</strong>
      <div className="sl-controls">
        <button onClick={() => setN(n + 1)}>Bump ({n})</button>
      </div>
      <Child owner="WritesOutside" />
    </div>
  );
}

/* -------------------------------- ReadsRef ------------------------------- */

export function ReadsRef() {
  "use memo";

  const [n, setN] = useState(0);
  const ref = useRef(0);
  ref.current = ref.current + 1;
  const seen = ref.current;
  return (
    <div className="sh-cell">
      <strong>ReadsRef</strong>
      <div className="sl-metric">
        <span>ref.current</span>
        <span className="mono">{seen}</span>
      </div>
      <div className="sl-controls">
        <button onClick={() => setN(n + 1)}>Bump ({n})</button>
      </div>
      <Child owner="ReadsRef" />
    </div>
  );
}

/* ------------------------------ NestedHooks ------------------------------ */

export function NestedHooks() {
  "use memo";

  const [n, setN] = useState(0);

  function Inner() {
    useEffect(() => {}, []);
    return <Child owner="NestedHooks" />;
  }

  return (
    <div className="sh-cell">
      <strong>NestedHooks</strong>
      <div className="sl-controls">
        <button onClick={() => setN(n + 1)}>Bump ({n})</button>
      </div>
      <Inner />
    </div>
  );
}
