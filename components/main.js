import Head from "next/head";
import dynamic from "next/dynamic";
import { drawCentipede as drawCentipedeLib } from "@/lib/centipede";
import { drawGecko as drawGeckoLib } from "@/lib/gecko";
import { drawSpider as drawSpiderLib } from "@/lib/spider";
import { useEffect, useRef, useState } from "react";

const CentipedeControls = dynamic(() => import("@/components/controls/CentipedeControls"), { ssr: false });

export default function Main({ initialMode = "centipede", hideUI = false, spritePaths = {}, spriteRotationOffset = {}, showControls = true, zIndex = 2 } = {}) {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState(initialMode); // "centipede" | "gecko" | "spider"
  const [isReady, setIsReady] = useState(false);
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  const spritesRef = useRef({
    centipede: { head: null, body: null, leg: null },
    spider: { head: null, body: null, leg: null },
    // decoded bitmaps for faster drawImage
    bitmaps: {
      centipede: {},
      spider: {},
    },
  });
  const [spriteVersion, setSpriteVersion] = useState(0); // click to reload
  const controlsRef = useRef({
    rotationOffsets: {
      head: 90,
      body: -90,
      legLeft: -180,
      legRight: 0,
      ...(spriteRotationOffset || {}),
    },
    scales: { head: 0.08, body: 0.07, leg: 0.05 },
    legSpread: 1.0,
    legPairGap: 0,
    legAnchor: "knee",
    legAnchorShift: 2,
    legAnchorLeftPct: { x: 0.93, y: 0.27 },
    legAnchorRightPct: { x: 0.15, y: 0.27 },
  });

  // safe sprite accessor (available to all draw functions)
  const getSprite = (kind, part) => {
    const root = spritesRef.current || {};
    const bm = (root.bitmaps && root.bitmaps[kind] && root.bitmaps[kind][part]) || null;
    if (bm) return bm;
    const bucket = root[kind] || {};
    return bucket[part] || null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    try { console.log("[main] mounted, mode:", mode); } catch {}

    let animationFrameId = 0;
    let running = true;
    let lastRafLog = 0;
    const overlayShownRef = { current: false };

    // cached grid pattern for background fill (multi-level grid)
    let gridPattern = null;
    const buildGridPattern = () => {
      const minorSpacing = 20;
      const majorSpacing = minorSpacing * 4; // 80px
      const size = majorSpacing * 2; // 160px tile
      const oc = document.createElement('canvas');
      oc.width = size;
      oc.height = size;
      const g = oc.getContext('2d');
      g.clearRect(0, 0, size, size);

      // helper to draw crisp lines
      const drawLine = (x1, y1, x2, y2, color, width = 1) => {
        g.strokeStyle = color;
        g.lineWidth = width;
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke();
      };

      // minor grid lines
      for (let x = 0; x <= size; x += minorSpacing) {
        const isMajor = x % majorSpacing === 0;
        if (!isMajor) {
          drawLine(x + 0.5, 0, x + 0.5, size, "rgba(255,255,255,0.08)");
        }
      }
      for (let y = 0; y <= size; y += minorSpacing) {
        const isMajor = y % majorSpacing === 0;
        if (!isMajor) {
          drawLine(0, y + 0.5, size, y + 0.5, "rgba(255,255,255,0.08)");
        }
      }

      // major grid lines
      for (let x = 0; x <= size; x += majorSpacing) {
        drawLine(x + 0.5, 0, x + 0.5, size, "rgba(255,255,255,0.2)");
      }
      for (let y = 0; y <= size; y += majorSpacing) {
        drawLine(0, y + 0.5, size, y + 0.5, "rgba(255,255,255,0.2)");
      }

      // dots at major intersections
      const drawDot = (cx, cy, radius, color) => {
        g.fillStyle = color;
        g.beginPath();
        g.arc(cx, cy, radius, 0, Math.PI * 2);
        g.fill();
      };

      gridPattern = ctx.createPattern(oc, "repeat");
    };

    const state = {
      width: 0,
      height: 0,
      dpr: 1,
      mouse: { x: 0, y: 0 },
      mouseVX: 0,
      mouseVY: 0,
      lastMouseTs: 0,
      segments: [],
      segmentCount: 60,
      spacing: 10,
      speed: 6,
      background: "#000000",
      gecko: null,
      // head wave (perpendicular to mouse velocity) - centipede head sway
      headWaveOmega: 0.012, // rad/ms
      headWaveAmpMax: 60, // px
      headWaveSpeedScale: 180, // px per (px/ms)
      headWaveMinSpeed: 0.02, // px/ms threshold
      headWaveTailRetention: 0.98, // per segment retention for head wave
      rotationOffsets: spriteRotationOffset || {head: 180 },
    };

    const drawImageCenteredRotated = (img, x, y, angleRad, scale = 1) => {
      if (!img) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angleRad);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
      ctx.restore();
    };

    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      state.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      state.width = Math.floor(rect.width * state.dpr);
      state.height = Math.floor(rect.height * state.dpr);
      canvas.width = state.width;
      canvas.height = state.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(state.dpr, state.dpr);
    };

    const initSegments = () => {
      const cw = canvas.clientWidth || window.innerWidth;
      const ch = canvas.clientHeight || window.innerHeight;
      const startX = cw * 0.5;
      const startY = ch * 0.5;
      state.segments = Array.from({ length: state.segmentCount }, (_, i) => ({
        x: startX - i * state.spacing,
        y: startY,
      }));
      state.mouse = { x: startX, y: startY };
      // init gecko legs state (paired left/right per anchor for symmetry)
      const n = state.segmentCount;
      const anchors = [Math.floor(n * 0.18), Math.floor(n * 0.35), Math.floor(n * 0.58), Math.floor(n * 0.78)]
        .map((i) => Math.min(Math.max(i, 2), n - 2));
      const legs = [];
      const legLenUpperInit = 68;
      for (const idx of anchors) {
        const prev = state.segments[idx + 1];
        const next = state.segments[idx - 1];
        const base = state.segments[idx];
        const tx2 = prev.x - next.x;
        const ty2 = prev.y - next.y;
        const dn = Math.hypot(tx2, ty2) || 1;
        const nx2 = -ty2 / dn;
        const ny2 = tx2 / dn;
        const fx2 = tx2 / dn;
        const fy2 = ty2 / dn;
        for (const side of [1, -1]) {
          const footX = base.x + nx2 * legLenUpperInit * side + fx2 * 8;
          const footY = base.y + ny2 * legLenUpperInit * side + fy2 * 8;
          legs.push({
            idx,
            side,
            phase: 0,
            foot: { x: footX, y: footY },
            planted: true,
            plantedAt: 0,
            lastPlantPos: { x: footX, y: footY },
          });
        }
      }
      state.gecko = {
        legs,
        stepDistance: 40,
        liftHeight: 10,
        stepSpeed: 0.12,
        minPlantMs: 300,
      };
    };

    const onResize = () => {
      setCanvasSize();
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const now = performance.now();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      const dx = newX - state.mouse.x;
      const dy = newY - state.mouse.y;
      const dt = Math.max(1, now - (state.lastMouseTs || now));
      state.mouseVX = dx / dt;
      state.mouseVY = dy / dt;
      state.mouse.x = newX;
      state.mouse.y = newY;
      state.lastMouseTs = now;
    };
    let lastActiveTime = performance.now();

    const lengthenOrShorten = () => {
      const desired = state.segmentCount;
      const current = state.segments.length;
      if (current < desired) {
        const tail = state.segments[state.segments.length - 1];
        for (let i = current; i < desired; i++) {
          state.segments.push({ x: tail.x, y: tail.y });
        }
      } else if (current > desired) {
        state.segments.length = desired;
      }
    };

    const followChain = (timeMs) => {
      // head moves toward mouse with capped speed
      const head = state.segments[0];
      // compute perpendicular oscillation relative to mouse velocity
      let vx = state.mouseVX;
      let vy = state.mouseVY;
      const vmag = Math.hypot(vx, vy);
      // perpendicular unit:
      let px = 0, py = 0;
      if (vmag > 0) {
        px = -vy / vmag;
        py = vx / vmag;
      }
      // amplitude scales with speed, capped, zero if below threshold
      let amp = 0;
      if (vmag >= state.headWaveMinSpeed) {
        amp = Math.min(state.headWaveAmpMax, vmag * state.headWaveSpeedScale);
      }
      // wave is CENTIPEDE-only
      if (mode !== "centipede") {
        amp = 0;
      }
      const phase = (timeMs || 0) * state.headWaveOmega;
      const ox = px * amp * Math.sin(phase);
      const oy = py * amp * Math.sin(phase);

      // 정지 유지: 마우스가 멈추면 직전 target을 유지
      const nowTs = timeMs || performance.now();
      const moving = Math.hypot(state.mouseVX, state.mouseVY) > 0.001;
      if (moving) lastActiveTime = nowTs;
      const idle = nowTs - lastActiveTime > 120; // 120ms 이상 멈춤
      const targetX = (idle ? head.x : state.mouse.x) + ox;
      const targetY = (idle ? head.y : state.mouse.y) + oy;
      const dx = targetX - head.x;
      const dy = targetY - head.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const step = Math.min(state.speed, dist);
      head.x += (dx / dist) * step;
      head.y += (dy / dist) * step;

      // other segments maintain spacing (no lateral offsets)
      for (let i = 1; i < state.segments.length; i++) {
        const prev = state.segments[i - 1];
        const seg = state.segments[i];
        const vx = seg.x - prev.x;
        const vy = seg.y - prev.y;
        const d = Math.hypot(vx, vy) || 0.0001;
        const desiredSpacing = i === 1 ? state.spacing * 3 : state.spacing;
        const targetX = prev.x + (vx / d) * desiredSpacing;
        const targetY = prev.y + (vy / d) * desiredSpacing;
        seg.x = targetX;
        seg.y = targetY;
      }
    };

    const clear = () => {
      // 투명 캔버스로 유지하여 하단 UI가 보이도록 함
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    };

    // split-view sprite toggle flag (set inside render panes)
    let renderUseSprites = false;
    const getSprite = (kind, part) => {
      const root = spritesRef.current || {};
      const bucket = root[kind] || {};
      return bucket[part] || null;
    };

    const drawCentipede = (timeMs) => {
      drawCentipedeLib(ctx, state, timeMs, renderUseSprites, getSprite);
    };

    // ============================
    // Autopilot clone agents
    // ============================
    const bots = [];
    let lastBotsLog = 0;
    const MAX_BOTS = 48;
    let nextReproTs = performance.now() + 5000;
    try { console.log("[repro] schedule next at(ms):", Math.round(nextReproTs)); } catch {}
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const randRange = (a, b) => a + Math.random() * (b - a);
    const canvasClientSize = () => ({
      w: canvas.clientWidth || window.innerWidth,
      h: canvas.clientHeight || window.innerHeight,
    });
    const newBot = (x, y) => {
      const { w, h } = canvasClientSize();
      const bot = {
        segments: Array.from({ length: 48 }, (_, i) => ({ x: x - i * state.spacing, y })),
        spacing: state.spacing,
        speed: randRange(2.5, 5.0),
        target: { x: clamp(x + randRange(-120, 120), 48, w - 48), y: clamp(y + randRange(-120, 120), 48, h - 48) },
        lastRetarget: performance.now(),
        retargetDelay: randRange(1200, 2600),
        spawnEndTs: 0, // splitting animation end
        spawnDir: 0,   // -1(left) or +1(right)
        rotationOffsets: controlsRef.current.rotationOffsets || {},
        legSpread: controlsRef.current.legSpread || 1.0,
        legPairGap: controlsRef.current.legPairGap || 0,
        legAnchor: controlsRef.current.legAnchor || "knee",
        legAnchorShift: controlsRef.current.legAnchorShift || 2,
        legAnchorLeftPct: controlsRef.current.legAnchorLeftPct || { x: 0.93, y: 0.27 },
        legAnchorRightPct: controlsRef.current.legAnchorRightPct || { x: 0.15, y: 0.27 },
      };
      return bot;
    };
    // 생성 직후 안전 보정
    const ensureBotInBounds = (bot) => {
      const { w, h } = canvasClientSize();
      // 모든 세그먼트를 화면 내부로 이동(필요 시 동일 오프셋 적용)
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const s of bot.segments) {
        if (!isFinite(s.x) || !isFinite(s.y)) { s.x = w * 0.5; s.y = h * 0.5; }
        minX = Math.min(minX, s.x); minY = Math.min(minY, s.y);
        maxX = Math.max(maxX, s.x); maxY = Math.max(maxY, s.y);
      }
      let shiftX = 0, shiftY = 0;
      if (minX < 12) shiftX = 12 - minX;
      if (minY < 12) shiftY = 12 - minY;
      if (maxX > w - 12) shiftX = Math.min(shiftX || 0, (w - 12) - maxX);
      if (maxY > h - 12) shiftY = Math.min(shiftY || 0, (h - 12) - maxY);
      if (shiftX || shiftY) {
        for (const s of bot.segments) { s.x += shiftX; s.y += shiftY; }
      }
      bot.target.x = clamp(bot.target.x, 48, w - 48);
      bot.target.y = clamp(bot.target.y, 48, h - 48);
    };
    const cloneFromParent = (parent, side, timeMs) => {
      // side: -1(left) or +1(right)
      const head = parent.segments[0];
      const neck = parent.segments[1] || head;
      const dx = head.x - neck.x, dy = head.y - neck.y;
      const d = Math.hypot(dx, dy) || 1;
      const tx = dx / d, ty = dy / d;
      const nx = -ty, ny = tx;
      const child = {
        segments: parent.segments.map(p => ({ x: p.x, y: p.y })),
        spacing: parent.spacing,
        speed: randRange(2.5, 5.0),
        target: { x: head.x + tx * 160 + nx * side * 60, y: head.y + ty * 160 + ny * side * 60 },
        lastRetarget: timeMs || performance.now(),
        retargetDelay: randRange(900, 2100),
        spawnEndTs: (timeMs || performance.now()) + 450,
        spawnDir: side,
        rotationOffsets: controlsRef.current.rotationOffsets || {},
        legSpread: controlsRef.current.legSpread || 1.0,
        legPairGap: controlsRef.current.legPairGap || 0,
        legAnchor: controlsRef.current.legAnchor || "knee",
        legAnchorShift: controlsRef.current.legAnchorShift || 2,
        legAnchorLeftPct: controlsRef.current.legAnchorLeftPct || { x: 0.93, y: 0.27 },
        legAnchorRightPct: controlsRef.current.legAnchorRightPct || { x: 0.15, y: 0.27 },
      };
      // 초기 위치를 약간 옆으로 치우치게 시작
      child.segments[0].x += nx * side * 6;
      child.segments[0].y += ny * side * 6;
      // 초기 타겟을 화면 안으로 클램핑
      const { w, h } = canvasClientSize();
      child.target.x = clamp(child.target.x, 24, w - 24);
      child.target.y = clamp(child.target.y, 24, h - 24);
      return child;
    };
    const updateBot = (bot, timeMs) => {
      const head = bot.segments[0];
      // 주기적으로 목표 재설정
      const nowTs = timeMs || performance.now();
      const { w, h } = canvasClientSize();
      const near = Math.hypot(bot.target.x - head.x, bot.target.y - head.y) < 28;
      if (near || nowTs - bot.lastRetarget > bot.retargetDelay) {
        bot.target = {
          x: clamp(head.x + randRange(-240, 240), 24, w - 24),
          y: clamp(head.y + randRange(-240, 240), 24, h - 24),
        };
        bot.lastRetarget = nowTs;
        bot.retargetDelay = randRange(900, 2200);
      }
      // 목표로 이동
      const dx = bot.target.x - head.x;
      const dy = bot.target.y - head.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const step = Math.min(bot.speed, dist);
      head.x += (dx / dist) * step;
      head.y += (dy / dist) * step;
      // 만약 타겟과 지나치게 가까워져 정체되면 즉시 재목표
      if (dist < 2) {
        const __wh2 = canvasClientSize();
        bot.target = {
          x: clamp(head.x + randRange(-200, 200), 24, __wh2.w - 24),
          y: clamp(head.y + randRange(-200, 200), 24, __wh2.h - 24),
        };
        bot.lastRetarget = nowTs;
        bot.retargetDelay = randRange(900, 2000);
      }
      // 화면 경계 클램핑 및 튕김형 재목표 설정
      const __wh = canvasClientSize();
      const w2 = __wh.w, h2 = __wh.h;
      let clamped = false;
      if (head.x < 12) { head.x = 12; clamped = true; }
      if (head.y < 12) { head.y = 12; clamped = true; }
      if (head.x > w2 - 12) { head.x = w2 - 12; clamped = true; }
      if (head.y > h2 - 12) { head.y = h2 - 12; clamped = true; }
      if (clamped) {
        bot.target = {
          x: clamp(head.x + randRange(-180, 180), 24, w2 - 24),
          y: clamp(head.y + randRange(-180, 180), 24, h2 - 24),
        };
        bot.lastRetarget = nowTs;
        bot.retargetDelay = randRange(900, 2000);
      }
      // 스폰 분열 애니메이션: 머리 양옆으로 벌어짐
      if (bot.spawnEndTs && nowTs < bot.spawnEndTs && bot.spawnDir) {
        const neck = bot.segments[1] || head;
        const hx = head.x - neck.x, hy = head.y - neck.y;
        const hd = Math.hypot(hx, hy) || 1;
        const nx = -hy / hd, ny = (hx / hd);
        const t = 1 - Math.max(0, bot.spawnEndTs - nowTs) / 450; // 0->1
        const push = 18 * t; // 옆으로 벌어지는 양
        head.x += nx * bot.spawnDir * push;
        head.y += ny * bot.spawnDir * push;
      }
      // 체인 따라오도록 정렬
      for (let i = 1; i < bot.segments.length; i++) {
        const prev = bot.segments[i - 1];
        const seg = bot.segments[i];
        const vx = seg.x - prev.x;
        const vy = seg.y - prev.y;
        const d = Math.hypot(vx, vy) || 0.0001;
        const desiredSpacing = i === 1 ? state.spacing * 3 : state.spacing;
        seg.x = prev.x + (vx / d) * desiredSpacing;
        seg.y = prev.y + (vy / d) * desiredSpacing;
      }
    };
    const drawBot = (bot, timeMs) => {
      // 최신 컨트롤 값을 주입하여 동일 룩앤필 유지
      const botState = {
        segments: bot.segments,
        rotationOffsets: controlsRef.current.rotationOffsets || bot.rotationOffsets,
        scales: controlsRef.current.scales || { head: 0.08, body: 0.07, leg: 0.05 },
        legSpread: controlsRef.current.legSpread ?? bot.legSpread,
        legPairGap: controlsRef.current.legPairGap ?? bot.legPairGap,
        legAnchor: controlsRef.current.legAnchor ?? bot.legAnchor,
        legAnchorShift: controlsRef.current.legAnchorShift ?? bot.legAnchorShift,
        legAnchorLeftPct: controlsRef.current.legAnchorLeftPct ?? bot.legAnchorLeftPct,
        legAnchorRightPct: controlsRef.current.legAnchorRightPct ?? bot.legAnchorRightPct,
      };
      drawCentipedeLib(ctx, botState, timeMs, true, getSprite);
    };
    const onClickSpawn = (e) => {
      // 뷰포트 좌표를 캔버스 좌표로 매핑
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // 개체가 없으면 스폰, 있으면 즉시 전체 분열
      if (bots.length === 0) {
        bots.push(newBot(x, y));
        try { console.log("[bots] spawn at", { x: Math.round(x), y: Math.round(y) }, "total:", bots.length); } catch {}
      } else {
        const nowTs = performance.now();
        const before = bots.length;
        const parents = bots.splice(0, bots.length);
        for (let p of parents) {
          if (bots.length >= MAX_BOTS - 1) {
            bots.push(p);
            continue;
          }
          const c1 = cloneFromParent(p, -1, nowTs);
          const c2 = cloneFromParent(p, +1, nowTs);
          ensureBotInBounds(c1);
          ensureBotInBounds(c2);
          bots.push(c1, c2);
        }
        nextReproTs = nowTs + 5000; // 다음 자동 분열 예약
        try { console.log("[repro] manual split fired:", before, "->", bots.length, "next at(ms):", Math.round(nextReproTs)); } catch {}
      }
    };

    const drawGecko = (timeMs) => {
      drawGeckoLib(ctx, state, timeMs);
    };

    const render = (timeMs) => {
      if (!running) return;
      clear();
      lengthenOrShorten();
      followChain(timeMs);
    // 5초마다 전체 개체 분열 (N -> 2N)
    const AUTO_REPRO_ENABLED = false; // 자동 분열 비활성화 플래그
      const nowTs = timeMs || performance.now();
      if (AUTO_REPRO_ENABLED && bots.length > 0 && nowTs >= nextReproTs) {
        const before = bots.length;
        const parents = bots.splice(0, bots.length);
        for (let p of parents) {
          if (bots.length >= MAX_BOTS - 1) { // 여유 1 남기기
            bots.push(p);
            continue;
          }
          const c1 = cloneFromParent(p, -1, nowTs);
          const c2 = cloneFromParent(p, +1, nowTs);
          bots.push(c1, c2);
        }
        nextReproTs = nowTs + 5000;
        try { console.log("[repro] split fired:", before, "->", bots.length, "next at(ms):", Math.round(nextReproTs)); } catch {}
      }
      // 자동 에이전트 업데이트/렌더
      for (let i = 0; i < bots.length; i++) {
        updateBot(bots[i], timeMs);
        drawBot(bots[i], timeMs);
      }
      // 임계치(>=16) 도달 시 노이즈/ERROR 오버레이 표시 (1회 트리거)
      if (!overlayShownRef.current && bots.length >= 16) {
        overlayShownRef.current = true;
        try { console.log("[overlay] ERROR overlay shown (bots:", bots.length, ")"); } catch {}
        setShowErrorOverlay(true);
      }
      if ((timeMs || 0) - lastBotsLog > 1000) {
        lastBotsLog = timeMs || 0;
        const nowMs = timeMs || performance.now();
        const remain = Math.max(0, Math.round(nextReproTs - nowMs));
        const reason = !AUTO_REPRO_ENABLED
          ? "disabled"
          : (bots.length === 0
            ? "skip(no bots)"
            : (bots.length >= MAX_BOTS ? "skip(max cap)" : (remain > 0 ? "waiting" : "ready")));
        try {
          console.log("[bots] render count:", bots.length, "| [repro]", reason, "remain(ms):", remain, "target(ms):", Math.round(nextReproTs));
        } catch {}
      }
      // expose segments for external draw functions & body velocity estimate
      const lastSegments = canvas.__segments;
      canvas.__segments = state.segments;
      if (lastSegments && lastSegments[0] && state.segments[0]) {
        const hx = state.segments[0].x - lastSegments[0].x;
        const hy = state.segments[0].y - lastSegments[0].y;
        canvas.__headVelocity = { x: hx, y: hy };
      }
      // split view: left=line only, right=sprite view
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const mid = Math.floor(W / 2);
      // inject latest control values each frame
      state.rotationOffsets = controlsRef.current.rotationOffsets || {};
      state.scales = controlsRef.current.scales || { head: 0.1, body: 0.08, leg: 0.05 };
      state.legSpread = controlsRef.current.legSpread || 1.0;
      state.legPairGap = controlsRef.current.legPairGap || 0;
      state.legAnchor = controlsRef.current.legAnchor || "mid";
      state.legAnchorShift = controlsRef.current.legAnchorShift || 0;
      state.legAnchorLeftPct = controlsRef.current.legAnchorLeftPct || { x: 0.9, y: 0.2 };
      state.legAnchorRightPct = controlsRef.current.legAnchorRightPct || { x: 0.1, y: 0.2 };
      const renderPane = (x, w, useSprites) => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, 0, w, H);
        ctx.clip();
        // 배경/그리드 미표시: 하단 UI가 비치도록 함
        renderUseSprites = useSprites;
        if (mode === "centipede") {
          drawCentipede(timeMs);
        } else if (mode === "gecko") {
          drawGecko(timeMs);
        } else {
          drawSpider(timeMs);
        }
        ctx.restore();
      };
      // 전체 영역에 스프라이트 모드로 1회 렌더링
      renderPane(0, W, true);
      if ((timeMs || 0) - lastRafLog > 1000) {
        lastRafLog = timeMs || 0;
        try { console.log("[main] raf alive"); } catch {}
      }
      // 헤드 좌표를 외부로 브로드캐스트(뷰포트 좌표)
      if (state.segments && state.segments[0]) {
        const head = state.segments[0];
        window.dispatchEvent(new CustomEvent("centipedeHead", { detail: { x: head.x, y: head.y, t: performance.now() } }));
      }
      animationFrameId = requestAnimationFrame(render);
    };

    // init
    setCanvasSize();
    initSegments();
    setIsReady(true);

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    // 캡처 단계에서 포인터 다운을 받아 드래그 헤더 등에서의 stopPropagation 영향을 회피
    window.addEventListener("pointerdown", onClickSpawn, { passive: true, capture: true });
    try { console.log("[main] listeners attached (resize, mousemove, pointerdown-capture)"); } catch {}
    animationFrameId = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerdown", onClickSpawn, { capture: true });
    };
  }, [mode]);

  // Load sprites (allow override via spritePaths) when spriteVersion changes
  useEffect(() => {
    const loadOne = (path) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = path;
      });
    let mounted = true;
    (async () => {
      const centipedeHeadPath = spritePaths?.centipede?.head ?? "/centipede-head.png";
      const centipedeBodyPath = spritePaths?.centipede?.body ?? "/centipede-body.png";
      const centipedeLegPath = spritePaths?.centipede?.leg ?? "/centipede-leg.png";
      const spiderHeadPath = spritePaths?.spider?.head ?? "/spider-head.png";
      const spiderBodyPath = spritePaths?.spider?.body ?? "/spider-body.png";
      const spiderLegPath = spritePaths?.spider?.leg ?? "/spider-leg.png";

      const [cHead, cBody, cLeg, sHead, sBody, sLeg] = await Promise.all([
        loadOne(centipedeHeadPath),
        loadOne(centipedeBodyPath),
        loadOne(centipedeLegPath),
        loadOne(spiderHeadPath),
        loadOne(spiderBodyPath),
        loadOne(spiderLegPath),
      ]);
      if (!mounted) return;
      spritesRef.current.centipede.head = cHead;
      spritesRef.current.centipede.body = cBody;
      spritesRef.current.centipede.leg = cLeg;
      spritesRef.current.spider.head = sHead;
      spritesRef.current.spider.body = sBody;
      spritesRef.current.spider.leg = sLeg;
      // create decoded bitmaps for faster rendering (skip SVGs without intrinsic size)
      const canCreateBitmap = typeof createImageBitmap === 'function';
      const hasDims = (im) => !!(im && (im.naturalWidth > 0 && im.naturalHeight > 0));
      const makeBitmap = async (img) => {
        if (!canCreateBitmap || !img) return null;
        if (!hasDims(img)) return null; // avoid InvalidStateError for dimensionless SVG
        try {
          return await createImageBitmap(img);
        } catch (_) {
          return null;
        }
      };
      const [bcHead, bcBody, bcLeg, bsHead, bsBody, bsLeg] = await Promise.all([
        makeBitmap(cHead), makeBitmap(cBody), makeBitmap(cLeg),
        makeBitmap(sHead), makeBitmap(sBody), makeBitmap(sLeg),
      ]);
      const bm = spritesRef.current.bitmaps;
      bm.centipede.head = bcHead; bm.centipede.body = bcBody; bm.centipede.leg = bcLeg;
      bm.spider.head = bsHead; bm.spider.body = bsBody; bm.spider.leg = bsLeg;

      // load any additional centipede sprite keys (e.g., bodyLeft, bodyRight, bodyLeft2, bodyRight2, legLeft, legRight)
      const extraCentipedeEntries = Object.entries(spritePaths?.centipede || {}).filter(([k]) => !["head","body","leg"].includes(k));
      const extraLoaded = await Promise.all(
        extraCentipedeEntries.map(([, path]) => loadOne(path))
      );
      extraCentipedeEntries.forEach(([key], idx) => {
        spritesRef.current.centipede[key] = extraLoaded[idx];
      });
      // bitmaps for extra keys as well
      const extraBitmaps = await Promise.all(
        extraLoaded.map((img) => makeBitmap(img))
      );
      extraCentipedeEntries.forEach(([key], idx) => {
        spritesRef.current.bitmaps.centipede[key] = extraBitmaps[idx];
      });
    })();
    return () => {
      mounted = false;
    };
  }, [spriteVersion, spritePaths]);

  function drawSpider(timeMs) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const segments = getStateSegments();
    if (!segments || segments.length < 4) return;
    drawSpiderLib(ctx, { segments }, timeMs, getSprite);
  }

  // helpers to access latest segments safely inside drawSpider
  function getStateSegments() {
    const anyCanvas = canvasRef.current;
    return anyCanvas && anyCanvas.__segments ? anyCanvas.__segments : [];
  }
  function stateRefSegmentsLength() {
    const anyCanvas = canvasRef.current;
    return anyCanvas && anyCanvas.__segments ? anyCanvas.__segments.length : 0;
  }

  return (
    <>
      <Head>
        <title>Mouse-following Snake & Gecko</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{
        minHeight: "100vh",
        background: hideUI ? "transparent" : "#0b1020",
        color: "#cbd5e1",
        display: "flex",
        flexDirection: "column",
      }}>
        {!hideUI && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            position: "sticky",
            top: 0,
            background: "rgba(11,16,32,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1,
          }}>
            <div style={{ fontWeight: 600 }}>Cursor Arthropod Sim (Centipede / Gecko / Spider)</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { key: "centipede", label: "Centipede" },
                { key: "gecko", label: "Gecko" },
                { key: "spider", label: "Spider" },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setMode(btn.key)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: mode === btn.key ? "1px solid #60a5fa" : "1px solid rgba(255,255,255,0.14)",
                    background: mode === btn.key ? "#1e293b" : "#111827",
                    color: "#e5e7eb",
                    cursor: "pointer",
                  }}
                >
                  {btn.label}
                </button>
              ))}
              <button
                onClick={() => setSpriteVersion((v) => v + 1)}
                title="Reload sprites from /public"
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "#0f172a",
                  color: "#e5e7eb",
                  cursor: "pointer",
                }}
              >
                Reload Sprites
              </button>
            </div>
          </div>
        )}
        <div style={{ flex: 1, position: "relative" }}>
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              cursor: "none",
              position: "fixed",
              inset: 0,
              zIndex: zIndex,
              pointerEvents: "none",
            }}
          />
          {showErrorOverlay && (
            <div style={{
              position: "fixed",
              inset: 0,
              zIndex: 3,
              pointerEvents: "none",
            }}>
              <div style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, rgba(0,0,0,0) 2px 4px)," +
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, rgba(0,0,0,0) 1px 2px)," +
                  "radial-gradient(ellipse at center, rgba(255,0,0,0.08), rgba(0,0,0,0.0) 60%)",
                mixBlendMode: "screen",
              }} />
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#ff4d4d",
                fontSize: 120,
                letterSpacing: 6,
                fontWeight: 800,
                textShadow: "0 0 12px rgba(255,0,0,0.6), 0 0 28px rgba(255,255,255,0.2)",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
                opacity: 0.95,
              }}>
                ERROR
              </div>
            </div>
          )}
        {showControls && mode === "centipede" && (
          <div style={{ position: "absolute", top: 12, right: 12, zIndex: 3 }}>
            <CentipedeControls
              initialValues={{
                headScale: controlsRef.current.scales.head,
                bodyScale: controlsRef.current.scales.body,
                legScale: controlsRef.current.scales.leg,
                headRot: controlsRef.current.rotationOffsets.head || 0,
                bodyRot: controlsRef.current.rotationOffsets.body || 0,
                legLeftRot: controlsRef.current.rotationOffsets.legLeft || 0,
                legRightRot: controlsRef.current.rotationOffsets.legRight || 0,
                legSpread: controlsRef.current.legSpread || 1.0,
                legPairGap: controlsRef.current.legPairGap || 0,
                legAnchor: controlsRef.current.legAnchor || "mid",
                legAnchorShift: controlsRef.current.legAnchorShift || 0,
                legAnchorLeftXPct: controlsRef.current.legAnchorLeftPct?.x ?? 0.9,
                legAnchorLeftYPct: controlsRef.current.legAnchorLeftPct?.y ?? 0.2,
                legAnchorRightXPct: controlsRef.current.legAnchorRightPct?.x ?? 0.1,
                legAnchorRightYPct: controlsRef.current.legAnchorRightPct?.y ?? 0.2,
              }}
              onChange={(p) => {
                const { scales, rotationOffsets, legSpread, legPairGap, legAnchor, legAnchorShift, legAnchorLeftPct, legAnchorRightPct } = p || {};
                controlsRef.current = {
                  ...controlsRef.current,
                  scales: scales ? { ...controlsRef.current.scales, ...scales } : controlsRef.current.scales,
                  rotationOffsets: rotationOffsets ? { ...controlsRef.current.rotationOffsets, ...rotationOffsets } : controlsRef.current.rotationOffsets,
                  legSpread: legSpread ?? controlsRef.current.legSpread,
                  legPairGap: legPairGap ?? controlsRef.current.legPairGap,
                  legAnchor: legAnchor ?? controlsRef.current.legAnchor,
                  legAnchorShift: legAnchorShift ?? controlsRef.current.legAnchorShift,
                  legAnchorLeftPct: legAnchorLeftPct ?? controlsRef.current.legAnchorLeftPct,
                  legAnchorRightPct: legAnchorRightPct ?? controlsRef.current.legAnchorRightPct,
                };
              }}
            />
          </div>
        )}
          {!isReady && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
              initializing...
            </div>
          )}
        </div>
        {!hideUI && (
          <div style={{ padding: "6px 12px", fontSize: 12, color: "#64748b" }}>
            Move your mouse. Toggle between Centipede, Gecko and Spider.
          </div>
        )}
      </div>
    </>
  );
}



