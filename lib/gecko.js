import { geckoParams } from "@/lib/params/gecko_move";

function drawImageCenteredRotated(ctx, img, x, y, angleRad, scale = 1) {
  if (!img) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
  ctx.restore();
}

export function drawGecko(ctx, state, timeMs, useSprites = false, getSprite = () => null) {
  const n = state.segments.length;
  if (n < 2) return;
  ctx.strokeStyle = "rgba(255,255,255,0.2)"; // skeleton guide with 20% opacity
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
  // fallback head arrow if no sprite
  const arrowLen = 20, arrowWidth = 14;
  if (!useSprites || !getSprite("gecko", "head")) {
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
  if (useSprites) {
    const headImg = getSprite("gecko", "head");
    const headScale = state.scales?.head ?? 0.08;
    const headRot = (state.rotationOffsets?.head ?? 0) * Math.PI/180;
    const headOff = state.spriteOffsets?.head || { x: 0, y: 0 };
    if (headImg) drawImageCenteredRotated(ctx, headImg, head.x + headOff.x, head.y + headOff.y, Math.atan2(ty, tx) + headRot, headScale);
  }

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

    const pairGap = state.legPairGap ?? 0;
    const pairOffset = (p - 1.5) * pairGap; // 다리쌍 간 전후 간격 조절

    const updateLeg = (leg, weight, sideSign) => {
      if (!leg.planted) {
        leg.phase += 0.12;
        const gap = state.legPairGap ?? 0;
        const targetX = base.x + nx2 * sideSign * lateral + fwdx * (forwardBase + forwardExtra * weight + pairOffset);
        const targetY = base.y + ny2 * sideSign * lateral + fwdy * (forwardBase + forwardExtra * weight + pairOffset) + gap * sideSign;
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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        sessionId:'debug-session',
        runId:'run-gecko',
        hypothesisId:'H5',
        location:'lib/gecko.js:legPairGap',
        message:'leg pair gap update',
        data:{p, gap: state.legPairGap, pairOffset, baseY: base.y, ny2, fwdy, legLFoot: legL?.foot, legRFoot: legR?.foot},
        timestamp: Date.now(),
      })
    }).catch(()=>{});
    // #endregion

    const drawLeg = (leg, sideSign) => {
      const knee = solveKnee(base, leg.foot, nx2 * sideSign, ny2 * sideSign);
      // fallback bones
      ctx.strokeStyle = "rgba(255,255,255,0)";
      ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(knee.x, knee.y); ctx.stroke();
      ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(knee.x, knee.y); ctx.lineTo(leg.foot.x, leg.foot.y); ctx.stroke();
      // leg sprite mid
      if (useSprites) {
        const leg1Img = getSprite("gecko", "leg1") || getSprite("gecko", "leg");
        const leg2Img = getSprite("gecko", "leg2") || null; // 발과 가까운 하부 마디
        const rotOff = (state.rotationOffsets?.leg ?? 0) * Math.PI/180;
        const rotOff2 = (state.rotationOffsets?.leg2 ?? state.rotationOffsets?.leg ?? 0) * Math.PI/180;
        const legScale = state.scales?.leg ?? 0.06;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            sessionId:'debug-session',
            runId:'run-gecko',
            hypothesisId:'H8',
            location:'lib/gecko.js:leg-rot',
            message:'leg rotations applied',
            data:{rotOff: rotOff * 180/Math.PI, rotOff2: rotOff2 * 180/Math.PI, hasLeg1: !!leg1Img, hasLeg2: !!leg2Img},
            timestamp: Date.now(),
          })
        }).catch(()=>{});
        // #endregion
        if (leg1Img) {
          const mid1X = (base.x + knee.x) * 0.5;
          const mid1Y = (base.y + knee.y) * 0.5;
          const ang1 = Math.atan2(knee.y - base.y, knee.x - base.x) + rotOff;
          drawImageCenteredRotated(ctx, leg1Img, mid1X, mid1Y, ang1, legScale);
        }
        if (leg2Img) {
          const mid2X = (knee.x + leg.foot.x) * 0.5;
          const mid2Y = (knee.y + leg.foot.y) * 0.5;
          const ang2 = Math.atan2(leg.foot.y - knee.y, leg.foot.x - knee.x) + rotOff2;
          const segLen = Math.hypot(leg.foot.x - knee.x, leg.foot.y - knee.y) || 1;
          const baseLen = legLenLower || 1;
          const scale2 = legScale * Math.max(0.5, Math.min(2.5, segLen / baseLen));
          drawImageCenteredRotated(ctx, leg2Img, mid2X, mid2Y, ang2, scale2);
        }
      }
      // guides: base/knee/foot
      if (state.debugGuides) {
        const dot = (x,y,c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2); ctx.fill(); };
        dot(base.x, base.y, "#34d399");
        dot(knee.x, knee.y, "#fbbf24");
        dot(leg.foot.x, leg.foot.y, "#f87171");
      }
    };
    drawLeg(legL, +1); drawLeg(legR, -1);
  }

  // body sprite chain (alternating frames)
  if (useSprites) {
    const framesRaw = getSprite("gecko", "bodyFrames");
    const baseImg = getSprite("gecko", "body");
    const frames = Array.isArray(framesRaw) ? framesRaw.filter(Boolean) : [];
    if (baseImg && frames.length === 0) frames.push(baseImg);
    const count = Math.max(2, Math.floor(state.bodySpriteCount || 6));
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        sessionId:'debug-session',
        runId:'run-gecko',
        hypothesisId:'H1',
        location:'lib/gecko.js:body-sprite-chain',
        message:'body chain params',
        data:{useSprites, framesLen: frames.length, baseImg: !!baseImg, count, n, bodyScale: state.scales?.body},
        timestamp:Date.now(),
      })
    }).catch(()=>{});
    // #endregion
    if (frames.length) {
      const bodyScale = state.scales?.body ?? 0.07;
      const bodyOff = state.spriteOffsets?.body || { x: 0, y: 0 };
      for (let i = 0; i < count; i++) {
        const t = (i + 1) / (count + 1); // spread along body
        const idx = Math.min(n - 2, Math.max(1, Math.floor(t * (n - 1))));
        const prev = state.segments[Math.max(0, idx - 1)];
        const curr = state.segments[idx];
        if (!curr || !prev) continue;
        const ang = Math.atan2(curr.y - prev.y, curr.x - prev.x) + (state.rotationOffsets?.body ?? 0) * Math.PI/180;
        const frame = frames[i % frames.length];
        if (frame) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
              sessionId:'debug-session',
              runId:'run-gecko',
              hypothesisId:'H1',
              location:'lib/gecko.js:body-sprite-draw',
              message:'draw body frame',
              data:{i, idx, frameIndex: i % frames.length, x: curr.x, y: curr.y, ang, bodyScale},
              timestamp:Date.now(),
            })
          }).catch(()=>{});
          // #endregion
          drawImageCenteredRotated(ctx, frame, curr.x + bodyOff.x, curr.y + bodyOff.y, ang, bodyScale);
        }
      }
    }
  }
  if (state.debugGuides) {
    ctx.save();
    ctx.fillStyle = "rgba(56,189,248,0.9)";
    ctx.font = "11px ui-monospace,monospace";
    ctx.fillText("HEAD SPRITE", head.x + 10, head.y - 10);
    const mid = state.segments[Math.floor(n * 0.5)];
    if (mid) ctx.fillText("BODY SPRITE", mid.x + 10, mid.y - 10);
    ctx.restore();
  }
}
