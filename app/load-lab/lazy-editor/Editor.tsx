"use client";

import { marked } from "marked";
import { useLayoutEffect, useState } from "react";
import sanitizeHtml from "sanitize-html";
import { SANITIZE_OPTIONS } from "../content";
import { recordEditorCommitted } from "./editorLoader";

const START = `# Hello

Type **markdown** on the left and it is rendered on the right.

- marked turns it into HTML
- sanitize-html cleans it

\`\`\`ts
const answer = 42;
\`\`\`
`;

export default function Editor() {
  const [src, setSrc] = useState(START);

  useLayoutEffect(() => {
    recordEditorCommitted();
  }, []);

  const html = sanitizeHtml(
    marked.parse(src, { async: false }) as string,
    SANITIZE_OPTIONS,
  );

  return (
    <div className="ll-editor">
      <div className="sl-field">
        <label htmlFor="editor-src">Markdown source</label>
        <textarea
          id="editor-src"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
        />
      </div>
      <div>
        <span className="hud-k">Preview</span>
        <div
          className="ll-article"
          // Sanitised immediately above with sanitize-html.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
