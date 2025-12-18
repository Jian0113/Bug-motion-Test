import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

// detail 페이지에서 사용하는 Main 캔버스를 그대로 배경에 배치(자율주행, 번식 없음)
const MainCanvas = dynamic(() => import("@/components/main"), { ssr: false });

export default function WebIntroBackground() {
  const gridRef = useRef(null);

  // 단순 그리드만 그리는 캔버스 (정적)
  useEffect(() => {
    const canvas = gridRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      const { innerWidth, innerHeight, devicePixelRatio } = window;
      const scale = 1.2;
      const w = Math.ceil(innerWidth * scale);
      const h = Math.ceil(innerHeight * scale);
      const dpr = Math.max(1, Math.min(2, devicePixelRatio || 1));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const minor = 24;
      const major = minor * 4;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(78, 125, 69, 0.24)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += minor) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += minor) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
      }
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= w; x += major) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += major) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
      }
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  // Leva 위치/스타일 디버그 로그
  useEffect(() => {
    const root = document.querySelector(".leva__root");
    const parent = root?.parentElement;
    const grand = parent?.parentElement;
    const rect = root?.getBoundingClientRect();
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "A",
        location: "WebIntroBackground.js:leva",
        message: "Leva root rect/z-index/pointer (with ancestors)",
        data: {
          found: !!root,
          top: rect?.top,
          left: rect?.left,
          width: rect?.width,
          height: rect?.height,
          zIndex: root ? getComputedStyle(root).zIndex : null,
          pointerEvents: root ? getComputedStyle(root).pointerEvents : null,
          parentTag: parent?.tagName,
          parentPE: parent ? getComputedStyle(parent).pointerEvents : null,
          parentZ: parent ? getComputedStyle(parent).zIndex : null,
          grandTag: grand?.tagName,
          grandPE: grand ? getComputedStyle(grand).pointerEvents : null,
          grandZ: grand ? getComputedStyle(grand).zIndex : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={gridRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: "100vh",
          mixBlendMode: "screen",
        }}
      />
      <div style={{ position: "absolute", inset: 0 }}>
        <MainCanvas
          initialMode="centipede"
          botMode="centipede"
          hideUI
          showControls={false}
          renderMouseFollower={false}
          spawnSingleBot
          autoReproEnabled={false}
          autoReproOnce={false}
          disableBots={false}
          zIndex={0}
          maxDpr={1.5}
          spritePaths={{
            centipede: {
              head: "/1_parts_head.png",
              body: "/1_parts_body.png",
              legLeft: "/1_parts_Left.png",
              legRight: "/1_parts_Right.png",
              legLeft2: "/1_parts_Left_2.png",
              legRight2: "/1_parts_Right_2.png",
            },
          }}
          spriteRotationOffset={{}}
          scaleMultiplier={1}
          segmentCount={60}
        />
        <MainCanvas
          initialMode="gecko"
          botMode="gecko"
          hideUI
          showControls={false}
          renderMouseFollower={false}
          spawnSingleBot
          autoReproEnabled={false}
          autoReproOnce={false}
          disableBots={false}
          zIndex={0}
          maxDpr={1.5}
          spritePaths={{
            gecko: {
              head: "/Ratio_head.png",
              // 디테일 페이지와 동일하게 14-15 프레임 교대
              bodyFrames: ["/Ratio_Body-14.png", "/Ratio_Body-15.png"],
              leg1: "/Ratio_leg_1.png",
              leg2: "/Ratio_leg_2.png",
            },
          }}
          // 디테일 뷰와 동일한 회전 오프셋/세그먼트 수를 사용해 스프라이트 정렬
          spriteRotationOffset={{}}
          scaleMultiplier={1}
          segmentCount={60}
        />
      </div>
      <style jsx global>{`
        /* Leva 패널을 항상 최상단에 노출 */
        .leva__root {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

