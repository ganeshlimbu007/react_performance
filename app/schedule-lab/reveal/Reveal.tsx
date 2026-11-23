"use client";

import {
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useState,
  useTransition,
} from "react";
import {
  hasStartedLoad,
  loadPanelB,
  recordClick,
  recordFallback,
  subscribe,
  timeline,
  warmPanelB,
} from "./timeline";

// Both declared at module scope. Nothing lazy is rendered until the first
// click, so nothing suspends during SSR.
const PanelA = lazy(() => import("./PanelA"));
const PanelB = lazy(() => loadPanelB());

function Fallback() {
  useLayoutEffect(() => {
    recordFallback();
  }, []);
  return <div className="sl-log">loading…</div>;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function Reveal({
  delay,
  switchMode,
  warm,
}: {
  delay: number;
  switchMode: "plain" | "transition";
  warm: boolean;
}) {
  const [showA, setShowA] = useState(false);
  const [showB, setShowB] = useState(false);
  const [, setTick] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  function switchToB() {
    recordClick();
    if (switchMode === "transition") {
      startTransition(() => setShowB(true));
    } else {
      setShowB(true);
    }
  }

  const { fallbackAt, resolvedAt, revealedAt, clickedAt } = timeline;
  const base = fallbackAt ?? clickedAt;
  const baseLabel = fallbackAt !== null ? "the fallback appeared" : "the click";

  return (
    <>
      <div className="sl-controls">
        <button onClick={() => setShowA(true)} disabled={showA}>
          Show panel A
        </button>
        <button
          onClick={switchToB}
          disabled={!showA || showB}
          onPointerEnter={warm ? () => warmPanelB() : undefined}
          onFocus={warm ? () => warmPanelB() : undefined}
        >
          Switch to B
        </button>
        {isPending && (
          <span className="sl-pending" role="status">
            updating…
          </span>
        )}
      </div>

      <div className="sl-log">
        <div className="sl-metric">
          <span>delay before B&rsquo;s module resolves</span>
          <span className="mono">{delay} ms</span>
        </div>
        <div className="sl-metric">
          <span>warm-up on hover/focus</span>
          <span className="mono">
            {warm ? (timeline.warmed ? "started early" : "armed") : "off"}
          </span>
        </div>
        <div className="sl-metric">
          <span>measured from</span>
          <span className="mono">
            {fallbackAt !== null ? baseLabel : "no fallback shown — the click"}
          </span>
        </div>
        <div className="sl-metric">
          <span>resolved at</span>
          <span className="mono">
            {resolvedAt !== null && base !== null
              ? `${r1(resolvedAt - base)} ms`
              : "—"}
          </span>
        </div>
        <div className="sl-metric">
          <span>revealed at</span>
          <span className="mono">
            {revealedAt !== null && base !== null
              ? `${r1(revealedAt - base)} ms`
              : "—"}
          </span>
        </div>
      </div>

      {showA && (
        <Suspense fallback={<Fallback />}>
          {showB ? <PanelB /> : <PanelA />}
        </Suspense>
      )}

      {(revealedAt !== null || hasStartedLoad()) && (
        <p className="hud-note">
          lazy caches its module — reload to run again
        </p>
      )}
    </>
  );
}
