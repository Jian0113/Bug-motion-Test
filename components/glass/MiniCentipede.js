import { useEffect, useRef } from "react";
import { drawCentipede as drawCentipedeLib } from "@/lib/centipede";

export default function MiniCentipede({ style }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let running = true;
    // sprite refs
    const spritesRef = { centipede: { head: null, body: null, leg: null, legLeft: null, legRight: null, legLeft2: null, legRight2: null } };
    const getSprite = (kind, part) => {
      const root = spritesRef[kind] || {};
      return root[part] || null;
    };
    const loadOne = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    const loadSprites = async () => {
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
      spritesRef.centipede.leg = legLeft || legRight || null;
      spritesRef.centipede.legLeft = legLeft;
      spritesRef.centipede.legRight = legRight;
      spritesRef.centipede.legLeft2 = legLeft2;
      spritesRef.centipede.legRight2 = legRight2;
    };
    const state = {
      segments: [],
      spacing: 8,
      // 제자리 동작 모드: 앵커 주위로 소진폭 진동
      anchor: { x: 0, y: 0 },
      ampX: 8,
      ampY: 6,
      omega: 0.003, // rad/ms
      jitterAmp: 1.2,
      rotationOffsets: { head: 90, body: -90, legLeft: -180, legRight: 0 },
      legSpread: 1.0,
      legPairGap: 0,
      legAnchor: "knee",
      legAnchorShift: 2,
      legAnchorLeftPct: { x: 0.93, y: 0.27 },
      legAnchorRightPct: { x: 0.15, y: 0.27 },
      scales: { head: 0.05, body: 0.042, leg: 0.035 },
    };
    const rr = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const setSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    const init = () => {
      setSize();
      const w = canvas.clientWidth || 300;
      const h = canvas.clientHeight || 200;
      const cx = w * 0.5, cy = h * 0.5;
      state.anchor.x = cx;
      state.anchor.y = cy;
      state.segments = Array.from({ length: 40 }, (_, i) => ({ x: cx - i * state.spacing, y: cy }));
    };
    const update = (timeMs) => {
      const head = state.segments[0];
      const now = timeMs || performance.now();
      // 앵커 주위 소진폭 진동 + 아주 미세한 지터
      const phase = now * state.omega;
      const jx = (Math.random() - 0.5) * state.jitterAmp;
      const jy = (Math.random() - 0.5) * state.jitterAmp;
      head.x = state.anchor.x + Math.sin(phase) * state.ampX + jx;
      head.y = state.anchor.y + Math.cos(phase * 1.3) * state.ampY + jy;
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
    const draw = (t) => {
      drawCentipedeLib(ctx, state, t, true, getSprite);
    };
    const render = (t) => {
      if (!running) return;
      clear();
      update(t);
      draw(t);
      raf = requestAnimationFrame(render);
    };
    const onResize = () => setSize();
    (async () => { await loadSprites(); init(); raf = requestAnimationFrame(render); })();
    window.addEventListener("resize", onResize);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}


