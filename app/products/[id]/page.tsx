import Link from "next/link";
import { RenderInfo } from "../../components/RenderInfo";

/**
 * Incremental Static Generation — dynamic route segment.
 *
 * generateStaticParams pre-renders ids 1–3 at build time. `dynamicParams`
 * defaults to `true`, so any other id (e.g. /products/42) is statically
 * generated the FIRST time it's requested and then cached for subsequent
 * visitors — this is incremental static generation.
 *
 * `params` is a Promise in this version of Next.js and must be awaited.
 */
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

// Allow ids not returned above to be generated on demand (this is the default,
// stated explicitly here for clarity).
export const dynamicParams = true;

async function getProduct(id: string) {
  // Simulate a slow upstream lookup so on-demand generation is observable.
  await new Promise((r) => setTimeout(r, 400));
  return {
    id,
    name: `Product #${id}`,
    generatedAt: new Date().toISOString(),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  const prebuilt = ["1", "2", "3"].includes(id);

  return (
    <article className="page">
      <h1>{product.name}</h1>
      <p className="lead">
        {prebuilt
          ? "This page was pre-rendered at build time."
          : "This page was generated on demand and is now cached."}
      </p>

      <RenderInfo
        technique={`Incremental SSG — id "${id}" (${
          prebuilt ? "prebuilt" : "on-demand"
        })`}
        renderedAt={product.generatedAt}
        where="build"
        observe="The timestamp is frozen once generated — reload keeps the same value."
      />

      <div className="data-box">
        <p>
          Static snapshot generated at: <strong>{product.generatedAt}</strong>
        </p>
        <p>
          <Link href="/products">← back to product list</Link>
        </p>
      </div>
    </article>
  );
}
