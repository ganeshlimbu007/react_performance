import type { ReactNode } from "react";
import { InteractionHUD } from "../_lab-kit/InteractionHUD";

export default function PaintLabLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="lab-inset">{children}</div>
      <InteractionHUD lab="paint-lab" />
    </>
  );
}
