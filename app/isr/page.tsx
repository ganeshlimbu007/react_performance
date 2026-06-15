import { RenderInfo } from "../components/RenderInfo";

/**
 * ISR — Incremental Static Regeneration.
 *
 * The page is served statically (fast, cached) but Next.js re-generates it in
 * the background at most once every `revalidate` seconds. The first request
 * after the window gets the stale page and triggers a rebuild; the next request
 * sees the fresh timestamp. Best of both worlds: static speed + periodic fresh
 * data.
 */
export const revalidate = 10; // seconds

export default function IsrPage() {
  const generatedAt = new Date().toISOString();

  return (
    <article className="page">
      <h1>Incremental Static Regeneration (ISR)</h1>
      <p className="lead">
        Static page that quietly re-builds itself every{" "}
        <strong>{revalidate} seconds</strong>.
      </p>

      <RenderInfo
        technique="ISR (export const revalidate = 10)"
        renderedAt={generatedAt}
        where="build"
        observe="Reload fast → same timestamp. Wait > 10s, reload twice → it updates."
      />

      <div className="data-box">
        <p>
          Static snapshot generated at: <strong>{generatedAt}</strong>
        </p>
        <p className="note">
          Test in production (<code>npm run build &amp;&amp; npm start</code>):
          reload within 10s and the value stays put; after 10s the next reload
          serves a regenerated page.
        </p>
      </div>
    </article>
  );
}
