"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import {
  editorTimeline,
  loadEditor,
  recordEditorClick,
  subscribe,
  warmEditor,
} from "./editorLoader";

// Module scope, and it shares one promise with the warm-up.
const Editor = lazy(() => loadEditor());

const r1 = (n: number) => Math.round(n * 10) / 10;

export function LazyEditor({ warm }: { warm: boolean }) {
  const [open, setOpen] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  const { clickedAt, committedAt } = editorTimeline;

  return (
    <>
      <div className="sl-controls">
        <button
          onClick={() => {
            recordEditorClick();
            setOpen(true);
          }}
          disabled={open}
          onPointerEnter={warm ? () => warmEditor() : undefined}
          onFocus={warm ? () => warmEditor() : undefined}
        >
          Open editor
        </button>
      </div>

      <div className="sl-log">
        <div className="sl-metric">
          <span>warm-up on hover/focus</span>
          <span className="mono">
            {warm ? (editorTimeline.warmed ? "started early" : "armed") : "off"}
          </span>
        </div>
        <div className="sl-metric">
          <span>click → editor committed</span>
          <span className="mono">
            {clickedAt !== null && committedAt !== null
              ? `${r1(committedAt - clickedAt)} ms`
              : "—"}
          </span>
        </div>
      </div>

      {open && (
        <Suspense fallback={<div className="sl-log">loading editor…</div>}>
          <Editor />
        </Suspense>
      )}

      {committedAt !== null && (
        <p className="hud-note">
          lazy caches its module — reload to run again
        </p>
      )}
    </>
  );
}
