"use client";

import { useState } from "react";
import { count } from "../../_lab-kit/counters";
import { ROWS } from "./data";
import { Row } from "./RowModule";
import { noteUpdate } from "./mountStore";

export function ParentInlineDirect() {
  const [v, setV] = useState(0);

  // Declared in render and used directly in the returned JSX below, not
  // inside .map(). Calls no hooks.
  function List() {
    count("List");
    return (
      <ul className="sh-list">
        {ROWS.map((label) => (
          <Row key={label} label={label} />
        ))}
      </ul>
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
      <List />
    </>
  );
}
