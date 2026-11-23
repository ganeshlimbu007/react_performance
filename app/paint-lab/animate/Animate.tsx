"use client";

import { useEffect, useRef, useState } from "react";
import { burn } from "../../_lab-kit/burn";

const DISTANCE = 400;
const DURATION = 3000;

export function Animate({
  mode,
  busy,
}: {
  mode: "state" | "left" | "transform";
  busy: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [x, setX] = useState(0);
  const [renders, setRenders] = useState(0);
  const rafRef = useRef<number | null>(null);
  const busyRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;

    // busy=1: keep the main thread occupied during the animation.
    if (busy) {
      busyRef.current = window.setInterval(() => burn(30), 100);
    }

    const start = performance.now();

    function frame() {
      const t = (performance.now() - start) / DURATION;
      if (t >= 1) {
        stop();
        return;
      }
      if (mode === "state") {
        // Back and forth across DISTANCE.
        const phase = Math.abs(((t * 2) % 2) - 1);
        setX((1 - phase) * DISTANCE);
        setRenders((r) => r + 1);
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    function stop() {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (busyRef.current !== null) clearInterval(busyRef.current);
      busyRef.current = null;
      setPlaying(false);
    }

    rafRef.current = requestAnimationFrame(frame);

    const done = window.setTimeout(stop, DURATION + 50);
    return () => {
      window.clearTimeout(done);
      stop();
    };
  }, [playing, mode, busy]);

  const moverClass =
    "pl-mover" +
    (playing && mode === "left" ? " pl-anim-left" : "") +
    (playing && mode === "transform" ? " pl-anim-transform" : "");

  return (
    <>
      <div className="sl-controls">
        <button
          onClick={() => {
            setRenders(0);
            setX(0);
            setPlaying(true);
          }}
          disabled={playing}
        >
          Play
        </button>
        <span className="mono">
          {busy ? "main thread busy (30 ms every 100 ms)" : "main thread idle"}
        </span>
      </div>

      <div className="sl-log">
        <div className="sl-metric">
          <span>renders during the animation (state mode)</span>
          <span className="mono">{mode === "state" ? renders : "n/a"}</span>
        </div>
      </div>

      <div className="pl-stage">
        <div
          className={moverClass}
          style={mode === "state" ? { left: x } : undefined}
        />
      </div>
    </>
  );
}
