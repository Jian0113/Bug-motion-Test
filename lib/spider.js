import { drawImageCenteredRotated } from "./centipede";
import { spiderParams } from "@/lib/params/spider_move";

export function drawSpider(ctx, state, timeMs, getSprite) {
  const n = state.segments.length;
  if (n < 4) return;
  const mid = Math.floor(n * 0.5);
  const p0 = state.segments[Math.max(1, mid - 2)];
  const p1 = state.segments[Math.min(n - 2, mid + 2)];
  const cx = state.segments[mid].x;
  const cy = state.segments[mid].y;
  const ax = p1.x - p0.x;
  const ay = p1.y - p0.y;
  const ad = Math.hypot(ax, ay) || 1;
  const ux = ax / ad;
  const uy = ay / ad;
  const vx = -uy;
  const vy = ux;
  const angle = Math.atan2(uy, ux);

  const { aRad, bRad } = spiderParams.body;
  const sBody = getSprite("spider", "body");
  if (sBody) {
    drawImageCenteredRotated(ctx, sBody, cx, cy, angle, 1.0);
  } else {
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, aRad, bRad, angle, 0, Math.PI * 2);
    ctx.stroke();
  }

  const headX = cx + ux * aRad * 0.85;
  const headY = cy + uy * aRad * 0.85;
  const sHead = getSprite("spider", "head");
  if (sHead) {
    drawImageCenteredRotated(ctx, sHead, headX, headY, angle, 1.0);
  } else {
    ctx.beginPath();
    ctx.arc(headX, headY, 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  const t = (timeMs || 0) * spiderParams.antenna.omega;
  const sway = Math.sin(t) * spiderParams.antenna.sway;
  const antLen = spiderParams.antenna.len;
  for (const s of [-1, 1]) {
    const baseX = headX + vx * s * 14;
    const baseY = headY + vy * s * 14;
    const tipX = baseX + vx * s * (antLen * 0.6) + ux * (antLen * 0.4);
    const tipY = baseY + vy * s * (antLen * 0.6) + uy * (antLen * 0.4);
    const ctrlX = baseX + vx * s * (antLen * 0.3 + 30 * sway) + ux * (antLen * 0.2);
    const ctrlY = baseY + vy * s * (antLen * 0.3 + 30 * sway) + uy * (antLen * 0.2);
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
    ctx.stroke();
  }

  const pairs = spiderParams.legs.pairs;
  const phase0 = (timeMs || 0) * spiderParams.legs.phaseOmega;
  const { upperScales, lowerScales, forwardMix, phaseOffsets, baseUpper, baseLower } = spiderParams.legs;
  for (let i = 0; i < pairs; i++) {
    const along = (i - (pairs - 1) / 2) * 0.5;
    for (const side of [-1, 1]) {
      const anchorX = cx + ux * (aRad * (0.28 + along * 0.22)) + vx * side * (bRad * 0.88);
      const anchorY = cy + uy * (aRad * (0.28 + along * 0.22)) + vy * side * (bRad * 0.88);
      const phase = phase0 + phaseOffsets[i] * Math.PI * 2 + (side === 1 ? 0 : Math.PI * 0.5);
      const lift = Math.max(0, Math.sin(phase));
      const stride = Math.cos(phase);
      const fm = forwardMix[i];
      const dirX = vx * side * (1 - fm) + ux * fm;
      const dirY = vy * side * (1 - fm) + uy * fm;
      const dd = Math.hypot(dirX, dirY) || 1;
      const odx = dirX / dd;
      const ody = dirY / dd;
      const tangentX = -ody;
      const tangentY = odx;
      const upper = baseUpper * upperScales[i];
      const lower = baseLower * lowerScales[i];
      const kneeX = anchorX + odx * (upper * 0.58) + tangentX * (26 * stride);
      const kneeY = anchorY + ody * (upper * 0.58) + tangentY * (26 * stride) - lift * 8;
      const footX = anchorX + odx * (upper + lower) + tangentX * (46 * stride);
      const footY = anchorY + ody * (upper + lower) + tangentY * (46 * stride) - lift * 14;
      const sLeg = getSprite("spider", "leg");
      if (sLeg) {
        const ang = Math.atan2(footY - kneeY, footX - kneeX);
        const mx = (kneeX + footX) * 0.5;
        const my = (kneeY + footY) * 0.5;
        drawImageCenteredRotated(ctx, sLeg, mx, my, ang, 1.0);
      } else {
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(anchorX, anchorY);
        ctx.lineTo(kneeX, kneeY);
        ctx.stroke();
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(kneeX, kneeY);
        ctx.lineTo(footX, footY);
        ctx.stroke();
      }
    }
  }
}

// legacy helper kept for compatibility if needed elsewhere
export function legAnchorIndices(total) {
  if (!total || total < 6) return [];
  const fractions = [0.18, 0.26, 0.34, 0.42, 0.50, 0.58, 0.66, 0.74];
  const maxIdx = total - 2;
  const indices = fractions.map((f) => Math.min(Math.max(Math.floor(total * f), 2), maxIdx));
  const seen = new Set();
  const result = [];
  for (const idx of indices) {
    if (!seen.has(idx)) {
      seen.add(idx);
      result.push(idx);
    }
  }
  return result;
}


