import { useEffect, useMemo } from "react";

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

export default function BackgroundCodeLayer({ lines = 80 }) {
  const data = useMemo(() => {
    const out = [];
    for (let i = 0; i < lines; i++) {
      out.push(SAMPLE[i % SAMPLE.length]);
    }
    return out;
  }, [lines]);

  useEffect(() => {
    // Nothing: visual is handled via inline styles and behaviors (bgCode)
  }, []);

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0,
      opacity: 0.6,
    }}>
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
          <div key={i} className="bg-code-line" style={{
            transform: `translateY(${(i * 16) % 10000}px)`,
          }}>{l}</div>
        ))}
      </div>
    </div>
  );
}


