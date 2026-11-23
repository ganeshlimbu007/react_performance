import Link from "next/link";

export const metadata = { title: "Compiler Lab" };

export default function CompilerLabIndex() {
  return (
    <article className="page">
      <h1>Compiler Lab — what the compiler does, and where it says nothing</h1>
      <p className="lead">
        React Compiler 1.0 is enabled in <strong>annotation mode only</strong>:
        it compiles a function solely when that function&rsquo;s body starts
        with the <code>&apos;use memo&apos;</code> directive. Nothing else in
        this repo is compiled.
      </p>

      <div className="sl-setup">
        <code>panicThreshold</code> is left at its default, so a function that
        cannot be compiled fails <em>silently</em> and the build still succeeds
        — which is how it behaves in production, and the point of C2.
      </div>

      <section className="grid">
        <Link href="/compiler-lab/parent" className="card">
          <span className="card-badge">compiled=0 | 1</span>
          <h2>C1 · Compiled versus plain</h2>
          <p>
            Two identical copies of one component, only one carrying the
            directive. Shows which bodies run on an unrelated state bump.
          </p>
        </Link>
        <Link href="/compiler-lab/skips" className="card">
          <span className="card-badge">4 components</span>
          <h2>C2 · Where it says nothing</h2>
          <p>
            Control, WritesOutside, ReadsRef and NestedHooks — all annotated,
            not all compiled, and nothing at runtime tells you which.
          </p>
        </Link>
      </section>

      <section className="callout">
        <h3>The two scripts</h3>
        <ul>
          <li>
            <code>npm run compiler:report</code> — runs the Babel plugin over
            this lab and <code>app/shapes-lab/remount/</code> and prints what
            compiled, what failed, and why. Add{" "}
            <code>--emit &lt;file&gt;</code> to print the compiled output and
            read the <code>_c(n)</code> cache slots.
          </li>
          <li>
            <code>npm run lint:hooks</code> — the{" "}
            <code>eslint-plugin-react-hooks</code> rules over the Part 3 labs
            only. Findings are expected; it never fails the shell.
          </li>
        </ul>
        <p className="hud-note">
          Both skip <code>app/render-lab/</code> entirely. See{" "}
          <code>app/compiler-lab/README.md</code>.
        </p>
      </section>
    </article>
  );
}
