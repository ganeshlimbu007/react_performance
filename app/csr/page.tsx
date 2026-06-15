"use client";

import { useEffect, useState } from "react";
import { RenderInfo } from "../components/RenderInfo";

/**
 * CSR — Client-Side Rendering.
 *
 * The component is a Client Component ('use client'). The server sends a near
 * empty shell and the browser fetches the data after hydration. Reload and you
 * will see a brief "Loading…" state — that gap is the cost of CSR and typically
 * pushes out LCP compared to SSR/SSG.
 */
export default function CsrPage() {
  const [time, setTime] = useState<string | null>(null);
  const [renderedAt] = useState(() => new Date().toISOString());

  useEffect(() => {
    fetch("/api/time")
      .then((r) => r.json())
      .then((d) => setTime(d.time));
  }, []);

  return (
    <article className="page">
      <h1>Client-Side Rendering (CSR)</h1>
      <p className="lead">
        Rendered in the browser. Data is fetched <em>after</em> the JavaScript
        loads and hydrates.
      </p>

      <RenderInfo
        technique="CSR (browser fetch in useEffect)"
        renderedAt={renderedAt}
        where="client"
        observe="A 'Loading…' flash on every reload while the fetch resolves."
      />

      <div className="data-box">
        {time ? (
          <p>
            Data fetched from API at: <strong>{time}</strong>
          </p>
        ) : (
          <p className="loading">Loading… (fetching on the client)</p>
        )}
      </div>
    </article>
  );
}
