import { Readout } from "../../shapes-lab/Readout";
import {
  Control,
  NestedHooks,
  ReadsRef,
  WritesOutside,
} from "./components";

export const metadata = { title: "Compiler Lab · where it says nothing" };

export default function SkipsPage() {
  return (
    <article className="page">
      <header className="sl-head">
        <h1>C2 — where the compiler says nothing</h1>
        <p className="lead">
          Four components, all starting with <code>&apos;use memo&apos;</code>,
          each rendering a counted child and each with its own Bump button.
        </p>
      </header>

      <p className="sl-setup">
        One is rule-abiding. The others write to a module-level object during
        render, read and increment a ref during render, and declare a component
        inside themselves that calls <code>useEffect</code>. The build succeeds
        either way, because <code>panicThreshold</code> is at its default.
      </p>

      <div className="sh-grid">
        <Control />
        <WritesOutside />
        <ReadsRef />
        <NestedHooks />
      </div>

      <Readout
        counters={[
          "Control.Child",
          "WritesOutside.Child",
          "ReadsRef.Child",
          "NestedHooks.Child",
        ]}
      />

      <p className="hud-note">
        Bump each one and read its child&rsquo;s count. Then run{" "}
        <code>npm run compiler:report</code> and compare, and check the React
        DevTools Components tab for the <strong>Memo</strong> badge.
      </p>
    </article>
  );
}
