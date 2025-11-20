import { useCallback, useEffect, useRef, useState } from "react";
import { drawCentipede as drawCentipedeLib } from "@/lib/centipede";
import CodeWindow from "@/components/windows/CodeWindow";
import WikiWindow from "@/components/windows/WikiWindow";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

const IDE_WIDTH = 1186.202;
const IDE_DEFAULT_POS = { x: 51.0148, y: 47.94 };
const WIKI_WIDTH = 650.621;
const WIKI_DEFAULT_POS = { x: 462.365, y: 315.653 };
const IDE_HEIGHT = 1040; // 2x 높이
const WIKI_HEIGHT = 520; // 절반 높이

export default function DetailTwo() {
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);

  useEffect(() => {
    try { console.log("[detail/2] mount, initial scale:", scale); } catch {}
    const updateScale = () => {
      if (typeof window === "undefined") return;
      const { innerWidth, innerHeight } = window;
      const next = Math.min(innerWidth / BASE_WIDTH, innerHeight / BASE_HEIGHT);
      setScale(next || 1);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // 자율 주행 지네 (벡터 렌더)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    try { console.log("[detail/2] canvas ready:", !!canvas); } catch {}

    let raf = 0;
    let running = true;
    let lastLog = 0;
    let lastBotsLog = 0;

    // ---- 스프라이트 로더 ----
    const spritesRef = { centipede: { head: null, body: null, leg: null, legLeft: null, legRight: null, legLeft2: null, legRight2: null } };
    const getSprite = (kind, part) => {
      const k = spritesRef[kind] || {};
      return k[part] || null;
    };
    const loadOne = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    const loadSprites = async () => {
      // bug-visual-centipede와 동일한 자원 경로 사용
      const [head, body, legLeft, legRight, legLeft2, legRight2] = await Promise.all([
        loadOne("/1_parts_head.png"),
        loadOne("/1_parts_body.png"),
        loadOne("/1_parts_Left.png"),
        loadOne("/1_parts_Right.png"),
        loadOne("/1_parts_Left_2.png"),
        loadOne("/1_parts_Right_2.png"),
      ]);
      spritesRef.centipede.head = head;
      spritesRef.centipede.body = body;
      // generic leg로도 접근 가능하도록 기본 leg를 하나 지정
      spritesRef.centipede.leg = legLeft || legRight || null;
      spritesRef.centipede.legLeft = legLeft;
      spritesRef.centipede.legRight = legRight;
      spritesRef.centipede.legLeft2 = legLeft2;
      spritesRef.centipede.legRight2 = legRight2;
      try { console.log("[detail/2] sprites loaded:", !!head, !!body, !!legLeft, !!legRight, !!legLeft2, !!legRight2); } catch {}
    };

    // 렌더 구성(여러 개체에 공통 적용)
    const conf = {
      width: 0,
      height: 0,
      dpr: 1,
      spacing: 10,
      speed: 4,
      rotationOffsets: { head: 90, body: -90, legLeft: -180, legRight: 0 },
      legSpread: 1.0,
      legPairGap: 0,
      legAnchor: "knee",
      legAnchorShift: 2,
      legAnchorLeftPct: { x: 0.93, y: 0.27 },
      legAnchorRightPct: { x: 0.15, y: 0.27 },
      scales: { head: 0.08, body: 0.07, leg: 0.05 },
    };

    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      conf.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      conf.width = Math.floor(rect.width * conf.dpr);
      conf.height = Math.floor(rect.height * conf.dpr);
      canvas.width = conf.width;
      canvas.height = conf.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(conf.dpr, conf.dpr);
      try { console.log("[detail/2] canvas size:", rect.width, rect.height, "dpr:", conf.dpr); } catch {}
    };

    const bots = [];
    const MAX_BOTS = 48;
    let nextReproTs = performance.now() + 5000;
    try { console.log("[detail/2][repro] schedule next at(ms):", Math.round(nextReproTs)); } catch {}

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const rr = (a, b) => a + Math.random() * (b - a);

    const newBot = (x, y) => {
      const segs = Array.from({ length: 60 }, (_, i) => ({ x: x - i * conf.spacing, y }));
      const cw = canvas.clientWidth || 800;
      const ch = canvas.clientHeight || 600;
      return {
        segments: segs,
        target: { x: clamp(x + 120, 24, cw - 24), y: clamp(y + 40, 24, ch - 24) },
        lastRetarget: performance.now(),
        retargetDelay: 1400,
        spawnEndTs: 0,
        spawnDir: 0,
        speed: conf.speed,
      };
    };

    const initBot = () => {
      const cw = canvas.clientWidth || 800;
      const ch = canvas.clientHeight || 600;
      const cx = cw * 0.5;
      const cy = ch * 0.5;
      bots.push(newBot(cx, cy));
      try { console.log("[detail/2] bot init at", { x: Math.round(cx), y: Math.round(cy) }, "segments:", 60); } catch {}
    };

    const cloneFromParent = (parent, side, timeMs) => {
      const head = parent.segments[0];
      const neck = parent.segments[1] || head;
      const dx = head.x - neck.x, dy = head.y - neck.y;
      const d = Math.hypot(dx, dy) || 1;
      const tx = dx / d, ty = dy / d;
      const nx = -ty, ny = tx;
      const child = {
        segments: parent.segments.map(p => ({ x: p.x, y: p.y })),
        target: { x: head.x + tx * 160 + nx * side * 60, y: head.y + ty * 160 + ny * side * 60 },
        lastRetarget: timeMs || performance.now(),
        retargetDelay: rr(900, 2100),
        spawnEndTs: (timeMs || performance.now()) + 450,
        spawnDir: side,
        speed: rr(2.5, 5.0),
      };
      // 살짝 옆으로 시작
      child.segments[0].x += nx * side * 6;
      child.segments[0].y += ny * side * 6;
      // 초기 타겟을 화면 안으로 클램핑
      const cw = canvas.clientWidth || 800;
      const ch = canvas.clientHeight || 600;
      child.target.x = clamp(child.target.x, 24, cw - 24);
      child.target.y = clamp(child.target.y, 24, ch - 24);
      return child;
    };

    const updateBot = (bot, timeMs) => {
      const head = bot.segments[0];
      const nowTs = timeMs || performance.now();
      const cw = canvas.clientWidth || 800;
      const ch = canvas.clientHeight || 600;
      const reach = Math.hypot(bot.target.x - head.x, bot.target.y - head.y) < 24;
      if (reach || nowTs - bot.lastRetarget > bot.retargetDelay) {
        bot.target = {
          x: clamp(head.x + rr(-220, 220), 24, cw - 24),
          y: clamp(head.y + rr(-220, 220), 24, ch - 24),
        };
        bot.lastRetarget = nowTs;
        bot.retargetDelay = rr(900, 2100);
      }
      // move head
      const dx = bot.target.x - head.x;
      const dy = bot.target.y - head.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const step = Math.min(bot.speed, dist);
      head.x += (dx / dist) * step;
      head.y += (dy / dist) * step;
      // 화면 경계 클램핑 및 재목표 설정
      const cw2 = canvas.clientWidth || 800;
      const ch2 = canvas.clientHeight || 600;
      let clamped = false;
      if (head.x < 12) { head.x = 12; clamped = true; }
      if (head.y < 12) { head.y = 12; clamped = true; }
      if (head.x > cw2 - 12) { head.x = cw2 - 12; clamped = true; }
      if (head.y > ch2 - 12) { head.y = ch2 - 12; clamped = true; }
      if (clamped) {
        bot.target = {
          x: clamp(head.x + rr(-180, 180), 24, cw2 - 24),
          y: clamp(head.y + rr(-180, 180), 24, ch2 - 24),
        };
        bot.lastRetarget = nowTs;
        bot.retargetDelay = rr(900, 2000);
      }
      // split 애니메이션: 머리 양옆으로 벌어짐
      if (bot.spawnEndTs && nowTs < bot.spawnEndTs && bot.spawnDir) {
        const neck = bot.segments[1] || head;
        const hx = head.x - neck.x, hy = head.y - neck.y;
        const hd = Math.hypot(hx, hy) || 1;
        const nx = -hy / hd, ny = (hx / hd);
        const t = 1 - Math.max(0, bot.spawnEndTs - nowTs) / 450;
        const push = 18 * t;
        head.x += nx * bot.spawnDir * push;
        head.y += ny * bot.spawnDir * push;
      }
      // follow chain
      for (let i = 1; i < bot.segments.length; i++) {
        const prev = bot.segments[i - 1];
        const seg = bot.segments[i];
        const vx = seg.x - prev.x;
        const vy = seg.y - prev.y;
        const d = Math.hypot(vx, vy) || 0.0001;
        const desired = i === 1 ? conf.spacing * 3 : conf.spacing;
        seg.x = prev.x + (vx / d) * desired;
        seg.y = prev.y + (vy / d) * desired;
      }
    };

    const clear = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    };

    const drawBot = (bot, timeMs) => {
      drawCentipedeLib(
        ctx,
        {
          segments: bot.segments,
          rotationOffsets: conf.rotationOffsets,
          legSpread: conf.legSpread,
          legPairGap: conf.legPairGap,
          legAnchor: conf.legAnchor,
          legAnchorShift: conf.legAnchorShift,
          legAnchorLeftPct: conf.legAnchorLeftPct,
          legAnchorRightPct: conf.legAnchorRightPct,
          scales: conf.scales,
        },
        timeMs,
        true,
        getSprite
      );
    };

    const render = (timeMs) => {
      if (!running) return;
      clear();
      // 업데이트/렌더
      for (let i = 0; i < bots.length; i++) {
        updateBot(bots[i], timeMs);
        drawBot(bots[i], timeMs);
      }
      // 번식 트리거
      const AUTO_REPRO_ENABLED = false; // 자동 분열 비활성화 플래그
      const nowTs = timeMs || performance.now();
      if (AUTO_REPRO_ENABLED && bots.length > 0 && nowTs >= nextReproTs) {
        const before = bots.length;
        const parents = bots.splice(0, bots.length);
        for (let p of parents) {
          if (bots.length >= MAX_BOTS - 1) { // 여유 1
            bots.push(p);
            continue;
          }
          const c1 = cloneFromParent(p, -1, nowTs);
          const c2 = cloneFromParent(p, +1, nowTs);
          bots.push(c1, c2);
        }
        nextReproTs = nowTs + 5000;
        try { console.log("[detail/2][repro] split fired:", before, "->", bots.length, "next at(ms):", Math.round(nextReproTs)); } catch {}
      }
      // 1초 주기 상태 로그
      if ((timeMs || 0) - lastBotsLog > 1000) {
        lastBotsLog = timeMs || 0;
        const nowMs = timeMs || performance.now();
        const remain = Math.max(0, Math.round(nextReproTs - nowMs));
        const reason = !AUTO_REPRO_ENABLED
          ? "disabled"
          : (bots.length === 0
            ? "skip(no bots)"
            : (bots.length >= MAX_BOTS ? "skip(max cap)" : (remain > 0 ? "waiting" : "ready")));
        try { console.log("[detail/2] bots:", bots.length, "| [repro]", reason, "remain(ms):", remain, "target(ms):", Math.round(nextReproTs)); } catch {}
      }
      // 기존 간단 렌더 틱 로그
      if ((timeMs || 0) - lastLog > 1000) {
        lastLog = timeMs || 0;
        if (bots[0]) {
          try { console.log("[detail/2] render tick, segs:", bots[0].segments.length, "target:", bots[0].target); } catch {}
        }
      }
      raf = requestAnimationFrame(render);
    };

    setCanvasSize();
    // 스프라이트 로드 시작
    loadSprites();
    initBot();
    raf = requestAnimationFrame(render);
    const onResize = () => setCanvasSize();
    const onPointerDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // 개체가 없으면 스폰, 있으면 즉시 전체 분열
      if (bots.length === 0) {
        const b = newBot(x, y);
        // 생성 직후 안전 보정
        const cw = canvas.clientWidth || 800;
        const ch = canvas.clientHeight || 600;
        for (const s of b.segments) {
          if (!isFinite(s.x) || !isFinite(s.y)) { s.x = cw * 0.5; s.y = ch * 0.5; }
          s.x = clamp(s.x, 12, cw - 12);
          s.y = clamp(s.y, 12, ch - 12);
        }
        b.target.x = clamp(b.target.x, 48, cw - 48);
        b.target.y = clamp(b.target.y, 48, ch - 48);
        bots.push(b);
        try { console.log("[detail/2][bots] spawn at", { x: Math.round(x), y: Math.round(y) }, "total:", bots.length); } catch {}
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
          // 생성 직후 안전 보정
          const cw = canvas.clientWidth || 800;
          const ch = canvas.clientHeight || 600;
          for (const b of [c1, c2]) {
            for (const s of b.segments) {
              if (!isFinite(s.x) || !isFinite(s.y)) { s.x = cw * 0.5; s.y = ch * 0.5; }
              s.x = clamp(s.x, 12, cw - 12);
              s.y = clamp(s.y, 12, ch - 12);
            }
            b.target.x = clamp(b.target.x, 48, cw - 48);
            b.target.y = clamp(b.target.y, 48, ch - 48);
          }
          bots.push(c1, c2);
        }
        nextReproTs = nowTs + 5000;
        try { console.log("[detail/2][repro] manual split fired:", before, "->", bots.length, "next at(ms):", Math.round(nextReproTs)); } catch {}
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointerdown", onPointerDown, { passive: true, capture: true });
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onPointerDown, { capture: true });
    };
  }, [scale]);

  const stage = useCallback((value) => `${value * scale}px`, [scale]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        background: "#05060c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          width: stage(BASE_WIDTH),
          height: stage(BASE_HEIGHT),
          background: "#05060c",
          borderRadius: 0,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <CodeWindow scale={scale} initialPosition={IDE_DEFAULT_POS} width={IDE_WIDTH} height={IDE_HEIGHT} />
        <WikiWindow scale={scale} initialPosition={WIKI_DEFAULT_POS} width={WIKI_WIDTH} height={WIKI_HEIGHT} />
      </div>
    </div>
  );
}
