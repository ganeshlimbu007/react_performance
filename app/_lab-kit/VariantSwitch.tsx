import Link from "next/link";

/**
 * Variant switcher. Links, not buttons, because each variant is a URL — with
 * aria-current="page" on the active one.
 */
export function VariantSwitch({
  label,
  basePath,
  param,
  current,
  options,
  extra,
}: {
  label: string;
  basePath: string;
  param: string;
  current: string;
  options: string[];
  /** Other query params to preserve, e.g. { cost: '0.25', rows: '200' }. */
  extra?: Record<string, string | undefined>;
}) {
  return (
    <nav className="sl-switch" aria-label={label}>
      <span className="hud-k" style={{ alignSelf: "center" }}>
        {label}:
      </span>
      {options.map((opt) => {
        const qs = new URLSearchParams();
        qs.set(param, opt);
        for (const [k, v] of Object.entries(extra ?? {})) {
          if (v !== undefined && v !== "") qs.set(k, v);
        }
        const active = opt === current;
        return (
          <Link
            key={opt}
            href={`${basePath}?${qs.toString()}`}
            aria-current={active ? "page" : undefined}
          >
            {opt}
          </Link>
        );
      })}
    </nav>
  );
}
