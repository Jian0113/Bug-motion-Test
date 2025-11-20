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

    const state = {
      width: 0,
      height: 0,
      dpr: 1,
      segments: [],
      spacing: 10,
      speed: 4,
      rotationOffsets: {},
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
      state.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      state.width = Math.floor(rect.width * state.dpr);
      state.height = Math.floor(rect.height * state.dpr);
      canvas.width = state.width;
      canvas.height = state.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(state.dpr, state.dpr);
      try { console.log("[detail/2] canvas size:", rect.width, rect.height, "dpr:", state.dpr); } catch {}
    };

    const initBot = () => {
      const cw = canvas.clientWidth || 800;
      const ch = canvas.clientHeight || 600;
      const cx = cw * 0.5;
      const cy = ch * 0.5;
      state.segments = Array.from({ length: 60 }, (_, i) => ({ x: cx - i * state.spacing, y: cy }));
      bot.target = { x: cx + 120, y: cy + 40 };
      bot.lastRetarget = performance.now();
      bot.retargetDelay = 1600;
      try { console.log("[detail/2] bot init at", { x: Math.round(cx), y: Math.round(cy) }, "segments:", state.segments.length); } catch {}
    };

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const rr = (a, b) => a + Math.random() * (b - a);

    const bot = {
      target: { x: 0, y: 0 },
      lastRetarget: 0,
      retargetDelay: 1400,
    };

    const updateBot = (timeMs) => {
      const head = state.segments[0];
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
      const step = Math.min(state.speed, dist);
      head.x += (dx / dist) * step;
      head.y += (dy / dist) * step;
      // follow chain
      for (let i = 1; i < state.segments.length; i++) {
        const prev = state.segments[i - 1];
        const seg = state.segments[i];
        const vx = seg.x - prev.x;
        const vy = seg.y - prev.y;
        const d = Math.hypot(vx, vy) || 0.0001;
        const desired = i === 1 ? state.spacing * 3 : state.spacing;
        seg.x = prev.x + (vx / d) * desired;
        seg.y = prev.y + (vy / d) * desired;
      }
    };

    const clear = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    };

    const render = (timeMs) => {
      if (!running) return;
      clear();
      updateBot(timeMs);
      drawCentipedeLib(ctx, state, timeMs, false, null);
      if ((timeMs || 0) - lastLog > 1000) {
        lastLog = timeMs || 0;
        try { console.log("[detail/2] render tick, segs:", state.segments.length, "target:", bot.target); } catch {}
      }
      raf = requestAnimationFrame(render);
    };

    setCanvasSize();
    initBot();
    raf = requestAnimationFrame(render);
    const onResize = () => setCanvasSize();
    window.addEventListener("resize", onResize);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
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
