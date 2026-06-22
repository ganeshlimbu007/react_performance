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
