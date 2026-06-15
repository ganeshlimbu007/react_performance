import { RenderInfo } from "../components/RenderInfo";
import { LikeButton } from "./LikeButton";

/**
 * RSC — React Server Components.
 *
 * This whole page is a Server Component: the async data fetch and rendering
 * happen on the server, and NO JavaScript for this logic is shipped to the
 * browser. Interactive bits live in a small Client Component island
 * (<LikeButton />), demonstrating the "server shell + client islands" model.
 */
async function getServerData() {
  await new Promise((r) => setTimeout(r, 150));
  return {
    renderedAt: new Date().toISOString(),
    secret: "This string was computed on the server and never shipped as JS.",
  };
}

export default async function ServerComponentPage() {
  const data = await getServerData();

  return (
    <article className="page">
      <h1>React Server Components (RSC)</h1>
      <p className="lead">
        Rendered on the server with <strong>zero client JS</strong> for the data
        layer. Interactivity is an isolated client island.
      </p>

      <RenderInfo
        technique="Async Server Component + Client island"
        renderedAt={data.renderedAt}
        where="server"
        observe="The 'Like' button is the only hydrated JS — the rest is server HTML."
      />

      <div className="data-box">
        <p>{data.secret}</p>
        <LikeButton />
      </div>
    </article>
  );
}
