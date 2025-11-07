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

function drawImageWithAnchor(ctx, img, x, y, angleRad, scale, anchorXPx, anchorYPx) {
  if (!img) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);
  const w = img.width * scale;
  const h = img.height * scale;
  const ax = (anchorXPx != null ? anchorXPx * scale : w * 0.5);
  const ay = (anchorYPx != null ? anchorYPx * scale : h * 0.5);
  ctx.drawImage(img, -ax, -ay, w, h);
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
  const deg2rad = (d) => (d * Math.PI) / 180;
  const getRot = (key) => (state && state.rotationOffsets && state.rotationOffsets[key]) || 0;
  const headAngle = Math.atan2(ty, tx) + deg2rad(getRot("head"));
  const headImg = useSprites ? getSprite("centipede", "head") : null;
  if (headImg) {
    const headScale = (state.scales && state.scales.head != null) ? state.scales.head : 1.0;
    drawImageCenteredRotated(ctx, headImg, head.x, head.y, headAngle, headScale);
  } else if (useSprites) {
    // placeholder rectangle for head sprite position
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(headAngle);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.strokeRect(-24, -16, 48, 32);
    ctx.restore();
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
  // head label: show coordinates near head
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "12px ui-monospace,monospace";
  ctx.textBaseline = "bottom";
  const label = `Head (${Math.round(head.x)}, ${Math.round(head.y)})`;
  ctx.fillText(label, head.x + 12, head.y - 12);
  ctx.restore();

  // segmented legs with metachronal wave
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.0;
  const ribStep = 2;
  const ribLenHead = 168;
  const ribLenTail = 60;
  const strideMs = 900;
  const phase0 = (timeMs || 0) / strideMs * Math.PI * 2;
  let pairIndex = 0; // alternate leg color per rib pair (green/pink)
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
    const angle = Math.atan2(tyb, txb);
    const angleWithOffset = angle + deg2rad(getRot("body"));
    // choose alternating body halves: odd -> Left/Right, even -> Left_2/Right_2
    const isOdd = (i % 2) === 1;
    const bodyLeftKey = isOdd ? "bodyLeft" : "bodyLeft2";
    const bodyRightKey = isOdd ? "bodyRight" : "bodyRight2";
    const bodyLeftImg = useSprites ? getSprite("centipede", bodyLeftKey) : null;
    const bodyRightImg = useSprites ? getSprite("centipede", bodyRightKey) : null;
    const genericBodyImg = useSprites ? getSprite("centipede", "body") : null;
    const bodyScaleBase = (state.scales && state.scales.body != null) ? state.scales.body : 0.375;
    const tSeg = i / (n - 1); // 0: head, 1: tail
    const taper = 1 - 0.5 * tSeg; // tail -> 0.5x
    const bodyScale = bodyScaleBase * taper;
    for (const side of [-1, 1]) {
      const legPhase = phase0 + i * 0.35 + (side === 1 ? 0 : Math.PI * 0.5);
      const lift = Math.max(0, Math.sin(legPhase));
      const stride = 0.5 + 0.25 * Math.cos(legPhase);
      const spread = (state.legSpread != null ? state.legSpread : 1.0);
      const kneeX = cx + nx2 * side * (L * 0.32 * spread);
      const kneeY = cy + ny2 * side * (L * 0.32 * spread) - lift * 2;
      const footX = cx + nx2 * side * (L * 0.55 * spread) + (txb / db) * (L * 0.15) * stride;
      const footY = cy + ny2 * side * (L * 0.55 * spread) + (tyb / db) * (L * 0.15) * stride - lift * 4;
      const usePink = (pairIndex % 2) === 1;
      const legLeftImg = useSprites ? (getSprite("centipede", usePink ? "legLeft2" : "legLeft")) : null;
      const legRightImg = useSprites ? (getSprite("centipede", usePink ? "legRight2" : "legRight")) : null;
      const legGenericImg = useSprites ? getSprite("centipede", "leg") : null;
      const ang = Math.atan2(footY - kneeY, footX - kneeX) + deg2rad(getRot(side === -1 ? "legLeft" : "legRight"));
      const midX = (kneeX + footX) * 0.5;
      const midY = (kneeY + footY) * 0.5;
      // pick anchor point
      const anchorMode = state.legAnchor || "knee"; // "mid" | "knee" | "foot"
      let ax = anchorMode === "knee" ? kneeX : anchorMode === "foot" ? footX : midX;
      let ay = anchorMode === "knee" ? kneeY : anchorMode === "foot" ? footY : midY;
      // along-bone shift
      const ux = Math.cos(ang), uy = Math.sin(ang);
      const alongShift = state.legAnchorShift || 0;
      ax += ux * alongShift;
      ay += uy * alongShift;
      // pair-gap shift (perpendicular to bone, away from body, opposite on sides)
      const pairGap = state.legPairGap || 0;
      ax += nx2 * side * pairGap;
      ay += ny2 * side * pairGap;
      const legImg = side === -1 ? (legLeftImg || legGenericImg) : (legRightImg || legGenericImg);
      const legScaleBase = (state.scales && state.scales.leg != null) ? state.scales.leg : 0.45;
      const legScale = legScaleBase * taper;
      if (legImg) {
        // image-anchored pivot (percent from top-left)
        const apct = side === -1 ? (state.legAnchorLeftPct || { x: 0.87, y: 0.27 }) : (state.legAnchorRightPct || { x: 0.15, y: 0.27 });
        const anchorXPx = (apct.x != null ? apct.x : 0.5) * legImg.width;
        const anchorYPx = (apct.y != null ? apct.y : 0.5) * legImg.height;
        drawImageWithAnchor(ctx, legImg, ax, ay, ang, legScale, anchorXPx, anchorYPx);
      } else if (useSprites) {
        // placeholder rectangle for leg sprite position
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(ang);
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-4, -1, 8, 2);
        ctx.restore();
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
    // draw body AFTER legs so legs appear underneath visually
    if (bodyLeftImg || bodyRightImg) {
      if (bodyLeftImg) drawImageCenteredRotated(ctx, bodyLeftImg, cx, cy, angleWithOffset + deg2rad(getRot(bodyLeftKey)), bodyScale);
      if (bodyRightImg) drawImageCenteredRotated(ctx, bodyRightImg, cx, cy, angleWithOffset + deg2rad(getRot(bodyRightKey)), bodyScale);
    } else if (genericBodyImg) {
      drawImageCenteredRotated(ctx, genericBodyImg, cx, cy, angleWithOffset, bodyScale);
    } else if (useSprites) {
      // placeholder rectangle for body sprite position
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleWithOffset);
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-5, -3, 10, 6);
      ctx.restore();
    } else {
      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(cx, cy, 6.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    pairIndex++;
  }
}


