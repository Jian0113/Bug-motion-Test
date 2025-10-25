export function drawImageCenteredRotated(ctx, img, x, y, angleRad, scale = 1) {
  if (!img) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
  ctx.restore();
}

export function drawCentipede(ctx, state, timeMs, useSprites, getSprite) {
  const n = state.segments.length;
  if (n < 2) return;
  const head = state.segments[0];
  const neck = state.segments[1];
  const hdx = head.x - neck.x;
  const hdy = head.y - neck.y;
  const hd = Math.hypot(hdx, hdy) || 1;
  const htx = hdx / hd;
  const hty = hdy / hd;
  const hnx = -hty;
  const hny = htx;

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

  // head sprite or fallback arrow
  const dx = head.x - neck.x;
  const dy = head.y - neck.y;
  const d = Math.hypot(dx, dy) || 1;
  const tx = dx / d;
  const ty = dy / d;
  const nx = -ty;
  const ny = tx;
  const headAngle = Math.atan2(ty, tx);
  const headImg = useSprites ? getSprite("centipede", "head") : null;
  if (headImg) {
    drawImageCenteredRotated(ctx, headImg, head.x, head.y, headAngle, 1.0);
  } else {
    const arrowLen = 48;
    const arrowWidth = 32;
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
  }

  // segmented legs with metachronal wave
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.0;
  const ribStep = 2;
  const ribLenHead = 168;
  const ribLenTail = 60;
  const strideMs = 900;
  const phase0 = (timeMs || 0) / strideMs * Math.PI * 2;
  for (let i = 2; i < n - 1; i += ribStep) {
    const prev = state.segments[i - 1];
    const curr = state.segments[i];
    const next = state.segments[i + 1];
    const txb = next.x - prev.x;
    const tyb = next.y - prev.y;
    const db = Math.hypot(txb, tyb) || 1;
    const nx2 = -tyb / db;
    const ny2 = txb / db;
    const ti = i / (n - 1);
    const Llin = ribLenTail + (1 - ti) * (ribLenHead - ribLenTail);
    const Lavg = (ribLenHead + ribLenTail) * 0.5;
    const sizeBlend = 0.4;
    const L = Llin * (1 - sizeBlend) + Lavg * sizeBlend;
    const cx = curr.x;
    const cy = curr.y;
    const bodyImg = useSprites ? getSprite("centipede", "body") : null;
    if (bodyImg) {
      const angle = Math.atan2(tyb, txb);
      drawImageCenteredRotated(ctx, bodyImg, cx, cy, angle, 0.75);
    } else {
      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(cx, cy, 6.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    for (const side of [-1, 1]) {
      const legPhase = phase0 + i * 0.35 + (side === 1 ? 0 : Math.PI * 0.5);
      const lift = Math.max(0, Math.sin(legPhase));
      const stride = 0.5 + 0.25 * Math.cos(legPhase);
      const kneeX = cx + nx2 * side * (L * 0.32);
      const kneeY = cy + ny2 * side * (L * 0.32) - lift * 2;
      const footX = cx + nx2 * side * (L * 0.55) + (txb / db) * (L * 0.15) * stride;
      const footY = cy + ny2 * side * (L * 0.55) + (tyb / db) * (L * 0.15) * stride - lift * 4;
      const legImg = useSprites ? getSprite("centipede", "leg") : null;
      if (legImg) {
        const ang = Math.atan2(footY - kneeY, footX - kneeX);
        const mx = (kneeX + footX) * 0.5;
        const my = (kneeY + footY) * 0.5;
        drawImageCenteredRotated(ctx, legImg, mx, my, ang, 0.9);
      } else {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(kneeX, kneeY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(kneeX, kneeY);
        ctx.lineTo(footX, footY);
        ctx.stroke();
      }
    }
  }
}


