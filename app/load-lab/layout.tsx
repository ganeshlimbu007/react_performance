import type { ReactNode } from "react";
import { InteractionHUD } from "../_lab-kit/InteractionHUD";

// Mounted per-lab, not globally.
export default function LoadLabLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* lab-inset reserves room so the fixed HUD never covers the stations'
          own controls at common laptop widths. */}
      <div className="lab-inset">{children}</div>
      <InteractionHUD lab="load-lab" />
    </>
  );
}
