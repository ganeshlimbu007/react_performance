"use client";

import { useLayoutEffect } from "react";
import { recordRevealed } from "./timeline";

export default function PanelB() {
  useLayoutEffect(() => {
    recordRevealed();
  }, []);

  return (
    <div className="sl-setup">
      <strong>Panel B.</strong> Loaded as a separate lazy chunk behind the
      configured delay.
    </div>
  );
}
