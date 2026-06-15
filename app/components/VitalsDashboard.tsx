"use client";

import { useEffect, useState } from "react";

type Metric = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor" | string;
};

// "Good" thresholds straight from web.dev. Units: ms, except CLS (unitless).
const META: Record<string, { label: string; unit: string; core: boolean }> = {
  LCP: { label: "Largest Contentful Paint", unit: "ms", core: true },
  CLS: { label: "Cumulative Layout Shift", unit: "", core: true },
  INP: { label: "Interaction to Next Paint", unit: "ms", core: true },
  FCP: { label: "First Contentful Paint", unit: "ms", core: false },
  TTFB: { label: "Time to First Byte", unit: "ms", core: false },
  FID: { label: "First Input Delay", unit: "ms", core: false },
};

function format(name: string, value: number) {
  if (name === "CLS") return value.toFixed(3);
  return `${Math.round(value)} ms`;
}

export function VitalsDashboard() {
  const [metrics, setMetrics] = useState<Record<string, Metric>>({});
  const [open, setOpen] = useState(true);

  useEffect(() => {
    function onVital(e: Event) {
      const detail = (e as CustomEvent<Metric>).detail;
      setMetrics((prev) => ({ ...prev, [detail.name]: detail }));
    }
    window.addEventListener("web-vital", onVital);
    return () => window.removeEventListener("web-vital", onVital);
  }, []);

  const order = ["LCP", "CLS", "INP", "FCP", "TTFB", "FID"];
  const rows = order.filter((n) => metrics[n]);

  return (
    <aside className={`vitals ${open ? "open" : "closed"}`}>
      <button className="vitals-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? "▾ Web Vitals" : "▸ Web Vitals"}
      </button>
      {open && (
        <div className="vitals-body">
          {rows.length === 0 && (
            <p className="vitals-empty">
              Interact with the page (scroll, click) to capture metrics…
            </p>
          )}
          {rows.map((name) => {
            const m = metrics[name];
            const meta = META[name];
            return (
              <div key={name} className="vital-row">
                <span className={`dot ${m.rating}`} />
                <span className="vital-name">
                  {name}
                  {meta?.core ? <em className="core">core</em> : null}
                </span>
                <span className="vital-value">{format(name, m.value)}</span>
              </div>
            );
          })}
          <p className="vitals-hint">
            Full payloads are logged to the browser console.
          </p>
        </div>
      )}
    </aside>
  );
}
