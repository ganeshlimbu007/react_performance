"use client";

import { useState } from "react";

/** The one tiny client island on this route, so it still hydrates something. */
export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="sl-controls">
      <button onClick={copy}>Copy link to this page</button>
      {copied && (
        <span className="sl-pending" role="status">
          copied
        </span>
      )}
    </div>
  );
}
