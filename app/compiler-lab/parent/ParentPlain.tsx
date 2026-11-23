"use client";

import { useState } from "react";
import { count } from "../../_lab-kit/counters";
import { Child, Price, expensive } from "./shared";

// No directive: with compilationMode 'annotation' this function is NOT compiled.
export function ParentPlain() {
  count("Parent");
  const [n, setN] = useState(0);
  const [q, setQ] = useState("a");
  const total = expensive(q);
  return (
    <div data-n={n} className="cl-parent">
      <button onClick={() => setN(n + 1)}>Bump unrelated state</button>
      <Child style={{ color: "red" }} onPick={() => setQ("b")} label={q} />
      <Price amount={total} />
    </div>
  );
}
