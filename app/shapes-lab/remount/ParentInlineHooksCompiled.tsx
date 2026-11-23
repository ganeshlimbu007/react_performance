"use client";

import { useEffect, useState } from "react";
import { count } from "../../_lab-kit/counters";
import { ROWS } from "./data";
import { noteUpdate } from "./mountStore";

export function ParentInlineHooksCompiled() {
  "use memo";

  const [v, setV] = useState(0);

  function Row({ label }: { label: string }) {
    count("Row");
    useEffect(() => {}, []);
    return (
      <li className="sh-row">
        <input defaultValue={"note for " + label} aria-label={label} />
      </li>
    );
  }

  return (
    <>
      <div className="sl-controls">
        <button
          onClick={() => {
            noteUpdate();
            setV((x) => x + 1);
          }}
        >
          Re-render parent ({v})
        </button>
      </div>
      <ul className="sh-list">
        {ROWS.map((label) => (
          <Row key={label} label={label} />
        ))}
      </ul>
    </>
  );
}
