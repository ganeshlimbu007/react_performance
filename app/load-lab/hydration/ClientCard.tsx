"use client";

import { useState } from "react";
import { burn } from "../../_lab-kit/burn";

/**
 * mode=client: every card is its own client component with a little state, so
 * all 1,000 of them must be hydrated. The burn() gives each one a measurable
 * cost during that hydration pass.
 */
export function ClientCard({ label }: { label: string }) {
  const [on, setOn] = useState(false);
  burn(0.05); // synthetic cost
  return (
    <button
      className="ll-card"
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
    >
      {label}
      {on ? " ✓" : ""}
    </button>
  );
}
