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
  const rootRef = useRef(null);
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
        setTyped((s) => (s + next).slice(-5000)); // 제한 줄여 DOM 가벼움
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

  // 히트박스: 배경 코드 문자 변조
  useEffect(() => {
    if (mode !== "typeScroll") return;
    let lastTs = 0;
    const handler = (e) => {
      const { x, y } = (e && e.detail) || {};
      const now = performance.now();
      if (now - lastTs < 70) return; // 70ms 간격으로 스로틀
      lastTs = now;
      const root = rootRef.current;
      if (!root || typeof x !== "number" || typeof y !== "number") return;
      const rect = root.getBoundingClientRect();
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
      const spans = root.querySelectorAll('span[data-bg="1"]');
      if (!spans || spans.length === 0) return;
      // 최신 영역의 일부만 검사하여 비용 절감
      const len = spans.length;
      const windowSize = 600; // 마지막 600개만 검사
      let nearest = null;
      let best = Infinity;
      for (let i = Math.max(0, len - windowSize); i < len; i++) {
        const el = spans[i];
        const r = el.getBoundingClientRect();
        const cx = (r.left + r.right) / 2;
        const cy = (r.top + r.bottom) / 2;
        const d = Math.hypot(cx - x, cy - y);
        if (d < best) { best = d; nearest = el; }
      }
      const HIT = 32;
      if (!nearest || best > HIT) return;
      const colors = ["#ff00ff", "#00ff00"];
      const tokenPool = ["가","나","다","라","마","바","사","아","자","차","カ","キ","ク","ケ","コ","ア","イ","ウ","エ","オ","虫","文","系","統","电","腦","ا","ب","ت","ث","ج","ح","خ","а","б","в","г","д","е","ж","з","и","й"];
      const orig = nearest.getAttribute("data-orig") ?? nearest.textContent;
      nearest.setAttribute("data-orig", orig);
      const t = tokenPool[Math.floor(Math.random() * tokenPool.length)];
      nearest.textContent = t;
      const c = colors[Math.floor(Math.random() * colors.length)];
      nearest.style.transition = "color 600ms ease";
      nearest.style.color = c;
      nearest.style.textShadow = `${c} 0 0 6px`;
      const existing = nearest.getAttribute("data-timer");
      if (existing) clearTimeout(Number(existing));
      const tid = setTimeout(() => {
        nearest.textContent = orig;
        nearest.style.color = "rgba(34,197,94,0.7)";
        nearest.style.textShadow = "none";
        nearest.removeAttribute("data-timer");
      }, 3000);
      nearest.setAttribute("data-timer", String(tid));
    };
    window.addEventListener("centipedeHead", handler);
    return () => window.removeEventListener("centipedeHead", handler);
  }, [mode]);

  return (
    <div ref={rootRef} style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0,
      opacity: 0.85,
    }}>
      {mode === "static" ? (
        <div style={{
          position: "absolute",
          inset: 0,
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: 12,
          lineHeight: "16px",
        color: "rgba(34,197,94,0.7)",
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
        color: "rgba(34,197,94,0.7)",
          whiteSpace: "pre-wrap",
          padding: "24px 28px",
          userSelect: "none",
          textShadow: "0 0 8px rgba(0,255,255,0.12)",
          maskImage: "linear-gradient(180deg, transparent, black 10%, black 90%, transparent)",
        }}>
          <div ref={containerRef}>
            {typed.split("").map((ch, idx) => (
              <span key={idx} data-bg="1">{ch}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


