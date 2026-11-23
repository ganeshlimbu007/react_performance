"use client";

import { useState } from "react";
import { count } from "../../_lab-kit/counters";
import { Child, Price, expensive } from "./shared";

// Identical to ParentPlain apart from the 'use memo' directive, which is what
// opts this function in to the React Compiler.
export function ParentCompiled() {
  "use memo";

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
