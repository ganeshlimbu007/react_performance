import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { ARTICLE_MARKDOWN, SANITIZE_OPTIONS } from "../content";
import { CopyLinkButton } from "./CopyLinkButton";

export const dynamic = "force-static";
export const metadata = { title: "Load Lab · markdown in a server component" };

export default function MarkdownServerPage() {
  // Both libraries are imported and run here, in a server component.
  const html = sanitizeHtml(
    marked.parse(ARTICLE_MARKDOWN, { async: false }) as string,
    SANITIZE_OPTIONS,
  );

  return (
    <article className="page">
      <header className="sl-head">
        <h1>Station 2 — markdown rendered on the server</h1>
        <p className="lead">
          The same content and the same CSS as station 1, but the page itself (a
          server component) imports <code>marked</code> and{" "}
          <code>sanitize-html</code> and renders the sanitised HTML.
        </p>
      </header>

      <p className="sl-setup">
        The page is <code>force-static</code>. One small client island below
        keeps the route hydrating something.
      </p>

      <CopyLinkButton />

      <div
        className="ll-article"
        // Sanitised immediately above with sanitize-html.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
