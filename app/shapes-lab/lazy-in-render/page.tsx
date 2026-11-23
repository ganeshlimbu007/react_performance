import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { LazyInRender } from "./LazyInRender";

export const metadata = { title: "Shapes Lab · lazy declared in render" };

const MODES = ["inside", "module"] as const;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function LazyInRenderPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.mode) ?? "inside";
  const mode = (
    (MODES as readonly string[]).includes(raw) ? raw : "inside"
  ) as "inside" | "module";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>S3 — lazy() declared in render</h1>
        <p className="lead">
          A Suspense boundary around a lazy chart, with a button that re-renders
          the parent.
        </p>
      </header>

      <p className="sl-setup">
        {mode === "inside"
          ? "The lazy() call is written in the parent's body, so it runs on every render."
          : "The lazy() call is written at module scope, so it runs once."}{" "}
        The fallback and the chart each record their commits in a{" "}
        <code>useLayoutEffect</code>.
      </p>

      <VariantSwitch
        label="mode"
        basePath="/shapes-lab/lazy-in-render"
        param="mode"
        current={mode}
        options={[...MODES]}
      />

      <LazyInRender mode={mode} />
    </article>
  );
}
