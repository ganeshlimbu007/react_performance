import { VariantSwitch } from "../../_lab-kit/VariantSwitch";
import { LazyEditor } from "./LazyEditor";

export const metadata = { title: "Load Lab · lazy editor" };

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function LazyEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const warm = one(sp.warm) === "1";

  return (
    <article className="page">
      <header className="sl-head">
        <h1>Station 4 — a lazy editor chunk</h1>
        <p className="lead">
          The editor is a separate client chunk containing <code>marked</code>{" "}
          and <code>sanitize-html</code>, loaded only when you open it.
        </p>
      </header>

      <p className="sl-setup">
        &ldquo;Open editor&rdquo; mounts a module-scope{" "}
        <code>lazy(() =&gt; import(&apos;./Editor&apos;))</code> inside Suspense.{" "}
        {warm
          ? "Hovering or focusing the button starts the same import early, sharing one promise."
          : "No warm-up: the import starts on click."}{" "}
        Throttle the network to Slow 4G before you try this.
      </p>

      <VariantSwitch
        label="warm"
        basePath="/load-lab/lazy-editor"
        param="warm"
        current={warm ? "1" : "0"}
        options={["0", "1"]}
      />

      <LazyEditor warm={warm} />
    </article>
  );
}
