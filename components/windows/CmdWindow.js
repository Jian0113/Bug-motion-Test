import { useEffect, useMemo, useRef } from "react";

const RAW_TEXT = `Microsoft Windows [Version 10.0.26200.7171]
(c) Microsoft Corporation. All rights reserved.

C:\\Users\\user>`;

function toSpans(text) {
  const lines = text.split("\n");
  const nodes = [];
  let key = 0;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    for (let i = 0; i < line.length; i++) {
      const ch = line[i] === " " ? "\u00A0" : line[i];
      nodes.push(
        <span
          key={`${li}-${i}-${key++}`}
          data-cmd="1"
          style={{ display: "inline-block" }}
        >
          {ch}
        </span>
      );
    }
    if (li < lines.length - 1) nodes.push(<br key={`br-${li}-${key++}`} />);
  }
  return nodes;
}

export default function CmdWindow({ fontScale = 1 }) {
  const containerRef = useRef(null);
  const spansMemo = useMemo(() => toSpans(RAW_TEXT), []);

  useEffect(() => {
    const handler = (e) => {
      const { x, y } = (e && e.detail) || {};
      const root = containerRef.current;
      if (!root || typeof x !== "number" || typeof y !== "number") return;
      const rect = root.getBoundingClientRect();
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
      const spans = root.querySelectorAll('span[data-cmd="1"]');
      if (!spans || spans.length === 0) return;
      // pick nearest span and randomize A-Z
      let nearest = null;
      let nearestD = Infinity;
      spans.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = (r.left + r.right) / 2;
        const cy = (r.top + r.bottom) / 2;
        const d = Math.hypot(cx - x, cy - y);
        if (d < nearestD) { nearestD = d; nearest = el; }
      });
      const HIT_RADIUS = 28;
      if (nearest && nearestD <= HIT_RADIUS) {
        const randChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
        const current = nearest.textContent || "";
        if (current.trim().length > 0) {
          nearest.textContent = randChar;
          nearest.style.color = "#7CFC00";
          nearest.style.textShadow = "0 0 6px rgba(124,252,0,0.85)";
        }
      }
    };
    window.addEventListener("centipedeHead", handler);
    return () => window.removeEventListener("centipedeHead", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontSize: 14 * fontScale,
        lineHeight: `${20 * fontScale}px`,
        color: "#e5e7eb",
        whiteSpace: "pre-wrap",
      }}
    >
      {spansMemo}
    </div>
  );
}


