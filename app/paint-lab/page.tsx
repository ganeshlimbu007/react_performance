import Link from "next/link";

export const metadata = { title: "Paint Lab" };

const STATIONS = [
  {
    href: "/paint-lab/density",
    title: "P1 · Density",
    desc: "5,000 rows, one density toggle — changed on the container or on every row, with and without content-visibility.",
    variants: "change=container | rows · cv=0 | 1",
  },
  {
    href: "/paint-lab/thrash",
    title: "P2 · Layout thrashing",
    desc: "1,000 boxes whose width comes from the wrapper: read inside the write loop, read once, or read and written per component in a layout effect.",
    variants: "mode=interleave | batch | per-component",
  },
  {
    href: "/paint-lab/virtual",
    title: "P3 · Virtualisation versus DOM size",
    desc: "5,000 rows rendered in full or through react-window, measuring mount time, DOM nodes and a theme change.",
    variants: "mode=plain | window",
  },
  {
    href: "/paint-lab/animate",
    title: "P4 · Animation",
    desc: "A box moved by React state on every frame, by a CSS animation on left, or by a CSS animation on transform — optionally with a busy main thread.",
    variants: "mode=state | left | transform · busy=0 | 1",
  },
];

export default function PaintLabIndex() {
  return (
    <article className="page">
      <h1>Paint Lab — the browser&rsquo;s half</h1>
      <p className="lead">
        Style, layout and paint cost that React&rsquo;s own tools cannot see.
        The HUD&rsquo;s <strong>presentation</strong> number is where most of
        this shows up.
      </p>

      <div className="sl-setup">
        Record in DevTools → Performance and read the interaction&rsquo;s three
        parts, then look at what the main thread actually did: Recalculate
        Style, Layout, Pre-paint, Paint. What to record per station is in{" "}
        <code>app/paint-lab/README.md</code>.
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
