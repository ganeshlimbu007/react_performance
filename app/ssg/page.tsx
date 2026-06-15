import { RenderInfo } from "../components/RenderInfo";

/**
 * SSG — Static Site Generation.
 *
 * With no dynamic APIs and `force-static`, Next.js renders this page ONCE at
 * build time (`npm run build`) and serves the cached HTML to everyone. The
 * timestamp is frozen at build time and never changes on reload (in a
 * production build).
 */
export const dynamic = "force-static";

export default function SsgPage() {
  const builtAt = new Date().toISOString();

  return (
    <article className="page">
      <h1>Static Site Generation (SSG)</h1>
      <p className="lead">
        HTML generated once at <em>build time</em> and served from cache.
      </p>

      <RenderInfo
        technique="SSG (export const dynamic = 'force-static')"
        renderedAt={builtAt}
        where="build"
        observe="In a production build the timestamp is FROZEN — same on every reload."
      />

      <div className="data-box">
        <p>
          This HTML was generated at build time: <strong>{builtAt}</strong>
        </p>
        <p className="note">
          Run <code>npm run build &amp;&amp; npm start</code> to see the frozen
          behaviour (in <code>npm run dev</code> it re-renders each time).
        </p>
      </div>
    </article>
  );
}
