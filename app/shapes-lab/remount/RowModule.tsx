"use client";

import { count } from "../../_lab-kit/counters";

/** Declared at module scope. Its type identity never changes. */
export function Row({ label }: { label: string }) {
  count("Row");
  return (
    <li className="sh-row">
      <input defaultValue={"note for " + label} aria-label={label} />
    </li>
  );
}
