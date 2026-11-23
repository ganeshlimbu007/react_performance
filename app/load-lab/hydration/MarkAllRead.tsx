"use client";

import { useState } from "react";

/**
 * The one client island that is identical in both modes. Its own work is
 * negligible — clicking it only bumps a counter inside itself. What you are
 * measuring is how long the click has to WAIT, which is input delay.
 */
export function MarkAllRead() {
  const [n, setN] = useState(0);

  return (
    <div className="sl-controls">
      <button onClick={() => setN((v) => v + 1)}>Mark all read</button>
      <span className="mono">clicked {n}×</span>
    </div>
  );
}
