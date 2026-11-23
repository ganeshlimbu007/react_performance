// Station 1 — "everything client".
//
// This station exists to show what happens when static content is turned into
// HTML in the browser: the page is a static server shell, and ALL of the
// markdown work (and both libraries) lives in the client component below it.
// That is deliberate here, and the opposite of what /load-lab/markdown-server
// does with the same content.

import { ClientArticle } from "./ClientArticle";

export const dynamic = "force-static";
export const metadata = { title: "Load Lab · markdown in a client component" };

export default function MarkdownClientPage() {
  return (
    <article className="page">
      <header className="sl-head">
        <h1>Station 1 — markdown rendered on the client</h1>
        <p className="lead">
          A static server shell that renders a client component, which imports{" "}
          <code>marked</code> and <code>sanitize-html</code> and builds the HTML
          in the browser.
        </p>
      </header>

      <p className="sl-setup">
        The page is <code>force-static</code>. Everything below this line is
        produced by client JavaScript.
      </p>

      <ClientArticle />
    </article>
  );
}
