import Link from "next/link";

export const metadata = { title: "Shapes Lab" };

const STATIONS = [
  {
    href: "/shapes-lab/cascade",
    title: "S1 · Effect cascades",
    desc: "A heavy child whose value is derived during render, or stored in state from useEffect, or from useLayoutEffect. Includes a frame logger.",
    variants: "mode=derive | effect | layout-effect",
  },
  {
    href: "/shapes-lab/remount",
    title: "S2 · Components that remount",
    desc: "200 rows with uncontrolled inputs, where the row component is declared at module scope or inside the parent, compiled or not.",
    variants: "mode=module | inline | inline-direct | inline-compiled | inline-hooks-compiled",
  },
  {
    href: "/shapes-lab/lazy-in-render",
    title: "S3 · lazy() declared in render",
    desc: "A Suspense boundary around a lazy chart, with the lazy() call either inside the parent's body or at module scope.",
    variants: "mode=inside | module",
  },
  {
    href: "/shapes-lab/keys",
    title: "S4 · Keys",
    desc: "Prepending one row to 1,000 memoised rows with uncontrolled inputs, keyed by index or by stable id.",
    variants: "keys=index | id",
  },
  {
    href: "/shapes-lab/context",
    title: "S5 · Context versus a store",
    desc: "A provider holding theme, user and an unrelated tick, read by memoised consumers four different ways.",
    variants: "mode=inline | memo | split | store",
  },
  {
    href: "/shapes-lab/state-bailouts",
    title: "S6 · State bailouts",
    desc: "setState to the same value, and a reducer that returns its current state.",
    variants: "no variants",
  },
];

export default function ShapesLabIndex() {
  return (
    <article className="page">
      <h1>Shapes Lab — shapes that multiply renders</h1>
      <p className="lead">
        Six mechanisms behind most real re-render problems, each isolated on its
        own page so you can profile one at a time.
      </p>

      <div className="sl-setup">
        Profile with <code>npm run build:profile &amp;&amp; npm start</code>. The
        protocol and what to record per station are in{" "}
        <code>app/shapes-lab/README.md</code>. Predictions go in{" "}
        <code>docs/week-2/part-3/PREDICTIONS.md</code> and results in{" "}
        <code>RESULTS.md</code>, before you open <code>EXPECTED.md</code>.
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
    </article>
  );
}
