import { RenderInfo } from "../components/RenderInfo";

/**
 * SSR — Server-Side Rendering.
 *
 * `force-dynamic` opts the route out of static caching, so Next.js renders the
 * HTML on the server for every single request. Reload and the timestamp below
 * changes each time — the page is freshly rendered server-side per request.
 */
export const dynamic = "force-dynamic";

async function getData() {
  // Pretend to hit a database / upstream API on the server.
  await new Promise((r) => setTimeout(r, 200));
  return { time: new Date().toISOString() };
}

export default async function SsrPage() {
  const data = await getData();

  return (
    <article className="page">
      <h1>Server-Side Rendering (SSR)</h1>
      <p className="lead">
        Fully rendered HTML is produced on the server for <em>every request</em>
        .
      </p>

      <RenderInfo
        technique="SSR (export const dynamic = 'force-dynamic')"
        renderedAt={data.time}
        where="server"
        observe="The timestamp changes on EVERY reload — fresh server render each time."
      />

      <div className="data-box">
        <p>
          Server rendered this page at: <strong>{data.time}</strong>
        </p>
      </div>
    </article>
  );
}
