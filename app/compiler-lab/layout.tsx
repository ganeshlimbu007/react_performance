import type { ReactNode } from "react";
import { InteractionHUD } from "../_lab-kit/InteractionHUD";

export default function CompilerLabLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="lab-inset">{children}</div>
      <InteractionHUD lab="compiler-lab" />
    </>
  );
}
