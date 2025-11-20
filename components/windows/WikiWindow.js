import { useCallback, useEffect, useState } from "react";
import useDraggablePosition from "./useDraggablePosition";

const DEFAULT_WIDTH = 650.621;
const DEFAULT_HEIGHT = 520;
const DEFAULT_POSITION = { x: 462.365, y: 315.653 };

const DEFAULT_WIKI_PARAGRAPHS = [
  [
    { text: "In engineering, a bug is a ", link: null },
    { text: "design", link: "https://en.wikipedia.org/wiki/Design" },
    { text: " defect in an ", link: null },
    { text: "engineered system", link: "https://en.wikipedia.org/wiki/System" },
    { text: " — such as ", link: null },
    { text: "software", link: "https://en.wikipedia.org/wiki/Software" },
    { text: ", ", link: null },
    { text: "computer hardware", link: "https://en.wikipedia.org/wiki/Computer_hardware" },
    { text: ", ", link: null },
    { text: "electronics", link: "https://en.wikipedia.org/wiki/Electronics" },
    { text: ", ", link: null },
    { text: "circuitry", link: "https://en.wikipedia.org/wiki/Circuitry" },
    { text: " or ", link: null },
    { text: "machinery", link: "https://en.wikipedia.org/wiki/Machinery" },
    { text: " — that causes an undesired result. Defects outside the scope of design, such as a server crash due to a ", link: null },
    { text: "natural disaster", link: "https://en.wikipedia.org/wiki/Natural_disaster" },
    { text: ", are not bugs, nor do bugs occur in natural systems such as the ", link: null },
    { text: "weather", link: "https://en.wikipedia.org/wiki/Weather" },
    { text: ".", link: null },
  ],
  [
    { text: "Bug is a non-technical term; more formal terms, besides defect, are error, flaw, and ", link: null },
    { text: "fault", link: "https://en.wikipedia.org/wiki/Fault_(technology)" },
    { text: ". Bugs may be persistent, sporadic, intermittent, or transient; in computing, ", link: null },
    { text: "crashes", link: "https://en.wikipedia.org/wiki/Crash_(computing)" },
    { text: ", ", link: null },
    { text: "freezes", link: "https://en.wikipedia.org/wiki/Freeze_(computing)" },
    { text: ", and ", link: null },
    { text: "glitches", link: "https://en.wikipedia.org/wiki/Glitch" },
    { text: " are types of bug.", link: null },
  ],
  [
    { text: 'Since desirability is subjective, what is undesirable to one may be desirable to another, hence the often comical rejoinder occasionally offered to the report of a bug, "It\'s not a bug, it\'s a ', link: null },
    { text: "feature", link: "https://en.wikipedia.org/wiki/Software_feature" },
    { text: '."', link: null },
  ],
];

export default function WikiWindow({
  scale = 1,
  initialPosition = DEFAULT_POSITION,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  paragraphs = DEFAULT_WIKI_PARAGRAPHS,
}) {
  const { position, startDrag } = useDraggablePosition(scale, initialPosition);
  // 위치/크기 배치는 전역 scale만 사용
  const stagePos = useCallback((value) => `${value * scale}px`, [scale]);
  // CodeWindow와 동일하게: 높이에 따른 UI 배율
  const uiScale = Math.max(0.5, height / DEFAULT_HEIGHT);
  const stageUi = useCallback((value) => `${value * scale * uiScale}px`, [scale, uiScale]);
  const fontMul = 2; // 요청: 본문 텍스트를 현재 대비 2배
  const [glitch, setGlitch] = useState(0);
  const [contentScale, setContentScale] = useState(1);
  const [stickyScale, setStickyScale] = useState(1);
  const [overridePaddingPx, setOverridePaddingPx] = useState(null);
  const [overrideFigureWidthPx, setOverrideFigureWidthPx] = useState(null);
  const [overrideFontSizePx, setOverrideFontSizePx] = useState(null);

  useEffect(() => {
    let timer = null;
    const onGlitch = (e) => {
      const level = Math.max(0, Math.min(1, (e.detail && e.detail.level) || 0));
      setGlitch(level);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setGlitch(0), 140);
    };
    const onScale = (e) => {
      const f = (e.detail && e.detail.factor) || 1;
      setContentScale(f);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setContentScale(1), 180);
    };
    const onSetStyle = (e) => {
      const { prop, value, index } = (e.detail || {});
      if (typeof value !== "number") return;
      if (prop === "font-size") {
        setOverrideFontSizePx(Math.max(1, value));
      } else if (prop === "padding") {
        // 상하 패딩에 우선 적용
        if (index === 0) setOverridePaddingPx(value);
      } else if (prop === "width") {
        setOverrideFigureWidthPx(value);
      }
    };
    window.addEventListener("wikiGlitch", onGlitch);
    window.addEventListener("wikiContentScale", onScale);
    window.addEventListener("wikiSetStyle", onSetStyle);
    return () => {
      window.removeEventListener("wikiGlitch", onGlitch);
      window.removeEventListener("wikiContentScale", onScale);
      window.removeEventListener("wikiSetStyle", onSetStyle);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        left: stagePos(position.x),
        top: stagePos(position.y),
        width: stagePos(width),
        height: stagePos(height),
        display: "flex",
        flexDirection: "column",
        borderRadius: 0,
        border: "1px solid rgba(17,24,39,0.85)",
        boxShadow: "0 32px 60px rgba(0,0,0,0.45)",
        background: "#ffffff",
        color: "#111827",
        overflow: "hidden",
      }}
    >
      <div
        onPointerDown={startDrag}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${stageUi(8.02083)} ${stageUi(11.4583)}`,
          borderBottom: "1px solid #111827",
          background: "#000000",
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: stageUi(8.02083 * 2),
          color: "#ffffff",
          cursor: "grab",
          userSelect: "none",
        }}
      >
        <div>http://localhost:3000/bug-visual-centipede</div>
        <div style={{ display: "flex", gap: stageUi(6.875), alignItems: "center" }}>
          <div
            style={{
              width: stageUi(9.16667),
              height: stageUi(9.16667),
              borderRadius: 0,
              border: "2px solid #ffffff",
            }}
          />
          <div style={{ display: "flex", gap: stageUi(4.58333), alignItems: "center" }}>
            <input
              placeholder="Search Wikipedia"
              style={{
                border: "1px solid #ffffff",
                borderRadius: 0,
                padding: `${stageUi(3.4375)} ${stageUi(5.72917)}`,
                fontSize: stageUi(8.02083 * 2),
                color: "#ffffff",
                background: "#000000",
              }}
            />
            <button
              style={{
                padding: `${stageUi(3.4375)} ${stageUi(10.3125)}`,
                border: "1px solid #ffffff",
                borderRadius: 0,
                background: "#000000",
                fontWeight: 600,
                cursor: "pointer",
                color: "#ffffff",
              }}
            >
              SEARCH
            </button>
          </div>
        </div>
      </div>
      <div
        style={{
          padding: `${stageUi(overridePaddingPx ?? 16.0417)} ${stageUi(20.625)}`,
          overflow: "auto",
          flex: 1,
          minHeight: 0,
          transform: `translate(${glitch * 25}px, ${glitch * 5}px) skewX(${glitch * 12.5}deg)`,
          filter: `contrast(${1 + glitch * 3.0}) brightness(${1 + glitch * 1.0}) saturate(${1 + glitch * 2.0})`,
          transition: "transform 120ms ease, filter 120ms ease",
        }}
      >
        <div style={{ display: "flex", gap: stageUi(17.1875) }}>
          <nav style={{ minWidth: stageUi(80.2083) }}>
            {/* "Contents" 텍스트 제거 */}
            <div style={{ display: "flex", flexDirection: "column", gap: stageUi(3.4375), color: "#0369a1", fontSize: stageUi((overrideFontSizePx ?? (8.02083 * fontMul))) }}>
              {["Top", "History", "feature", "References"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </nav>
          <article style={{ flex: "1 1 0%", display: "flex", flexDirection: "column", gap: stageUi(11.4583) }}>
            <header>
              <h2 style={{ margin: 0, fontSize: stageUi(17.1875 * fontMul) }}>Bug(engineering)</h2>
              <p style={{ color: "#4b5563", fontSize: stageUi((overrideFontSizePx ?? (8.02083 * fontMul))), marginTop: stageUi(2.29167) }}>
                From Wikipedia, the free encyclopedia
              </p>
            </header>
            <div
              style={{
                border: "1px solid #111827",
                borderRadius: 0,
                padding: stageUi(8.02083),
                lineHeight: 1.8,
                fontSize: stageUi((overrideFontSizePx ?? (8.02083 * fontMul))),
              }}
            >
              This article is about engineering defects in general. For defects in computer software, see{" "}
              <a href="https://en.wikipedia.org/wiki/Software_bug" style={{ color: "#0369a1" }}>
                software bug
              </a>
              . For defects in computer hardware, see{" "}
              <a href="https://en.wikipedia.org/wiki/Hardware_bug" style={{ color: "#0369a1" }}>
                hardware bug
              </a>
              .
            </div>
            <section style={{ display: "flex", gap: stageUi(16.0417) }}>
              <div style={{ flex: "1 1 0%", display: "flex", flexDirection: "column", gap: stageUi(8.02083), fontSize: stageUi((overrideFontSizePx ?? (8.02083 * fontMul))), lineHeight: 1.9 }}>
                {paragraphs.map((paragraph, idx) => (
                  <p key={idx} style={{ margin: 0 }}>
                    {paragraph.map((segment, sIdx) =>
                      segment.link ? (
                        <a key={sIdx} href={segment.link} style={{ color: "#0369a1" }}>
                          {segment.text}
                        </a>
                      ) : (
                        <span key={sIdx}>{segment.text}</span>
                      )
                    )}
                  </p>
                ))}
              </div>
              <figure
                style={{
                  width: stageUi(overrideFigureWidthPx ?? 154.688),
                  border: "1px solid #111827",
                  borderRadius: 0,
                  padding: stageUi(5.72917),
                  textAlign: "center",
                  fontSize: stageUi(((overrideFontSizePx ?? (8.02083 * fontMul)) * (6.875 / 8.02083))),
                  lineHeight: 1.6,
                }}
              >
                <img
                  src="https://www.figma.com/api/mcp/asset/afa5f21d-8921-4487-9ea7-c45aba4df702"
                  alt="Calculator displaying syntax error"
                  style={{ width: "100%", borderRadius: 0, marginBottom: stageUi(4.58333) }}
                />
                <figcaption>
                  A <a href="https://en.wikipedia.org/wiki/BASIC">BASIC</a> program failing due to a{" "}
                  <a href="https://en.wikipedia.org/wiki/Syntax_error">syntax error</a> in its code
                </figcaption>
              </figure>
            </section>
            <footer>
              <h3 style={{ margin: 0, fontSize: stageUi(14.8958 * fontMul) }}>History</h3>
              <div style={{ marginTop: stageUi(4.58333), borderBottom: "1px solid #111827" }} />
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}


