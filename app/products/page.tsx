import Link from "next/link";
import { RenderInfo } from "../components/RenderInfo";

/**
 * Index for the Incremental Static Generation demo.
 *
 * IDs 1–3 are pre-rendered at build time (see generateStaticParams in
 * ./[id]/page.tsx). IDs 4+ do not exist at build time — visiting them generates
 * and caches a static page ON DEMAND, the first time they are requested. That
 * on-demand static generation is "incremental SSG".
 */
export default function ProductsPage() {
  return (
    <article className="page">
      <h1>Incremental Static Generation (products)</h1>
      <p className="lead">
        A subset of pages is built ahead of time; the rest are generated and
        cached on first visit.
      </p>

      <RenderInfo
        technique="generateStaticParams + dynamicParams (default true)"
        renderedAt="(this index is static)"
        where="build"
        observe="IDs 1–3 are prebuilt; IDs 4+ are generated on first request, then cached."
      />

      <div className="data-box">
        <p>
          <strong>Prebuilt at build time</strong> (instant):
        </p>
        <ul>
          {[1, 2, 3].map((id) => (
            <li key={id}>
              <Link href={`/products/${id}`}>/products/{id}</Link>
            </li>
          ))}
        </ul>
        <p>
          <strong>Generated on demand</strong> (slow on first hit, cached
          after):
        </p>
        <ul>
          {[4, 5, 42].map((id) => (
            <li key={id}>
              <Link href={`/products/${id}`}>/products/{id}</Link>
            </li>
          ))}
        </ul>
        <p className="note">
          Best observed in a production build (
          <code>npm run build &amp;&amp; npm start</code>): the build log lists
          only /products/1–3 as prerendered.
        </p>
      </div>
    </article>
  );
}
