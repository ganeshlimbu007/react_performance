import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/csr", label: "CSR" },
  { href: "/ssr", label: "SSR" },
  { href: "/ssg", label: "SSG" },
  { href: "/isr", label: "ISR" },
  { href: "/products", label: "Incremental SSG" },
  { href: "/streaming", label: "Streaming" },
  { href: "/server-component", label: "Server Component" },
  { href: "/vitals-lab", label: "Vitals Lab" },
  { href: "/render-lab", label: "Render Lab" },
  // Six per-lab links would crowd the nav, so the rest of Week 2 is reached
  // through its index. "Render Lab" stays, since Part 1 is done first.
  { href: "/week-2", label: "Week 2" },
];

export function Nav() {
  return (
    <nav className="nav">
      <Link href="/" className="brand">
        ⚡ React Perf Lab
      </Link>
      <div className="nav-links">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
