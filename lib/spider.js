import { drawImageCenteredRotated } from "./centipede";

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
  const bodyGap = 10; // 두 원 사이 거리
  const abdX = headX - ux * (rHead + rAbd + bodyGap);
  const abdY = headY - uy * (rHead + rAbd + bodyGap);
  ctx.beginPath(); ctx.arc(headX, headY, rHead, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(abdX, abdY, rAbd, 0, Math.PI * 2); ctx.stroke();

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
  const anchorPoint = (idx) => {
    const thetaBase = toRad(anchorAngles[idx]);
    const dirX = ux * Math.cos(thetaBase) - vx * Math.sin(thetaBase);
    const dirY = uy * Math.cos(thetaBase) - vy * Math.sin(thetaBase);
    return { x: headX + dirX * rHead, y: headY + dirY * rHead };
  };
  const p2R = anchorPoint(3);
  const p3L = anchorPoint(4);
  const lerp = (a, b, t) => a + (b - a) * t;
  const markerX = lerp(headX, (p2R.x + p3L.x) * 0.5, 0.65);
  const markerY = lerp(headY, (p2R.y + p3L.y) * 0.5, 0.65);
  const markerR = 12;
  ctx.beginPath(); ctx.arc(markerX, markerY, markerR, 0, Math.PI * 2);
  ctx.fillStyle = "#f8f9fa";
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = "#495057";
  ctx.stroke();

  // 턱(jaw) 라인: 원 중심에서 일정 각도로 벌어졌다가 모이는 애니메이션
  const jawLen = 32;
  const jawBaseDeg = 20; // 기본 벌어진 각도(양쪽 합 기준의 절반)
  const jawAmpDeg = 10;  // 추가로 벌어지는 진폭
  const jawSpeed = 0.004; // rad/ms
  const jawPhase = Math.sin((timeMs || 0) * jawSpeed) * jawAmpDeg;
  const jawHalfAngle = toRad(jawBaseDeg + jawPhase);
  const baseAngle = Math.atan2(uy, ux); // 진행 방향 기준
  const leftJawAngle = baseAngle - jawHalfAngle;
  const rightJawAngle = baseAngle + jawHalfAngle;
  const drawJaw = (ang) => {
    const jx = markerX + Math.cos(ang) * jawLen;
    const jy = markerY + Math.sin(ang) * jawLen;
    ctx.beginPath();
    ctx.moveTo(markerX, markerY);
    ctx.lineTo(jx, jy);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#e03131";
    ctx.stroke();
  };
  drawJaw(leftJawAngle);
  drawJaw(rightJawAngle);

  for (let i = 0; i < anchorAngles.length; i++) {
    const thetaBase = toRad(anchorAngles[i]);
    // base radial direction from head center for this leg
    let dirX = ux * Math.cos(thetaBase) - vx * Math.sin(thetaBase);
    let dirY = uy * Math.cos(thetaBase) - vy * Math.sin(thetaBase);
    const axl = headX + dirX * rHead;
    const ayl = headY + dirY * rHead;

    // apply restored static joint angles
    // 상단 관절만 좌/우 그룹 교차 스윙
    const a1 = toRad(animateUpper(jointAnglesDeg.upper[i] || 0, i));
    const a2 = toRad(jointAnglesDeg.middle[i] || 0);
    const a3 = toRad(jointAnglesDeg.lower[i]  || 0);
    const a4 = toRad(jointAnglesDeg.foot[i]   || 0);

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
    const pair = Math.floor(i / 2) + 1;
    const side = i % 2 === 0 ? "L" : "R";
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


