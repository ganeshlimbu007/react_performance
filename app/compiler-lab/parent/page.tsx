import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { Readout } from "../../shapes-lab/Readout";
import { ParentCompiled } from "./ParentCompiled";
import { ParentPlain } from "./ParentPlain";

export const metadata = { title: "Compiler Lab · compiled versus plain" };

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ParentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const compiled = one(sp.compiled) === "1";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>C1 — compiled versus plain</h1>
        <p className="lead">
          Two identical copies of the same component. Only one of them has the{" "}
          <code>&apos;use memo&apos;</code> directive.
        </p>
      </header>

      <p className="sl-setup">
        {compiled
          ? "This copy's body starts with 'use memo', so the React Compiler compiles it."
          : "This copy has no directive, so in annotation mode it is not compiled."}{" "}
        <code>expensive(q)</code> is counted and burns 2 ms of synthetic cost;{" "}
        <code>Child</code> and <code>Price</code> are plain shared components
        that count their own bodies.
      </p>

      <VariantSwitch
        label="compiled"
        basePath="/compiler-lab/parent"
        param="compiled"
        current={compiled ? "1" : "0"}
        options={["0", "1"]}
      />

      {compiled ? <ParentCompiled /> : <ParentPlain />}

      <Readout counters={["Parent", "expensive", "Child", "Price"]} />

      <p className="hud-note">
        Press &ldquo;Bump unrelated state&rdquo; and read which bodies ran. Check
        the React DevTools Components tab for the compiler&rsquo;s{" "}
        <strong>Memo</strong> badge.
      </p>
    </article>
  );
}
