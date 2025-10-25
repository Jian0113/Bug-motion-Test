import { geckoParams } from "@/lib/params/gecko_move";
export function drawGecko(ctx, state, timeMs) {
  const n = state.segments.length;
  if (n < 2) return;
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2.0;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(state.segments[0].x, state.segments[0].y);
  for (let i = 1; i < n; i++) {
    const p = state.segments[i];
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  const head = state.segments[0];
  const neck = state.segments[1];
  const dx = head.x - neck.x;
  const dy = head.y - neck.y;
  const d = Math.hypot(dx, dy) || 1;
  const tx = dx / d;
  const ty = dy / d;
  const nx = -ty;
  const ny = tx;
  const arrowLen = 20;
  const arrowWidth = 14;
  const leftX = head.x - tx * arrowLen + nx * (arrowWidth * 0.5);
  const leftY = head.y - ty * arrowLen + ny * (arrowWidth * 0.5);
  const rightX = head.x - tx * arrowLen - nx * (arrowWidth * 0.5);
  const rightY = head.y - ty * arrowLen - ny * (arrowWidth * 0.5);
  ctx.beginPath();
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(leftX, leftY);
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(rightX, rightY);
  ctx.stroke();

  // draw + update legs if present
  if (!state.gecko || !state.gecko.legs) return;
  const nowMs = (timeMs || 0);
  ctx.strokeStyle = "#e2e8f0";
  const { legLenUpper, legLenLower, cycleMs, minPlantMs, liftHeight } = geckoParams;

  const phase01 = (nowMs % cycleMs) / cycleMs;
  const leftLead = phase01 < 0.5;
  const phaseHalf = leftLead ? (phase01 / 0.5) : ((phase01 - 0.5) / 0.5);
  const windowWHalf = (s, e, t) => (t >= s && t < e ? 1 : 0);
  const baseA = windowWHalf(0.00, 0.25, phaseHalf) * 1.0;
  const baseB = windowWHalf(0.25, 0.35, phaseHalf) * 0.55;
  const baseC = windowWHalf(0.35, 0.45, phaseHalf) * 0.28;
  const baseD = windowWHalf(0.45, 0.50, phaseHalf) * 0.18;
  const pairWeights = leftLead
    ? [{ L: baseA, R: 0 }, { L: 0, R: baseB }, { L: baseC, R: 0 }, { L: 0, R: baseD }]
    : [{ L: 0, R: baseA }, { L: baseB, R: 0 }, { L: 0, R: baseC }, { L: baseD, R: 0 }];

  const solveKnee = (base, foot, outwardX, outwardY) => {
    const vx = foot.x - base.x;
    const vy = foot.y - base.y;
    const dist = Math.hypot(vx, vy) || 1;
    const ex = vx / dist; const ey = vy / dist;
    const L1 = legLenUpper; const L2 = legLenLower;
    const dclamp = Math.min(Math.max(dist, 1e-3), L1 + L2 - 1e-3);
    const cosA = (L1*L1 + dclamp*dclamp - L2*L2) / (2*L1*dclamp);
    const sinA = Math.sqrt(Math.max(0, 1 - cosA*cosA));
    const k1x = base.x + (ex * cosA - ey * sinA) * L1;
    const k1y = base.y + (ey * cosA + ex * sinA) * L1;
    const k2x = base.x + (ex * cosA + ey * sinA) * L1;
    const k2y = base.y + (ey * cosA - ex * sinA) * L1;
    const dot1 = (k1x - base.x) * outwardX + (k1y - base.y) * outwardY;
    const dot2 = (k2x - base.x) * outwardX + (k2y - base.y) * outwardY;
    return dot1 >= dot2 ? { x: k1x, y: k1y } : { x: k2x, y: k2y };
  };

  for (let p = 0; p < 4; p++) {
    const legL = state.gecko.legs[p*2 + 0];
    const legR = state.gecko.legs[p*2 + 1];
    if (!legL || !legR) continue;

    const i = legL.idx;
    const base = state.segments[i];
    const pPrev = state.segments[i + 1];
    const pNext = state.segments[i - 1];
    const tx2 = pPrev.x - pNext.x; const ty2 = pPrev.y - pNext.y;
    const dn = Math.hypot(tx2, ty2) || 1;
    const nx2 = -ty2 / dn; const ny2 = tx2 / dn;
    const fwdx = tx2 / dn; const fwdy = ty2 / dn;

    const w = pairWeights[p];
    const forwardBase = -6; const forwardExtra = -18; const lateral = legLenUpper * 0.95;

    const tryLift = (leg, weight) => {
      if (!leg.planted) return;
      const enoughTime = (nowMs - (leg.plantedAt || 0)) >= minPlantMs;
      if (!enoughTime || weight <= 0.05) return;
      const moved = Math.hypot(base.x - leg.lastPlantPos.x, base.y - leg.lastPlantPos.y);
      if (moved > geckoParams.stepDistance) { leg.planted = false; leg.phase = 0; }
    };
    tryLift(legL, w.L); tryLift(legR, w.R);

    const updateLeg = (leg, weight, sideSign) => {
      if (!leg.planted) {
        leg.phase += 0.12;
        const targetX = base.x + nx2 * sideSign * lateral + fwdx * (forwardBase + forwardExtra * weight);
        const targetY = base.y + ny2 * sideSign * lateral + fwdy * (forwardBase + forwardExtra * weight);
        const lift = Math.sin(Math.min(leg.phase, Math.PI)) * liftHeight * weight;
        leg.foot.x += (targetX - leg.foot.x) * 0.22;
        leg.foot.y += (targetY - leg.foot.y) * 0.22 - 0.05 * lift;
        if (leg.phase >= Math.PI) {
          leg.planted = true; leg.plantedAt = nowMs; leg.lastPlantPos = { x: leg.foot.x, y: leg.foot.y };
        }
      } else {
        leg.foot.x += (leg.lastPlantPos.x - leg.foot.x) * 0.6;
        leg.foot.y += (leg.lastPlantPos.y - leg.foot.y) * 0.6;
      }
    };
    updateLeg(legL, w.L, +1); updateLeg(legR, w.R, -1);

    const drawLeg = (leg, sideSign) => {
      const knee = solveKnee(base, leg.foot, nx2 * sideSign, ny2 * sideSign);
      ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(knee.x, knee.y); ctx.stroke();
      ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(knee.x, knee.y); ctx.lineTo(leg.foot.x, leg.foot.y); ctx.stroke();
      const toeSpread = 6; const footAngle = Math.atan2(leg.foot.y - knee.y, leg.foot.x - knee.x);
      for (let tIdx = -1; tIdx <= 1; tIdx++) {
        const angToe = footAngle + tIdx * 0.25;
        const txf = leg.foot.x + Math.cos(angToe) * toeSpread;
        const tyf = leg.foot.y + Math.sin(angToe) * toeSpread;
        ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(leg.foot.x, leg.foot.y); ctx.lineTo(txf, tyf); ctx.stroke();
      }
    };
    drawLeg(legL, +1); drawLeg(legR, -1);
  }
}


