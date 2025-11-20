import { useEffect, useMemo, useRef, useState } from "react";

const SAMPLE = [
  "function boot() {",
  "  const sys = initialize('NEON_GRID');",
  "  let ticks = 0; let flux = 0x0;",
  "  while (sys.alive) {",
  "    ticks++; flux ^= (ticks << 3);",
  "    if ((ticks & 0x3f) === 0) sys.pulse(flux);",
  "  }",
  "}",
  "/* CYBERPUNK NOISE STREAM */",
  "for (let i=0;i<256;i++){",
  "  const c = String.fromCharCode((i*13)%127);",
  "  process.stdout.write(c);",
  "}",
];

export default function BackgroundCodeLayer({
  lines = 80,
  mode = "static", // "static" | "typeScroll"
  typeSpeed = 60, // chars per second
  scrollSpeed = 12, // px per second (upwards)
}) {
  // STATIC MODE (기존 동작 유지)
  const data = useMemo(() => {
    const out = [];
    for (let i = 0; i < lines; i++) {
      out.push(SAMPLE[i % SAMPLE.length]);
    }
    return out;
  }, [lines]);

  // TYPE+SCROLL MODE
  const [typed, setTyped] = useState("");
  const scrollPxRef = useRef(0);
  const containerRef = useRef(null);
  const source = useMemo(() => {
    // 길게 반복된 소스 버퍼
    const base = SAMPLE.join("\n") + "\n";
    return base.repeat(100);
  }, []);

  useEffect(() => {
    if (mode !== "typeScroll") return;
    let raf = 0;
    let last = performance.now();
    let cursor = 0;
    let carry = 0;
    const lineHeight = 16; // px

    const loop = (ts) => {
      const dt = ts - last;
      last = ts;
      // typing
      carry += (typeSpeed * dt) / 1000;
      const add = carry | 0;
      if (add > 0) {
        carry -= add;
        const next = source.slice(cursor, cursor + add);
        cursor = (cursor + add) % source.length;
        setTyped((s) => (s + next).slice(-20000)); // 제한
      }
      // scroll up
      scrollPxRef.current = (scrollPxRef.current + (scrollSpeed * dt) / 1000) % (lineHeight * 10000);
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(-${scrollPxRef.current}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, source, typeSpeed, scrollSpeed]);

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0,
      opacity: 0.6,
    }}>
      {mode === "static" ? (
        <div style={{
          position: "absolute",
          inset: 0,
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: 12,
          lineHeight: "16px",
          color: "rgba(148,163,184,0.35)",
          whiteSpace: "pre",
          padding: "24px 28px",
          userSelect: "none",
          textShadow: "0 0 8px rgba(0,255,255,0.12)",
          maskImage: "linear-gradient(180deg, transparent, black 10%, black 90%, transparent)",
        }}>
          {data.map((l, i) => (
            <div key={i} className="bg-code-line" style={{ transform: `translateY(${(i * 16) % 10000}px)` }}>{l}</div>
          ))}
        </div>
      ) : (
        <div style={{
          position: "absolute",
          inset: 0,
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: 12,
          lineHeight: "16px",
          color: "rgba(148,163,184,0.35)",
          whiteSpace: "pre-wrap",
          padding: "24px 28px",
          userSelect: "none",
          textShadow: "0 0 8px rgba(0,255,255,0.12)",
          maskImage: "linear-gradient(180deg, transparent, black 10%, black 90%, transparent)",
        }}>
          <div ref={containerRef}>
            {typed}
          </div>
        </div>
      )}
    </div>
  );
}


