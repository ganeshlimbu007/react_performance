"use client";

import { useState } from "react";

/**
 * A tiny Client Component island. This is the only part of the
 * /server-component route that ships interactive JavaScript to the browser.
 */
export function LikeButton() {
  const [likes, setLikes] = useState(0);
  return (
    <button className="like-btn" onClick={() => setLikes((n) => n + 1)}>
      👍 Client island — likes: {likes}
    </button>
  );
}
