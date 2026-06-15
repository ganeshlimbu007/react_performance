import Link from "next/link";

const TECHNIQUES = [
  {
    href: "/csr",
    title: "CSR — Client-Side Rendering",
    desc: "Page shell ships first, data is fetched in the browser with useEffect. Watch TTFB stay low but LCP arrive later.",
    badge: "force-dynamic + 'use client'",
  },
  {
    href: "/ssr",
    title: "SSR — Server-Side Rendering",
    desc: "HTML rendered on the server on every request. Fresh data each load via export const dynamic = 'force-dynamic'.",
    badge: "dynamic = 'force-dynamic'",
  },
  {
    href: "/ssg",
    title: "SSG — Static Site Generation",
    desc: "HTML built once at build time and served from cache. Note the timestamp never changes between reloads.",
    badge: "default static",
  },
  {
    href: "/isr",
    title: "ISR — Incremental Static Regeneration",
    desc: "Static page that re-generates in the background every N seconds. The timestamp updates after the revalidate window.",
    badge: "revalidate = 10",
  },
  {
    href: "/server-component",
    title: "RSC — React Server Components",
    desc: "Async component that fetches & renders on the server, streaming zero JS for its data layer to the client.",
    badge: "async server component",
  },
  {
    href: "/vitals-lab",
    title: "Core Web Vitals Lab",
    desc: "Trigger LCP, CLS and INP on demand with controlled demos so you can see the dashboard react in real time.",
    badge: "LCP · CLS · INP",
  },
];

export default function Home() {
  return (
    <div>
      <header className="hero">
        <h1>React Performance Lab</h1>
        <p>
          A single playground to test the <strong>3 Core Web Vitals</strong>{" "}
          (LCP, CLS, INP) and <strong>every Next.js rendering technique</strong>
          . The live dashboard in the bottom-right corner reports metrics as you
          browse.
        </p>
      </header>

      <section className="grid">
        {TECHNIQUES.map((t) => (
          <Link key={t.href} href={t.href} className="card">
            <span className="card-badge">{t.badge}</span>
            <h2>{t.title}</h2>
            <p>{t.desc}</p>
          </Link>
        ))}
      </section>

      <section className="callout">
        <h3>How to use this lab</h3>
        <ol>
          <li>
            Open your browser DevTools console — full Web Vitals payloads are
            logged there.
          </li>
          <li>
            For the most realistic numbers, run a{" "}
            <code>npm run build &amp;&amp; npm start</code> production build
            (dev mode adds overhead and disables real static caching).
          </li>
          <li>
            Use Lighthouse / the Performance panel alongside the on-page
            dashboard to cross-check.
          </li>
        </ol>
      </section>
    </div>
  );
}
