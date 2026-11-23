"use client";

import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { ARTICLE_MARKDOWN, SANITIZE_OPTIONS } from "../content";

export function ClientArticle() {
  const html = sanitizeHtml(
    marked.parse(ARTICLE_MARKDOWN, { async: false }) as string,
    SANITIZE_OPTIONS,
  );

  return (
    <div
      className="ll-article"
      // Sanitised immediately above with sanitize-html.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
