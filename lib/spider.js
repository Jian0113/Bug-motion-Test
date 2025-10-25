import { drawImageCenteredRotated } from "./centipede";
import { spiderParams } from "@/lib/params/spider_move";

export function drawSpider(ctx, state, timeMs, getSprite) {
  const n = state.segments.length;
  if (n < 3) return;
  // cephalothorax(머리가슴)이 체인의 head를 따라가도록 함
  const h0 = state.segments[0];
  const h1 = state.segments[1];
  const cx = h0.x;
  const cy = h0.y;
  const ax = h0.x - h1.x;
  const ay = h0.y - h1.y;
  const ad = Math.hypot(ax, ay) || 1;
  const ux = ax / ad, uy = ay / ad; // 진행 방향(머리→꼬리 반대)
  const vx = -uy, vy = ux;
  const angle = Math.atan2(uy, ux);

  // schematic line drawing based on reference (ignore sprites)
  const stroke = "#9aa0a6";
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.4;
  ctx.lineJoin = "miter";
  ctx.lineCap = "square";

  // body: 1) cephalothorax(small), 2) abdomen(large). 1이 마우스를 따라옴
  const rHead = 36; // cephalothorax 반경
  const rAbd = 90;  // abdomen 반경
  const headX = cx; const headY = cy;
  const bodyGap = 20; // 두 원 사이 거리
  const abdX = headX - ux * (rHead + rAbd + bodyGap);
  const abdY = headY - uy * (rHead + rAbd + bodyGap);
  ctx.beginPath(); ctx.arc(headX, headY, rHead, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(abdX, abdY, rAbd, 0, Math.PI * 2); ctx.stroke();

  // palps/antenna as small rectangles on head top
  const boxW = 10, boxH = 18, palpGap = 8;
  const topX = headX + ux * rHead;
  const topY = headY + uy * rHead;
  const drawBox = (offset) => {
    const bx = topX + vx * offset;
    const by = topY + vy * offset;
    ctx.save();
    ctx.translate(bx, by); ctx.rotate(angle);
    ctx.strokeRect(-boxW/2, -boxH, boxW, boxH);
    ctx.restore();
  };
  drawBox(-palpGap/2 - boxW/2); drawBox(palpGap/2 + boxW/2);

  // legs: 4 pairs, straight segments with sharp angles
  // legs: attach to cephalothorax rim, splayed around (±70°, ±30°)
  const anchorAngles = [-70, -30, 30, 70]; // degrees from forward(+ux)
  const upperLens = [120, 95, 90, 125];
  const lowerLens = [110, 85, 80, 115];
  const bendAlong = [26, 18, 18, 28]; // tangent offset
  const toRad = (deg) => (deg * Math.PI) / 180;
  for (let i = 0; i < anchorAngles.length; i++) {
    for (const side of [-1, 1]) {
      const theta = toRad(anchorAngles[i]) * side; // 좌/우 대칭
      // anchor point on head circle at angle theta
      const dirX = ux * Math.cos(theta) - vx * Math.sin(theta);
      const dirY = uy * Math.cos(theta) - vy * Math.sin(theta);
      const axl = headX + dirX * rHead;
      const ayl = headY + dirY * rHead;
      // outward direction is roughly perpendicular from head center
      const odx = dirX; const ody = dirY;
      const tdx = -dirY; const tdy = dirX; // local tangent
      const kneeX = axl + odx * upperLens[i] + tdx * bendAlong[i];
      const kneeY = ayl + ody * upperLens[i] + tdy * bendAlong[i];
      const footX = kneeX + odx * lowerLens[i] + tdx * bendAlong[i] * 0.3;
      const footY = kneeY + ody * lowerLens[i] + tdy * bendAlong[i] * 0.3;
      ctx.beginPath(); ctx.moveTo(axl, ayl); ctx.lineTo(kneeX, kneeY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(kneeX, kneeY); ctx.lineTo(footX, footY); ctx.stroke();
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


