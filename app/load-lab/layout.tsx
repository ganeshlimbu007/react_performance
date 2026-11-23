import type { ReactNode } from "react";
import { InteractionHUD } from "../_lab-kit/InteractionHUD";

// Mounted per-lab, not globally.
export default function LoadLabLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <InteractionHUD lab="load-lab" />
    </>
  );
}
