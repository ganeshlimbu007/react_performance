import type { ReactNode } from "react";
import { InteractionHUD } from "../_lab-kit/InteractionHUD";

// The HUD is mounted here, not globally, and deliberately sits OUTSIDE every
// LabProfiler subtree so its own renders are never counted in a station's
// commits.
export default function ScheduleLabLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {/* lab-inset reserves room so the fixed HUD never covers the stations'
          own controls at common laptop widths. */}
      <div className="lab-inset">{children}</div>
      <InteractionHUD lab="schedule-lab" />
    </>
  );
}
