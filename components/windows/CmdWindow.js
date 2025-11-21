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

const TOKENS = (() => {
  const ko = ["가","나","다","라","마","바","사","아","자","차","카","타","파","하","꿿","뛣","뀻","씌","욥","땃","넵","컷","쮜","뜁","찻","쀼","쯰","쩝","힣"];
  const ja = ["あ","い","う","え","お","か","き","く","け","こ","さ","し","す","せ","そ","ア","イ","ウ","エ","オ","カ","キ","ク","ケ","コ","サ","シ","ス","セ","ソ"];
  const zh = ["虫","窗","文","数","系","統","電","腦","日","月","山","水","火","木","金","土","中","国","汉","字","語","語","學","校","人","口","心","手","足","目"];
  const ar = ["ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي","ء","ة"];
  const ru = ["а","б","в","г","д","е","ё","ж","з","и","й","к","л","м","н","о","п","р","с","т","у","ф","х","ц","ч","ш","щ","ъ","ы","ь"];
  return [...ko, ...ja, ...zh, ...ar, ...ru];
})();

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
      const HIT_RADIUS = 42; // 1.5x
      if (nearest && nearestD <= HIT_RADIUS) {
        const current = (nearest.textContent || "").trim();
        if (current.length > 0) {
          const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
          const orig = nearest.getAttribute("data-orig") ?? nearest.textContent;
          nearest.setAttribute("data-orig", orig);
          nearest.textContent = token;
          const colors = ["#ff00ff", "#00ff00"]; // magenta or green
          const c = colors[Math.floor(Math.random() * colors.length)];
          nearest.style.transition = "color 600ms ease";
          nearest.style.color = c;
          nearest.style.textShadow = `0 0 6px ${c}CC`;
          const existing = nearest.getAttribute("data-timer");
          if (existing) { clearTimeout(Number(existing)); }
          const tid = setTimeout(() => {
            // 원래 문자로 복구 + 스타일 초기화
            nearest.textContent = orig;
            nearest.style.color = "#e5e7eb";
            nearest.style.textShadow = "none";
            nearest.removeAttribute("data-timer");
            try { window.dispatchEvent(new CustomEvent("cmdCharMutated", { detail: { delta: -1 } })); } catch {}
          }, 6000);
          nearest.setAttribute("data-timer", String(tid));
          try { window.dispatchEvent(new CustomEvent("cmdCharMutated", { detail: { delta: +1 } })); } catch {}
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


