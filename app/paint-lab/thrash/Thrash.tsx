"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const BOXES = 1000;
const CHILDREN = 200;

/** per-component mode: each child reads the wrapper then writes its own box. */
function Box({
  version,
  wrapperRef,
}: {
  version: number;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const w = wrapperRef.current;
    const el = ref.current;
    if (!w || !el) return;
    // Read, then write, inside each of 200 effects.
    const width = w.offsetWidth;
    el.style.width = `${Math.max(1, width - (version % 7) - 8)}px`;
  });
  return <div className="pl-box" ref={ref} />;
}

export function Thrash({
  mode,
}: {
  mode: "interleave" | "batch" | "per-component";
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const [version, setVersion] = useState(0);
  const [passStart, setPassStart] = useState<number | null>(null);

  function runPass() {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const boxes = Array.from(
      wrapper.querySelectorAll<HTMLDivElement>(".pl-box"),
    );
    const t0 = performance.now();

    if (mode === "interleave") {
      for (const box of boxes) {
        // The read is inside the write loop.
        const width = wrapper.offsetWidth;
        box.style.width = `${Math.max(1, width - 8)}px`;
      }
    } else {
      // Read once, then write all.
      const width = wrapper.offsetWidth;
      for (const box of boxes) {
        box.style.width = `${Math.max(1, width - 8)}px`;
      }
    }

    setMs(performance.now() - t0);
  }

  // per-component: time from the click to after all 200 layout effects ran.
  useEffect(() => {
    if (mode !== "per-component" || passStart === null) return;
    setMs(performance.now() - passStart);
    setPassStart(null);
  }, [mode, version, passStart]);

  return (
    <>
      <div className="sl-controls">
        {mode === "per-component" ? (
          <button
            onClick={() => {
              setPassStart(performance.now());
              setVersion((v) => v + 1);
            }}
          >
            Reposition ({version})
          </button>
        ) : (
          <button onClick={runPass}>Run pass</button>
        )}
        <span className="mono">
          {mode === "per-component"
            ? `${CHILDREN} child components`
            : `${BOXES} boxes`}
        </span>
      </div>

      <div className="sl-log">
        <div className="sl-metric">
          <span>time for the last pass</span>
          <span className="mono">
            {ms === null ? "—" : `${Math.round(ms * 10) / 10} ms`}
          </span>
        </div>
      </div>

      <div className="pl-wrap" ref={wrapperRef}>
        {mode === "per-component"
          ? Array.from({ length: CHILDREN }, (_, i) => (
              <Box key={i} version={version} wrapperRef={wrapperRef} />
            ))
          : Array.from({ length: BOXES }, (_, i) => (
              <div className="pl-box" key={i} />
            ))}
      </div>
    </>
  );
}
