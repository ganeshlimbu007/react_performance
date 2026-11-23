"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { burn } from "../../_lab-kit/burn";
import { count } from "../../_lab-kit/counters";

function mark(name: string) {
  try {
    performance.mark(name);
  } catch {
    // ignore
  }
}

export function Overview({ version }: { version: number }) {
  count("Overview");
  useLayoutEffect(() => {
    mark("visible-commit");
  });
  return (
    <div className="sl-setup">
      <strong>Overview.</strong> version {version}
    </div>
  );
}

export function Notes({ version }: { version: number }) {
  count("Notes");
  useLayoutEffect(() => {
    mark("visible-commit");
  });
  return (
    <div className="sl-setup">
      <strong>Notes.</strong> version {version}
    </div>
  );
}

export function Details({ version }: { version: number }) {
  count("Details");
  burn(80); // synthetic cost
  const [text, setText] = useState("");

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[details] mount", performance.now());
    return () => {
      // eslint-disable-next-line no-console
      console.log("[details] cleanup", performance.now());
    };
  }, []);

  useLayoutEffect(() => {
    mark("details-commit");
    mark("visible-commit");
  });

  return (
    <div className="sl-setup">
      <strong>Details.</strong> version {version} · 80 ms synthetic cost per
      render
      <div className="sl-field" style={{ marginTop: "0.6rem" }}>
        <label htmlFor="details-text">Scratch text (local state)</label>
        <input
          id="details-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="type something, then leave the tab"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
