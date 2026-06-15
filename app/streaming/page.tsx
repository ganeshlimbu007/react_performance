import { Suspense } from "react";
import { RenderInfo } from "../components/RenderInfo";

// Render fresh on each request so the streaming behaviour is always visible.
export const dynamic = "force-dynamic";

async function SlowWidget({ label, delay }: { label: string; delay: number }) {
  await new Promise((r) => setTimeout(r, delay));
  return (
    <div className="data-box">
      <p>
        <strong>{label}</strong> resolved after {delay}ms — it streamed in
        independently at {new Date().toISOString()}.
      </p>
    </div>
  );
}

function Skeleton({ label }: { label: string }) {
  return (
    <div className="data-box loading">
      <p>Loading {label}… (Suspense fallback streaming)</p>
    </div>
  );
}

/**
 * Streaming SSR with React Suspense.
 *
 * The static shell (heading, RenderInfo) is sent immediately. Each <Suspense>
 * boundary streams in independently as its async server component resolves, so
 * the fast widget appears well before the slow one — improving perceived
 * performance (TTFB/LCP) versus a single blocking server render.
 */
export default function StreamingPage() {
  return (
    <article className="page">
      <h1>Streaming SSR (Suspense)</h1>
      <p className="lead">
        The shell paints instantly; each section streams in on its own as its
        data resolves.
      </p>

      <RenderInfo
        technique="Streaming with independent <Suspense> boundaries"
        renderedAt="(shell sent immediately)"
        where="server"
        observe="The fast widget appears first; the slow one streams in ~2s later."
      />

      <Suspense fallback={<Skeleton label="fast widget" />}>
        <SlowWidget label="Fast widget" delay={600} />
      </Suspense>

      <Suspense fallback={<Skeleton label="slow widget" />}>
        <SlowWidget label="Slow widget" delay={2200} />
      </Suspense>
    </article>
  );
}
