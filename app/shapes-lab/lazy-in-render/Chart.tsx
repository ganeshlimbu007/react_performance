"use client";

import { useLayoutEffect } from "react";
import { count } from "../../_lab-kit/counters";
import { record } from "./commitLog";

export default function Chart() {
  count("Chart");
  useLayoutEffect(() => {
    record("content");
  });
  return <div className="sh-chart">Chart content</div>;
}
