import Link from "next/link";

export const metadata = { title: "Schedule Lab" };

const STATIONS = [
  {
    href: "/schedule-lab/keystroke",
    title: "1 · One keystroke, four ways",
    desc: "The same filtered list driven by useState, a transition, a deferred value, and a deferred value without memo.",
    variants: "mode=sync | transition | deferred | deferred-nomemo · probe=1",
  },
  {
    href: "/schedule-lab/tabs",
    title: "2 · A slow tab switch",
    desc: "Switching tab renders 200 rows of synthetic cost, either directly or inside a transition.",
    variants: "mode=sync | transition",
  },
  {
    href: "/schedule-lab/reveal",
    title: "3 · The Suspense reveal throttle",
    desc: "A lazy panel resolves a chosen number of ms after the fallback appears. Records resolved-at and revealed-at.",
    variants: "delay=20|50|150|280|400 · switch=plain|transition · warm=0|1",
  },
  {
    href: "/schedule-lab/activity",
    title: "4 · Hidden but alive",
    desc: "A tab with an 80 ms render and local state, either unmounted when you leave it or kept with <Activity>.",
    variants: "mode=unmount | activity",
  },
  {
    href: "/schedule-lab/yield",
    title: "5 · Your own long task",
    desc: "A 5,000-row report built in a click handler: one blocking loop, a deadline-based yield loop, or setTimeout(0).",
    variants: "mode=block | yield | timeout",
  },
];

export default function ScheduleLabIndex() {
  return (
    <article className="page">
      <h1>Schedule Lab — when does the work happen?</h1>
      <p className="lead">
        Five stations about <em>scheduling</em>: where work lands relative to the
        frame. Each station keeps a slower and a faster way side by side, both
        reachable by URL.
      </p>

      <div className="sl-setup">
        Profile with <code>npm run build:profile &amp;&amp; npm start</code>. The
        measuring protocol, including CPU throttling and how many repeats to
        take, is in <code>app/schedule-lab/README.md</code>. Write predictions in{" "}
        <code>PREDICTIONS.md</code> first, results in <code>RESULTS.md</code>,
        and only then open <code>EXPECTED.md</code>.
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
        <h3>The HUD</h3>
        <p>
          The panel in the bottom-left splits each interaction into{" "}
          <strong>input delay + processing + presentation</strong> from the Event
          Timing API, counts long tasks and the worst long-animation-frame
          blocking time, shows component body counts and Profiler commits, and
          reports the latest INP attribution including <code>loadState</code>.
          &ldquo;Copy row&rdquo; gives you a Markdown row for{" "}
          <code>RESULTS.md</code>.
        </p>
      </section>
    </article>
  );
}
