import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { Remount, type RemountMode } from "./Remount";

export const metadata = { title: "Shapes Lab · components that remount" };

const MODES = [
  "module",
  "inline",
  "inline-direct",
  "inline-compiled",
  "inline-hooks-compiled",
] as const;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

const SETUP: Record<RemountMode, string> = {
  module: "The row component is declared at module scope.",
  inline:
    "The row component is declared inside the parent, calls no hooks, and is used inside .map().",
  "inline-direct":
    "A hook-free component is declared inside the parent and used directly in the returned JSX, not inside .map().",
  "inline-compiled":
    "The same code as the inline variant, with the parent's body starting with the 'use memo' directive.",
  "inline-hooks-compiled":
    "The parent's body starts with 'use memo', and the row component declared inside it calls useEffect.",
};

export default async function RemountPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.mode) ?? "module";
  const mode = (
    (MODES as readonly string[]).includes(raw) ? raw : "module"
  ) as RemountMode;

  return (
    <article className="page">
      <header className="sl-head">
        <h1>S2 — components that remount</h1>
        <p className="lead">
          200 rows, each an <code>&lt;li&gt;</code> with an uncontrolled input
          whose <code>defaultValue</code> names its own row.
        </p>
      </header>

      <p className="sl-setup">{SETUP[mode]}</p>

      <VariantSwitch
        label="mode"
        basePath="/shapes-lab/remount"
        param="mode"
        current={mode}
        options={[...MODES]}
      />

      <p className="hud-note">
        Type something into a few of the inputs before you click &ldquo;Re-render
        parent&rdquo;.
      </p>

      <Remount mode={mode} />

      <p className="hud-note">
        Mounts are counted with a <code>MutationObserver</code> on the list
        container, not with an effect — a hook inside the inner component would
        change what the compiler does to it.
      </p>
    </article>
  );
}
