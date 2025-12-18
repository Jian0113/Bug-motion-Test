import { useEffect, useRef, useState } from "react";
import { drawCentipede as drawCentipedeLib } from "@/lib/centipede";

export default function XRayWindow({
  width = 260,
  height = 260,
  spritePaths = {
    centipede: {
      head: "/1_parts_head.png",
      body: "/1_parts_body.png",
      leg: "/1_parts_Left.png",
      legLeft: "/1_parts_Left.png",
      legRight: "/1_parts_Right.png",
      legLeft2: "/1_parts_Left_2.png",
      legRight2: "/1_parts_Right_2.png",
    },
  },
  overlaySrc = "/x-ray.svg",
}) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const spritesRef = useRef({
    centipede: { head: null, body: null, leg: null },
    bitmaps: { centipede: {} },
  });

  useEffect(() => {
    let mounted = true;
    const loadOne = (path) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = path;
      });
    (async () => {
      const { centipede } = spritePaths || {};
      const head = await loadOne(centipede?.head || "/centipede-head.png");
      const body = await loadOne(centipede?.body || "/centipede-body.png");
      const leg = await loadOne(centipede?.leg || "/centipede-leg.png");
      if (!mounted) return;
      spritesRef.current.centipede.head = head;
      spritesRef.current.centipede.body = body;
      spritesRef.current.centipede.leg = leg;
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [spritePaths]);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const W = Math.floor(width * dpr);
    const H = Math.floor(height * dpr);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // static chain setup (idle wiggle)
    const spacing = 9;
    const count = 50;
    const margin = 60; // left margin to avoid clipping
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const segments = Array.from({ length: count }, (_, i) => ({
      x: margin + i * spacing,
      y: centerY,
    }));
    const stateBase = {
      segments,
      // Main과 동일한 기본 회전값으로 파츠 정렬
      rotationOffsets: { head: 90, body: -90, legLeft: -180, legRight: 0 },
      scales: { head: 0.08, body: 0.07, leg: 0.05 },
    };
    const getSprite = (kind, part) => {
      const s = spritesRef.current.centipede;
      if (part === "head") return s.head;
      if (part === "body") return s.body;
      if (part === "leg") return s.leg;
      return null;
    };
    const render = (t) => {
      ctx.clearRect(0, 0, width, height);
      // idle wiggle
      for (let i = 0; i < segments.length; i++) {
        const baseX = margin + i * spacing;
        const amp = 5;
        const k = 0.12;
        segments[i].x = baseX;
        segments[i].y = centerY + Math.sin((t * 0.003) + i * k) * amp;
      }
      // top half: sprites
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, height * 0.5);
      ctx.clip();
      drawCentipedeLib(ctx, stateBase, t, true, getSprite);
      // tint to white
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height * 0.5);
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
      // bottom half: skeleton (no sprites)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, height * 0.5, width, height * 0.5);
      ctx.clip();
      drawCentipedeLib(ctx, stateBase, t, false, getSprite);
      // tint skeleton to white
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, height * 0.5, width, height * 0.5);
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [ready, width, height]);

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden" }}>
      <canvas ref={canvasRef} />
      {!!overlaySrc && (
        <img
          src={overlaySrc}
          alt="x-ray overlay"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",        // SVG 채우기
            mixBlendMode: "screen",    // 화면과 자연스럽게 합성
            opacity: 0.85,
            pointerEvents: "none",
            userSelect: "none",
            filter: "contrast(1.06) brightness(1.06)",
            transform: "rotate(90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      )}
      {/* 안쪽 얇은 프레임 */}
      <div
        style={{
          position: "absolute",
          inset: 6,
          border: "1px solid rgba(255,255,255,0.9)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}


