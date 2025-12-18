import Head from "next/head";
import { drawCentipede as drawCentipedeLib } from "@/lib/centipede";
import { drawGecko as drawGeckoLib } from "@/lib/gecko";
import { drawSpider as drawSpiderLib } from "@/lib/spider";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("centipede"); // "centipede" | "gecko" | "spider"
  const [isReady, setIsReady] = useState(false);
  const spritesRef = useRef({
    centipede: { head: null, body: null, leg: null },
    spider: { head: null, body: null, leg: null },
  });
  const [spriteVersion, setSpriteVersion] = useState(0); // click to reload

  // safe sprite accessor (available to all draw functions)
  const getSprite = (kind, part) => {
    const root = spritesRef.current || {};
    const bucket = root[kind] || {};
    return bucket[part] || null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId = 0;
    let running = true;

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
    };

    const drawImageCenteredRotated = (img, x, y, angleRad, scale = 1) => {
      if (!img) return;
      const ctx = canvas.getContext("2d");
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
      const ctx = canvas.getContext("2d");
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
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = state.background;
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    };

    // split-view sprite toggle flag (set inside render panes)
    let renderUseSprites = false;
    const getSprite = (kind, part) => {
      const root = spritesRef.current || {};
      const bucket = root[kind] || {};
      return bucket[part] || null;
    };

    const drawCentipede = (timeMs) => {
      drawCentipedeLib(canvas.getContext("2d"), state, timeMs, renderUseSprites, getSprite);
    };

    const drawGecko = (timeMs) => {
      drawGeckoLib(canvas.getContext("2d"), state, timeMs);
    };

    const render = (timeMs) => {
      if (!running) return;
      clear();
      lengthenOrShorten();
      followChain(timeMs);
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
      const renderPane = (x, w, useSprites) => {
        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, 0, w, H);
        ctx.clip();
        ctx.fillStyle = state.background;
        ctx.fillRect(x, 0, w, H);
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
      renderPane(0, mid, false);
      renderPane(mid, W - mid, true);
      animationFrameId = requestAnimationFrame(render);
    };

    // init
    setCanvasSize();
    initSegments();
    setIsReady(true);

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [mode]);

  // Load sprites from /public default paths when spriteVersion changes
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
      const [cHead, cBody, cLeg, sHead, sBody, sLeg] = await Promise.all([
        loadOne("/centipede-head.png"),
        loadOne("/centipede-body.png"),
        loadOne("/centipede-leg.png"),
        loadOne("/spider-head.png"),
        loadOne("/spider-body.png"),
        loadOne("/spider-leg.png"),
      ]);
      if (!mounted) return;
      spritesRef.current.centipede.head = cHead;
      spritesRef.current.centipede.body = cBody;
      spritesRef.current.centipede.leg = cLeg;
      spritesRef.current.spider.head = sHead;
      spritesRef.current.spider.body = sBody;
      spritesRef.current.spider.leg = sLeg;
    })();
    return () => {
      mounted = false;
    };
  }, [spriteVersion]);

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
    // rely on canvasRef effect's closure: read from the canvas-bound effect state via a hack
    // simpler: since drawSpider is called inside the same render tick, state.segments is current
    // we can capture it from the canvas context by storing on element
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
        background: "#0b1020",
        color: "#cbd5e1",
        display: "flex",
        flexDirection: "column",
      }}>
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
        <div style={{ flex: 1, position: "relative" }}>
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              cursor: "none",
            }}
          />
          {!isReady && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
              initializing...
            </div>
          )}
        </div>
        <div style={{ padding: "6px 12px", fontSize: 12, color: "#64748b" }}>
          Move your mouse. Toggle between Centipede, Gecko and Spider.
        </div>
      </div>
    </>
  );
}

