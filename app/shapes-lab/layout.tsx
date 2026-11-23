import type { ReactNode } from "react";
import { InteractionHUD } from "../_lab-kit/InteractionHUD";

export default function ShapesLabLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* lab-inset keeps the fixed HUD clear of the stations' own controls. */}
      <div className="lab-inset">{children}</div>
      <InteractionHUD lab="shapes-lab" />
    </>
  );
}
