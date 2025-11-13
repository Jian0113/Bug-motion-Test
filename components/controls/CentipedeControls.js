import { Leva, useControls } from "leva";
import { useEffect } from "react";

export default function CentipedeControls({ initialValues, onChange }) {
  const {
    spriteScale,
    headScale,
    bodyScale,
    legScale,
    headRot,
    bodyRot,
    legLeftRot,
    legRightRot,
    legSpread,
    legPairGap,
    legAnchor,
    legAnchorShift,
    legAnchorLeftXPct,
    legAnchorLeftYPct,
    legAnchorRightXPct,
    legAnchorRightYPct,
  } = useControls("Centipede", {
    spriteScale: { value: initialValues.spriteScale ?? 1.0, min: 0.1, max: 3.0, step: 0.01 },
    headScale: { value: initialValues.headScale ?? 0.08, min: 0.01, max: 2, step: 0.01 },
    bodyScale: { value: initialValues.bodyScale ?? 0.07, min: 0.05, max: 3.0, step: 0.01 },
    legScale: { value: initialValues.legScale ?? 0.05, min: 0.02, max: 1.5, step: 0.01 },
    headRot: { value: initialValues.headRot ?? 90, min: -180, max: 180, step: 1 },
    bodyRot: { value: initialValues.bodyRot ?? -90, min: -180, max: 180, step: 1 },
    legLeftRot: { value: initialValues.legLeftRot ?? -180, min: -180, max: 180, step: 1 },
    legRightRot: { value: initialValues.legRightRot ?? 0, min: -180, max: 180, step: 1 },
    legSpread: { value: initialValues.legSpread ?? 1.0, min: 0.3, max: 6.0, step: 0.01 },
    legPairGap: { value: initialValues.legPairGap ?? 24, min: 0, max: 160, step: 1 },
    legAnchor: { value: initialValues.legAnchor ?? "mid", options: { Mid: "mid", Knee: "knee", Foot: "foot" } },
    legAnchorShift: { value: initialValues.legAnchorShift ?? 2, min: -60, max: 60, step: 1 },
    legAnchorLeftXPct: { value: initialValues.legAnchorLeftXPct ?? 0.93, min: 0, max: 1, step: 0.01 },
    legAnchorLeftYPct: { value: initialValues.legAnchorLeftYPct ?? 0.2, min: 0, max: 1, step: 0.01 },
    legAnchorRightXPct: { value: initialValues.legAnchorRightXPct ?? 0.1, min: 0, max: 1, step: 0.01 },
    legAnchorRightYPct: { value: initialValues.legAnchorRightYPct ?? 0.2, min: 0, max: 1, step: 0.01 },
  });

  useEffect(() => {
    onChange?.({
      spriteScale,
      scales: { head: headScale, body: bodyScale, leg: legScale },
      rotationOffsets: {
        head: headRot,
        body: bodyRot,
        legLeft: legLeftRot,
        legRight: legRightRot,
      },
      legSpread,
      legPairGap,
      legAnchor,
      legAnchorShift,
      legAnchorLeftPct: { x: legAnchorLeftXPct, y: legAnchorLeftYPct },
      legAnchorRightPct: { x: legAnchorRightXPct, y: legAnchorRightYPct },
    });
  }, [spriteScale, headScale, bodyScale, legScale, headRot, bodyRot, legLeftRot, legRightRot, legSpread, legPairGap, legAnchor, legAnchorShift, legAnchorLeftXPct, legAnchorLeftYPct, legAnchorRightXPct, legAnchorRightYPct]);

  return <Leva collapsed={false} />;
}


