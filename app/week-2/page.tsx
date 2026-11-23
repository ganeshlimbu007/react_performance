import Link from "next/link";

export const metadata = { title: "Week 2 — React performance" };

export default function WeekTwoIndex() {
  return (
    <article className="page">
      <header className="sl-head">
        <h1>Week 2 — React performance</h1>
        <p className="lead">
          React performance as five independent questions:{" "}
          <strong>measurement</strong>, <strong>frequency</strong>,{" "}
          <strong>expense</strong>, <strong>scheduling</strong> and{" "}
          <strong>load</strong>. Work through the parts in order.
        </p>
      </header>

      <div className="sl-setup">
        Profile everything with{" "}
        <code>npm run build:profile &amp;&amp; npm start</code>. A plain{" "}
        <code>npm run build</code> compiles React&rsquo;s profiling timing out,
        so the DevTools Profiler cannot read it. Write the week up in{" "}
        <code>PERFORMANCE.md</code> at the repo root.
      </div>

      <section className="w2-part">
        <h2>Part 1 — diagnose</h2>
        <p>
          Frequency and expense, seen from React&rsquo;s side: a dashboard with
          planted render problems, found with the React DevTools Profiler.
        </p>
        <ul className="w2-list">
          <li>
            <Link href="/render-lab">/render-lab</Link> — the dashboard. Follow
            the instructions in <code>app/render-lab/README.md</code>, fill in{" "}
            <code>BASELINE.md</code>, and only then grade yourself.
          </li>
        </ul>
        <p className="hud-note">
          Do Part 3&rsquo;s labs <strong>after</strong> you have filled in Part
          1&rsquo;s <code>BASELINE.md</code> — some Part 3 stations teach the
          general fixes and would make Part 1&rsquo;s diagnosis too easy.
        </p>
      </section>

      <section className="w2-part">
        <h2>Part 2 — scheduling and load</h2>
        <ul className="w2-list">
          <li>
            <Link href="/schedule-lab">/schedule-lab</Link> — when work happens
            relative to the frame: transitions, deferred values, the Suspense
            reveal throttle, <code>&lt;Activity&gt;</code>, and yielding.
          </li>
          <li>
            <Link href="/load-lab">/load-lab</Link> — what must arrive and run
            before anything works: client JS per route, the server boundary,
            code splitting, and hydration.
          </li>
        </ul>
        <p className="hud-note">
          Worksheets: <code>app/schedule-lab/</code> and{" "}
          <code>app/load-lab/</code>.
        </p>
      </section>

      <section className="w2-part">
        <h2>Part 3 — shapes, the compiler, and the browser&rsquo;s half</h2>
        <ul className="w2-list">
          <li>
            <Link href="/shapes-lab">/shapes-lab</Link> — the shapes that
            multiply renders: effect cascades, components that remount,{" "}
            <code>lazy</code> in render, keys, context versus a store, and state
            bailouts.
          </li>
          <li>
            <Link href="/compiler-lab">/compiler-lab</Link> — what React
            Compiler caches when you opt in, and where it silently does nothing.
          </li>
          <li>
            <Link href="/paint-lab">/paint-lab</Link> — style, layout and paint
            cost that React&rsquo;s tools cannot see.
          </li>
        </ul>
        <p className="hud-note">
          Worksheets: <code>docs/week-2/part-3/</code>.
        </p>
      </section>

      <section className="callout">
        <h3>Also on the site</h3>
        <p>
          <Link href="/vitals-lab">/vitals-lab</Link> triggers the three Core
          Web Vitals on demand, and the rendering-technique routes (
          <Link href="/csr">CSR</Link>, <Link href="/ssr">SSR</Link>,{" "}
          <Link href="/ssg">SSG</Link>, <Link href="/isr">ISR</Link>,{" "}
          <Link href="/products">incremental SSG</Link>,{" "}
          <Link href="/streaming">streaming</Link>,{" "}
          <Link href="/server-component">RSC</Link>) show where HTML comes from.
        </p>
      </section>
    </article>
  );
}
