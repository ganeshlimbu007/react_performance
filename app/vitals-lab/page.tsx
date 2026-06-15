"use client";

import { useState } from "react";

/**
 * Core Web Vitals Lab — controlled demos to deliberately trigger each metric so
 * you can watch the dashboard (bottom-right) react.
 *
 *   LCP  — render a large hero block / image.
 *   CLS  — inject content that pushes layout down after load.
 *   INP  — run a blocking task on click to see slow interaction response.
 */
export default function VitalsLab() {
  const [shifted, setShifted] = useState(false);
  const [heavyResult, setHeavyResult] = useState<number | null>(null);
  const [bigImage, setBigImage] = useState(false);

  function blockMainThread() {
    // Intentionally synchronous & slow to inflate INP for this interaction.
    const start = performance.now();
    let acc = 0;
    while (performance.now() - start < 300) {
      acc += Math.sqrt(Math.random());
    }
    setHeavyResult(Math.round(acc));
  }

  return (
    <article className="page">
      <h1>Core Web Vitals Lab</h1>
      <p className="lead">
        Trigger each of the three Core Web Vitals on demand and watch the live
        dashboard.
      </p>

      {/* ---------------- LCP ---------------- */}
      <section className="lab-section">
        <h2>1. LCP — Largest Contentful Paint</h2>
        <p>
          LCP measures when the largest element becomes visible. Toggle a large
          hero block to change the LCP candidate.
        </p>
        <button onClick={() => setBigImage((v) => !v)}>
          {bigImage ? "Hide" : "Show"} large hero block
        </button>
        {bigImage && (
          <div className="lcp-hero">
            <span>I am a large LCP element</span>
          </div>
        )}
      </section>

      {/* ---------------- CLS ---------------- */}
      <section className="lab-section">
        <h2>2. CLS — Cumulative Layout Shift</h2>
        <p>
          CLS measures unexpected layout movement. Click to inject a banner{" "}
          <em>above</em> existing content and shove it down (a classic layout
          shift).
        </p>
        <button onClick={() => setShifted(true)}>Inject shifting banner</button>
        {shifted && (
          <div className="cls-banner">
            ⚠️ Surprise banner! Everything below me just shifted down → CLS.
          </div>
        )}
        <p className="cls-anchor">
          This paragraph moves down when the banner appears.
        </p>
      </section>

      {/* ---------------- INP ---------------- */}
      <section className="lab-section">
        <h2>3. INP — Interaction to Next Paint</h2>
        <p>
          INP measures responsiveness. This button blocks the main thread for
          ~300ms, so the interaction feels janky and INP rises.
        </p>
        <button onClick={blockMainThread}>Run blocking task (300ms)</button>
        {heavyResult !== null && (
          <p>Done. (throwaway result: {heavyResult})</p>
        )}
      </section>
    </article>
  );
}
