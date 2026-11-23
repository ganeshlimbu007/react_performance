import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { ContextStation } from "./ContextStation";

export const metadata = { title: "Shapes Lab · context versus a store" };

const MODES = ["inline", "memo", "split", "store"] as const;
type Mode = (typeof MODES)[number];

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

const SETUP: Record<Mode, string> = {
  inline:
    "The provider's value is written inline: value={{ theme, user, dispatch }}.",
  memo: "The same value object is wrapped in useMemo, keyed on theme and user.",
  split:
    "State and dispatch live in separate contexts; dispatch comes from useReducer, so its identity is stable.",
  store:
    "No context at all: a small external store read through useSyncExternalStore, with each reader selecting a primitive.",
};

export default async function ContextPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = one(sp.mode) ?? "inline";
  const mode = (
    (MODES as readonly string[]).includes(raw) ? raw : "inline"
  ) as Mode;

  return (
    <article className="page">
      <header className="sl-head">
        <h1>S5 — context versus a store</h1>
        <p className="lead">
          A provider holds <code>theme</code>, <code>user</code> and an
          unrelated <code>tick</code>. All four consumers are memoised.
        </p>
      </header>

      <p className="sl-setup">{SETUP[mode]}</p>

      <VariantSwitch
        label="mode"
        basePath="/shapes-lab/context"
        param="mode"
        current={mode}
        options={[...MODES]}
      />

      <ContextStation mode={mode} />

      <p className="hud-note">
        The table shows which consumers ran their bodies for the last button
        press only. Press a button, then read the table.
      </p>
    </article>
  );
}
