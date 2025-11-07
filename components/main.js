import Head from "next/head";
import dynamic from "next/dynamic";
import { drawCentipede as drawCentipedeLib } from "@/lib/centipede";
import { drawGecko as drawGeckoLib } from "@/lib/gecko";
import { drawSpider as drawSpiderLib } from "@/lib/spider";
import { useEffect, useRef, useState } from "react";

const CentipedeControls = dynamic(() => import("@/components/controls/CentipedeControls"), { ssr: false });

export default function Main({ initialMode = "centipede", hideUI = false, spritePaths = {}, spriteRotationOffset = {}, showControls = true } = {}) {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState(initialMode); // "centipede" | "gecko" | "spider"
  const [isReady, setIsReady] = useState(false);
  const [showError, setShowError] = useState(false);
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
    scales: { head: 1.28, body: 0.5, leg: 0.45 },
    legSpread: 1.0,
    legPairGap: 0,
    legAnchor: "knee",
    legAnchorShift: 0,
    legAnchorLeftPct: { x: 0.87, y: 0.27 },
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

    let animationFrameId = 0;
    let running = true;

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
      // black base only; panes will draw their own grid overlay
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
      drawCentipedeLib(ctx, state, timeMs, renderUseSprites, getSprite);
    };

    const drawGecko = (timeMs) => {
      drawGeckoLib(ctx, state, timeMs);
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
      // inject latest control values each frame
      state.rotationOffsets = controlsRef.current.rotationOffsets || {};
      state.scales = controlsRef.current.scales || { head: 1.0, body: 0.375, leg: 0.45 };
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
        ctx.fillStyle = state.background;
        ctx.fillRect(x, 0, w, H);
        // grid overlay for this pane (30% white lines)
        if (!gridPattern) buildGridPattern();
        ctx.fillStyle = gridPattern;
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
      // divider line between panes
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mid + 0.5, 0);
      ctx.lineTo(mid + 0.5, H);
      ctx.stroke();
      ctx.restore();
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
        background: "#0b1020",
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
              zIndex: 0,
            }}
          />
          {/* Error overlay (shown when hovering the Code box) */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 1,
              opacity: showError ? 1 : 0,
              transition: "opacity 160ms ease-in-out",
            }}
          >
            <div style={{
              color: "rgba(255,0,0,0.5)",
              fontSize: "18vw",
              fontWeight: 800,
              letterSpacing: 8,
              textTransform: "uppercase",
              userSelect: "none",
              textShadow: "0 2px 6px rgba(0,0,0,0.35)",
            }}>Error</div>
          </div>
          {/* Code box */}
          <div
            onMouseEnter={() => setShowError(true)}
            onMouseLeave={() => setShowError(false)}
            style={{
              position: "fixed",
              left: 24,
              top: 84,
              width: 160,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.08)",
              color: "#e5e7eb",
              fontWeight: 700,
              fontSize: 24,
              zIndex: 2,
              boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
              cursor: "pointer",
            }}
            title="Hover to show Error"
          >
            Code
          </div>
        {showControls && mode === "centipede" && (
          <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
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



