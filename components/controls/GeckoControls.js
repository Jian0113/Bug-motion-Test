import { Leva, useControls } from "leva";
import { useEffect } from "react";

export default function GeckoControls({ initialValues, onChange }) {
  const {
    spriteScale,
    bodyCount,
    headScale,
    bodyScale,
    legScale,
    headRot,
    bodyRot,
    legRot,
    leg2Rot,
    legPairGap,
    headOffsetX,
    headOffsetY,
    bodyOffsetX,
    bodyOffsetY,
  } = useControls("Gecko", {
    spriteScale: { value: initialValues.spriteScale ?? 1.0, min: 0.1, max: 3.0, step: 0.01 },
    bodyCount: { value: initialValues.bodyCount ?? 16, min: 1, max: 24, step: 1 },
    headScale: { value: initialValues.headScale ?? 0.08, min: 0.01, max: 2, step: 0.01 },
    bodyScale: { value: initialValues.bodyScale ?? 0.52, min: 0.05, max: 3.0, step: 0.01 },
    legScale: { value: initialValues.legScale ?? 0.05, min: 0.02, max: 1.5, step: 0.01 },
    headRot: { value: initialValues.headRot ?? 0, min: -180, max: 180, step: 1 },
    bodyRot: { value: initialValues.bodyRot ?? 0, min: -180, max: 180, step: 1 },
    legRot: { value: initialValues.legRot ?? 141, min: -180, max: 180, step: 1 },
    leg2Rot: { value: initialValues.leg2Rot ?? -149, min: -180, max: 180, step: 1 },
    legPairGap: { value: initialValues.legPairGap ?? -20, min: -40, max: 80, step: 1 },
    headOffsetX: { value: initialValues.headOffsetX ?? 0, min: -150, max: 150, step: 1 },
    headOffsetY: { value: initialValues.headOffsetY ?? 0, min: -150, max: 150, step: 1 },
    bodyOffsetX: { value: initialValues.bodyOffsetX ?? 0, min: -150, max: 150, step: 1 },
    bodyOffsetY: { value: initialValues.bodyOffsetY ?? 0, min: -150, max: 150, step: 1 },
  });

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      sessionId:'debug-session',
      runId:'run-gecko',
      hypothesisId:'H4',
      location:'GeckoControls:render',
      message:'render values',
      data:{bodyCount, spriteScale, legPairGap},
      timestamp:Date.now(),
    })
  }).catch(()=>{});
  // #endregion

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        sessionId:'debug-session',
        runId:'run-gecko',
        hypothesisId:'H3',
        location:'GeckoControls:onChange',
        message:'controls change',
      data:{bodyCount, spriteScale, headScale, bodyScale, legScale, headRot, bodyRot, legRot, leg2Rot, legPairGap, bodyOffsetX, bodyOffsetY},
        timestamp:Date.now(),
      })
    }).catch(()=>{});
    // #endregion
    onChange?.({
      spriteScale,
      scales: { head: headScale, body: bodyScale, leg: legScale },
      bodySpriteCount: bodyCount,
      rotationOffsets: {
        head: headRot,
        body: bodyRot,
        leg: legRot,
        leg2: leg2Rot,
      },
      legPairGap,
      spriteOffsets: {
        head: { x: headOffsetX, y: headOffsetY },
        body: { x: bodyOffsetX, y: bodyOffsetY },
      },
    });
  }, [
    spriteScale,
    headScale,
    bodyScale,
    legScale,
    headRot,
    bodyRot,
    legRot,
    legPairGap,
    headOffsetX,
    headOffsetY,
    bodyOffsetX,
    bodyOffsetY,
  ]);

  return <Leva collapsed={false} />;
}
