"use client";

import { useState } from "react";
import { ROWS } from "./data";
import { Row } from "./RowModule";
import { noteUpdate } from "./mountStore";

export function ParentModule() {
  const [v, setV] = useState(0);
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
