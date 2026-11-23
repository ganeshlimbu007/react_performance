import Link from "next/link";

export const metadata = { title: "Load Lab" };

const STATIONS = [
  {
    href: "/load-lab/markdown-client",
    title: "1 · Markdown on the client",
    desc: "A static server shell renders a client component that imports marked and sanitize-html and builds the HTML in the browser.",
    variants: "force-static · everything client",
  },
  {
    href: "/load-lab/markdown-server",
    title: "2 · Markdown on the server",
    desc: "The same content and CSS, but the server component imports both libraries and renders the sanitised HTML. One tiny client island remains.",
    variants: "force-static · server component",
  },
  {
    href: "/load-lab/hydration",
    title: "3 · Hydration",
    desc: "One identical client island above 1,000 cards — each card either its own client component or plain server markup.",
    variants: "mode=client | server",
  },
  {
    href: "/load-lab/lazy-editor",
    title: "4 · A lazy editor chunk",
    desc: "An editor in its own client chunk, loaded on click or warmed on hover. Records click → committed.",
    variants: "warm=0 | 1",
  },
];

export default function LoadLabIndex() {
  return (
    <article className="page">
      <h1>Load Lab — what must arrive before anything works?</h1>
      <p className="lead">
        Four stations about <em>load</em>: client JS per route, the server
        boundary, code splitting, and hydration.
      </p>

      <div className="sl-setup">
        Record bundle numbers with the analyzer and interaction numbers with
        DevTools. The full procedure, including how to keep a copy of the
        analysis for comparison, is in <code>app/load-lab/README.md</code>. Fill{" "}
        <code>LOAD.md</code> before opening <code>EXPECTED.md</code>.
      </div>

      <section className="grid">
        {STATIONS.map((s) => (
          <Link key={s.href} href={s.href} className="card">
            <span className="card-badge">{s.variants}</span>
            <h2>{s.title}</h2>
            <p>{s.desc}</p>
          </Link>
        ))}
      </section>

      <section className="callout">
        <h3>Running the analyzer</h3>
        <ol>
          <li>
            <code>npm run analyze</code> — writes{" "}
            <code>.next/diagnostics/analyze</code> without starting a server.
          </li>
          <li>
            <code>
              mkdir -p perf &amp;&amp; cp -r .next/diagnostics/analyze
              perf/analyze-&lt;label&gt;
            </code>{" "}
            keeps a copy. <code>perf/</code> is git-ignored.
          </li>
          <li>
            In the analyzer UI, filter by route and by <strong>client</strong>,
            then find the import chain that brings <code>sanitize-html</code>{" "}
            into each route.
          </li>
        </ol>
      </section>
    </article>
  );
}
