import { drawImageCenteredRotated } from "./centipede";

export function drawSpider(ctx, state, timeMs, getSprite) {
  const n = state.segments.length;
  if (n < 3) return;
  const config = state.spiderConfig || {};
  const scaleClamp = (v, def = 1) => {
    const num = Number.isFinite(v) ? v : def;
    return Math.max(0.05, Math.min(num, 5));
  };
  const headScaleCfg = scaleClamp(config.headScale, 1);
  const bodyScaleCfg = scaleClamp(config.bodyScale, 1);
  const jawScaleCfg = scaleClamp(config.jawScale, 1.0);
  const legScaleCfg = scaleClamp(config.legScale, 1.0);
  const headRotDeg = config.headRot ?? 90;
  const bodyRotDeg = config.bodyRot ?? 90;
  const jawRotDeg = config.jawRot ?? 90;
  const headOffset = config.headOffset || { x: 0, y: 0 };
  const bodyOffset = config.bodyOffset || { x: 0, y: 0 };
  const jawOffset = config.jawOffset || { x: 0, y: 0 };
  const legOffset = config.legOffset || { x: 0, y: 0 };
  const legRots = config.legRots || { 1: -57, 2: 59, 3: 97, 4: 0 };
  const bodyGapCfg = Number.isFinite(config.bodyGap) ? config.bodyGap : 57;   // 몸통-꼬리 거리
  const legAttachCfg = scaleClamp(config.legAttach, 1.37);                    // 다리 부착 반경 스케일(몸통 기준)
  const jawLenCfg = Number.isFinite(config.jawLen) ? config.jawLen : 200;     // 턱 길이
  const headGapCfg = Number.isFinite(config.headGap) ? config.headGap : 35;   // 몸통-머리 거리
  const jawHeadGapCfg = Number.isFinite(config.jawHeadGap) ? config.jawHeadGap : 0; // 턱 기준점 보정
  const jawSpreadDegCfg = Number.isFinite(config.jawSpreadDeg) ? config.jawSpreadDeg : 20; // 턱 벌어짐 기본각
  const jawAnchorGapCfg = Number.isFinite(config.jawAnchorGap) ? config.jawAnchorGap : 0; // 턱 좌우 앵커 간격
  const jawAnchorHeadGapCfg = Number.isFinite(config.jawAnchorHeadGap) ? config.jawAnchorHeadGap : 0; // 턱 앵커와 머리 사이 거리
  const legSwingAmpDegCfg = Number.isFinite(config.legSwingAmpDeg) ? config.legSwingAmpDeg : 14;
  const legSwingSpeedCfg = Number.isFinite(config.legSwingSpeed) ? config.legSwingSpeed : 0.004;
  const legAnchorOffsets = config.legAnchorOffsets || { 1: 0, 2: 0, 3: 0, 4: 0 };
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

  // Anatomy naming: tail(가장 큼) - body(다리 부착) - head(가장 작음)
  const rHead = 18;  // smallest
  const rBody = 42;  // mid (legs attach here)
  const rTail = 120; // largest

  // body follows chain head; tail follows behind body; head in front of body
  const bodyX = cx + (bodyOffset.x || 0);
  const bodyY = cy + (bodyOffset.y || 0);
  const bodyGap = bodyGapCfg; // body-tail gap
  const tailX = bodyX - ux * (rBody + rTail + bodyGap);
  const tailY = bodyY - uy * (rBody + rTail + bodyGap);
  const headGap = headGapCfg; // body-head gap
  const headX = bodyX + ux * (rBody + rHead + headGap) + (headOffset.x || 0);
  const headY = bodyY + uy * (rBody + rHead + headGap) + (headOffset.y || 0);

  const HEAD_SCALE = headScaleCfg;
  const BODY_SCALE = bodyScaleCfg;
  const headSprite = getSprite?.("spider", "head");
  const bodySprite = getSprite?.("spider", "body");
  const tailSprite = getSprite?.("spider", "tail"); // optional future

  // tail
  if (tailSprite) {
    drawImageCenteredRotated(ctx, tailSprite, tailX, tailY, angle + (bodyRotDeg * Math.PI) / 180, BODY_SCALE);
  } else {
    ctx.beginPath(); ctx.arc(tailX, tailY, rTail, 0, Math.PI * 2); ctx.stroke();
  }
  // body (legs attach)
  if (bodySprite) {
    drawImageCenteredRotated(ctx, bodySprite, bodyX, bodyY, angle + (bodyRotDeg * Math.PI) / 180, BODY_SCALE);
  } else {
    ctx.beginPath(); ctx.arc(bodyX, bodyY, rBody, 0, Math.PI * 2); ctx.stroke();
  }
  // head (smallest)
  if (headSprite) {
    drawImageCenteredRotated(ctx, headSprite, headX, headY, angle + (headRotDeg * Math.PI) / 180, HEAD_SCALE);
  } else {
    ctx.beginPath(); ctx.arc(headX, headY, rHead, 0, Math.PI * 2); ctx.stroke();
  }

  // remove square palps per request

  // legs: 8 radial legs from cephalothorax rim (4 segments per leg)
  const anchorAngles = [-120, -90, -60, -30, 30, 60, 90, 120]; // degrees from forward(+ux)
  const upperLens  = [5, 5, 5, 10, 10, 5, 5, 5];  // segment 1
  const middleLens = [60, 50, 50, 50, 50, 50, 50, 60];  // segment 2
  const lowerLens  = [100, 60, 70, 70, 70, 70, 60, 100];  // segment 3
  const footLens   = [10, 10, 10, 10, 10, 10, 10, 10];  // segment 4
  const jointColors = {
    upper: "#ff6b6b",  // 어깨
    middle: "#4dabf7", // 무릎1
    lower: "#ffd43b",  // 무릎2
  };
  const drawLabeledJoint = (x, y, color, label) => {
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill(); ctx.stroke();
    ctx.save();
    ctx.fillStyle = "#e9ecef";
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + 8, y);
    ctx.restore();
  };

  // static joint angles (pre-"움직이게 해봐" 상태)
  const jointAnglesDeg = {
    upper:  [0, 0, 0, 0, 0, 0, 0, 0],
    middle: [0, 0, 0, -25, 25, 0, 0, 0],
    lower:  [25, 25, 20, 30, -30, -20, -25, -25],
    foot:   [0, 0, 0, 0, 0, 0, 0, 0],
  };
  // 상단 관절 전진 스윙(좌우 교차) – 다른 관절/모션에는 영향 없음
  const swingAmpDeg = 16;
  const swingSpeed = 0.0035; // rad/ms
  const phaseOffset = Math.PI; // 좌/우 반대 위상
  const isLeftLeg = (idx) => idx % 2 === 0; // 0,2,4,6 => L (1_L,2_L,3_L,4_L)
  const swingPhase = (timeMs || 0) * swingSpeed;
  const animateUpper = (baseDeg, idx) => {
    const phase = isLeftLeg(idx) ? swingPhase : swingPhase + phaseOffset;
    return baseDeg + swingAmpDeg * Math.sin(phase);
  };

  const toRad = (deg) => (deg * Math.PI) / 180;
  const rot = (x, y, a) => {
    const ca = Math.cos(a), sa = Math.sin(a);
    return [x * ca - y * sa, x * sa + y * ca];
  };

  // 머리 표시: 2_R(idx=3)과 3_L(idx=4) 사이에 위치한 보조 원
  // leg attach: from body
  const anchorPoint = (idx) => {
    const thetaBase = toRad(anchorAngles[idx]);
    const dirX = ux * Math.cos(thetaBase) - vx * Math.sin(thetaBase);
    const dirY = uy * Math.cos(thetaBase) - vy * Math.sin(thetaBase);
    const attachR = rBody * legAttachCfg;
    return { x: bodyX + dirX * attachR, y: bodyY + dirY * attachR };
  };
  const p2R = anchorPoint(3);
  const p3L = anchorPoint(4);
  const lerp = (a, b, t) => a + (b - a) * t;
  let markerX = lerp(headX, (p2R.x + p3L.x) * 0.5, 0.65);
  let markerY = lerp(headY, (p2R.y + p3L.y) * 0.5, 0.65);
  markerX += ux * (jawHeadGapCfg + jawAnchorHeadGapCfg);
  markerY += uy * (jawHeadGapCfg + jawAnchorHeadGapCfg);
  const markerR = 12;
  ctx.beginPath(); ctx.arc(markerX, markerY, markerR, 0, Math.PI * 2);
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = "#495057";
  ctx.stroke();

  // 턱(jaw) 라인: 원 중심에서 일정 각도로 벌어졌다가 모이는 애니메이션
  const jawLen = jawLenCfg;
  const jawBaseDeg = jawSpreadDegCfg; // 기본 벌어진 각도(양쪽 합 기준의 절반)
  const jawAmpDeg = 10;  // 추가로 벌어지는 진폭
  const jawSpeed = 0.004; // rad/ms
  const jawPhase = Math.sin((timeMs || 0) * jawSpeed) * jawAmpDeg;
  const jawHalfAngle = toRad(jawBaseDeg + jawPhase);
  const baseAngle = Math.atan2(uy, ux); // 진행 방향 기준
  const leftJawAngle = baseAngle - jawHalfAngle;
  const rightJawAngle = baseAngle + jawHalfAngle;
  const jawSprite1 = getSprite?.("spider", "jaw1");
  const jawSprite2 = getSprite?.("spider", "jaw2");
  const JAW_SCALE = jawScaleCfg;
  const drawJaw = (ang, label, sprite, side) => {
    const px = -uy, py = ux; // perpendicular to heading
    const mX = markerX + (jawOffset.x || 0) + px * jawAnchorGapCfg * side;
    const mY = markerY + (jawOffset.y || 0) + py * jawAnchorGapCfg * side;
    const jx = mX + Math.cos(ang) * jawLen;
    const jy = mY + Math.sin(ang) * jawLen;
    if (sprite) {
      drawImageCenteredRotated(ctx, sprite, mX, mY, ang + (jawRotDeg * Math.PI) / 180, JAW_SCALE);
    } else {
      ctx.beginPath();
      ctx.moveTo(mX, mY);
      ctx.lineTo(jx, jy);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#e03131";
      ctx.stroke();
    }
    // jaw label
    ctx.save();
    ctx.fillStyle = "#ffe066";
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textBaseline = "middle";
    ctx.fillText(label, jx, jy);
    ctx.restore();
  };
  drawJaw(leftJawAngle, "j1", jawSprite1, -1);
  drawJaw(rightJawAngle, "j2", jawSprite2, 1);

  const legSprites = [
    getSprite?.("spider", "leg1L"),
    getSprite?.("spider", "leg1R"),
    getSprite?.("spider", "leg2L"),
    getSprite?.("spider", "leg2R"),
    getSprite?.("spider", "leg3L"),
    getSprite?.("spider", "leg3R"),
    getSprite?.("spider", "leg4L"),
    getSprite?.("spider", "leg4R"),
  ];

  const swingPhaseBase = (timeMs || 0) * legSwingSpeedCfg;
  for (let i = 0; i < anchorAngles.length; i++) {
    const pairIdx = Math.floor(i / 2) + 1;
    const thetaBase = toRad(anchorAngles[i] + (legAnchorOffsets[pairIdx] || 0));
    // base radial direction from head center for this leg
    let dirX = ux * Math.cos(thetaBase) - vx * Math.sin(thetaBase);
    let dirY = uy * Math.cos(thetaBase) - vy * Math.sin(thetaBase);
    // 다리는 몸통 둘레(rBody)를 기준으로 부착해야 퍼집니다. rHead를 쓰면 중심에 몰립니다.
    const attachR = rBody * legAttachCfg;
    const axlBase = bodyX + dirX * attachR;
    const aylBase = bodyY + dirY * attachR;
    const axl = axlBase + (legOffset.x || 0);
    const ayl = aylBase + (legOffset.y || 0);
    const baseTheta = Math.atan2(dirY, dirX);

    // apply restored static joint angles + swing
    const legPhaseOffset = (i % 2 === 0 ? 0 : Math.PI) + (Math.floor(i / 2) * 0.8); // 좌우 교차 + 페어별 위상
    const swing = legSwingAmpDegCfg * Math.sin(swingPhaseBase + legPhaseOffset);
    const a1 = toRad((jointAnglesDeg.upper[i] || 0) + swing);
    const a2 = toRad((jointAnglesDeg.middle[i] || 0) + swing * 0.6);
    const a3 = toRad((jointAnglesDeg.lower[i]  || 0) + swing * 0.4);
    const a4 = toRad(jointAnglesDeg.foot[i]   || 0);

    // sprite 우선 적용 (있으면 선/관절 생략)
    const pair = Math.floor(i / 2) + 1;
    const side = i % 2 === 0 ? "L" : "R";
    const legSprite = legSprites[i];
    const legRotDeg = legRots[pair] ?? 0;
    if (legSprite) {
      const spriteAngleRad = baseTheta + toRad(legRotDeg + swing);
      drawImageCenteredRotated(ctx, legSprite, axl, ayl, spriteAngleRad, legScaleCfg);
      continue;
    }

    // segment 1
    [dirX, dirY] = rot(dirX, dirY, a1);
    const knee1X = axl + dirX * upperLens[i];
    const knee1Y = ayl + dirY * upperLens[i];
    // segment 2
    [dirX, dirY] = rot(dirX, dirY, a2);
    const knee2X = knee1X + dirX * middleLens[i];
    const knee2Y = knee1Y + dirY * middleLens[i];
    // segment 3
    [dirX, dirY] = rot(dirX, dirY, a3);
    const knee3X = knee2X + dirX * lowerLens[i];
    const knee3Y = knee2Y + dirY * lowerLens[i];
    // segment 4
    [dirX, dirY] = rot(dirX, dirY, a4);
    const footX  = knee3X + dirX * footLens[i];
    const footY  = knee3Y + dirY * footLens[i];

    // draw segments
    ctx.beginPath(); ctx.moveTo(axl, ayl); ctx.lineTo(knee1X, knee1Y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(knee1X, knee1Y); ctx.lineTo(knee2X, knee2Y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(knee2X, knee2Y); ctx.lineTo(knee3X, knee3Y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(knee3X, knee3Y); ctx.lineTo(footX, footY); ctx.stroke();

    // joint circles (knees/ankle)
    // joint circles (fill+stroke) + 넘버링 (1_L, 1_R ...)
    const label = `${pair}_${side}`;
    drawLabeledJoint(knee1X, knee1Y, jointColors.upper, label);
    drawLabeledJoint(knee2X, knee2Y, jointColors.middle, label);
    drawLabeledJoint(knee3X, knee3Y, jointColors.lower, label);
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


