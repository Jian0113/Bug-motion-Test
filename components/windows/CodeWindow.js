import { useCallback, useEffect, useMemo, useRef } from "react";
import useDraggablePosition from "./useDraggablePosition";

const DEFAULT_WIDTH = 593.101;
const DEFAULT_HEIGHT = 520;
const DEFAULT_POSITION = { x: 51.0148, y: 47.94 };

const DEFAULT_SIDEBAR_ITEMS = [
  { label: "MY-APP", level: 0, weight: 600 },
  { label: ".cursor", level: 1 },
  { label: "{ } mcp.json", level: 2 },
  { label: ".next", level: 1 },
  { label: "components", level: 1 },
  { label: "controls", level: 2 },
  { label: "detail", level: 2 },
  { label: "JS CentipedeControls.js", level: 3, prefix: "JS" },
  { label: "JS 1.js", level: 3, prefix: "JS" },
  { label: "JS 2.js", level: 3, prefix: "JS", active: true },
  { label: "intro-buttons", level: 2 },
  { label: "main", level: 2 },
  { label: "JS main.js", level: 3, prefix: "JS" },
  { label: "lib", level: 1 },
];

const DEFAULT_CODE_LINES = [
  '<!DOCTYPE html>',
  '',
  '<html lang="en">',
  '',
  '<head>',
  '',
  '<meta charset="UTF-8">',
  '',
  '<title>Bug (engineering) - Wikipedia</title>',
  '',
  '<style>',
  '',
  '    body {',
  '',
  '        font-family: Arial, sans-serif;',
  '',
  '        margin: 0;',
  '',
  '        padding: 0;',
  '',
  '        line-height: 1.6;',
  '',
  '    }',
  '',
  '',
  '',
  '    /* 상단 헤더 */',
  '',
  '    .header {',
  '',
  '        display: flex;',
  '',
  '        align-items: center;',
  '',
  '        padding: 15px 20px;',
  '',
  '        border-bottom: 1px solid #ddd;',
  '',
  '    }',
  '',
  '',
  '',
  '    .header h1 {',
  '',
  '        margin: 0;',
  '',
  '        font-size: 26px;',
  '',
  '        font-weight: bold;',
  '',
  '        margin-right: 20px;',
  '',
  '    }',
  '',
  '',
  '',
  '    .search-box {',
  '',
  '        display: flex;',
  '',
  '        align-items: center;',
  '',
  '        margin-left: 20px;',
  '',
  '    }',
  '',
  '',
  '',
  '    .search-input {',
  '',
  '        width: 300px;',
  '',
  '        padding: 6px;',
  '',
  '        border: 1px solid #ccc;',
  '',
  '    }',
  '',
  '',
  '',
  '    .search-btn {',
  '',
  '        padding: 6px 14px;',
  '',
  '        margin-left: 4px;',
  '',
  '        background: white;',
  '',
  '        border: 1px solid black;',
  '',
  '        cursor: pointer;',
  '',
  '    }',
  '',
  '',
  '',
  '    /* 전체 레이아웃 */',
  '',
  '    .container {',
  '',
  '        display: flex;',
  '',
  '    }',
  '',
  '',
  '',
  '    /* 왼쪽 사이드 */',
  '',
  '    .sidebar {',
  '',
  '        width: 180px;',
  '',
  '        padding: 20px;',
  '',
  '        border-right: 1px solid #eee;',
  '',
  '    }',
  '',
  '',
  '',
  '    .sidebar a {',
  '',
  '        display: block;',
  '',
  '        margin-bottom: 10px;',
  '',
  '        color: #2458a6;',
  '',
  '        text-decoration: none;',
  '',
  '    }',
  '',
  '',
  '',
  '    /* 본문 */',
  '',
  '    .content {',
  '',
  '        flex: 1;',
  '',
  '        padding: 30px;',
  '',
  '    }',
  '',
  '',
  '',
  '    .title {',
  '',
  '        font-size: 32px;',
  '',
  '        font-weight: bold;',
  '',
  '        margin-bottom: 10px;',
  '',
  '    }',
  '',
  '',
  '',
  '    .notice-box {',
  '',
  '        border: 1px solid #ccc;',
  '',
  '        padding: 15px;',
  '',
  '        background: #f9f9f9;',
  '',
  '        margin-bottom: 20px;',
  '',
  '    }',
  '',
  '',
  '',
  '    .image-box {',
  '',
  '        float: right;',
  '',
  '        width: 260px;',
  '',
  '        margin-left: 20px;',
  '',
  '        text-align: center;',
  '',
  '        font-size: 14px;',
  '',
  '    }',
  '',
  '',
  '',
  '    .image-box img {',
  '',
  '        width: 100%;',
  '',
  '        border: 1px solid #ccc;',
  '',
  '    }',
  '',
  '',
  '',
  '    h2 {',
  '',
  '        margin-top: 40px;',
  '',
  '        border-bottom: 2px solid black;',
  '',
  '        padding-bottom: 5px;',
  '',
  '    }',
  '',
  '</style>',
  '',
  '</head>',
  '',
  '<body>',
  '',
  '',
  '',
  '<!-- 헤더 -->',
  '',
  '<div class="header">',
  '',
  '    <h1>WIKIPEDIA</h1>',
  '',
  '    <div class="search-box">',
  '',
  '        <input type="text" class="search-input" placeholder="Search Wikipedia">',
  '',
  '        <button class="search-btn">SEARCH</button>',
  '',
  '    </div>',
  '',
  '</div>',
  '',
  '',
  '',
  '<div class="container">',
  '',
  '',
  '',
  '    <!-- 왼쪽 사이드 메뉴 -->',
  '',
  '    <div class="sidebar">',
  '',
  '        <strong>Contents</strong><br><br>',
  '',
  '        <a href="#">Top</a>',
  '',
  '        <a href="#">History</a>',
  '',
  '        <a href="#">Feature</a>',
  '',
  '        <a href="#">References</a>',
  '',
  '    </div>',
  '',
  '',
  '',
  '    <!-- 본문 -->',
  '',
  '    <div class="content">',
  '',
  '        <div class="title">Bug(engineering)</div>',
  '',
  '',
  '',
  '        <p>From Wikipedia, the free encyclopedia</p>',
  '',
  '',
  '',
  '        <div class="notice-box">',
  '',
  '            This article is about engineering defects in general. ',
  '',
  '            For defects in computer software, see <a href="#">software bug</a>. ',
  '',
  '            For defects in computer hardware, see <a href="#">hardware bug</a>.',
  '',
  '        </div>',
  '',
  '',
  '',
  '        <!-- 이미지 박스 -->',
  '',
  '        <div class="image-box">',
  '',
  '            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Casio_fx-9750G_Plus_Screen_Error.jpg/480px-Casio_fx-9750G_Plus_Screen_Error.jpg" alt="">',
  '',
  '            <p>A <a href="#">BASIC</a> program failing due to a <a href="#">syntax error</a> in its code</p>',
  '',
  '        </div>',
  '',
  '',
  '',
  '        <p>',
  '',
  '            In engineering, a bug is a <a href="#">design</a> defect in an ',
  '',
  '            <a href="#">engineered system</a>—such as <a href="#">software</a>, ',
  '',
  '            <a href="#">computer hardware</a>, <a href="#">electronics</a>, ',
  '',
  '            <a href="#">circuitry</a> or <a href="#">machinery</a>—that causes an undesired result.',
  '',
  '            Defects outside the scope of design, such as a server crash due to a ',
  '',
  '            <a href="#">natural disaster</a>, are not bugs...',
  '',
  '        </p>',
  '',
  '',
  '',
  '        <p>',
  '',
  '            Bug is a non-technical term; more formal terms, besides defect,',
  '',
  '            are error, flaw, and <a href="#">fault</a>. Bugs may be persistent...',
  '',
  '        </p>',
  '',
  '',
  '',
  '        <p>',
  '',
  '            Since desirability is subjective... hence the often comical rejoinder:',
  '',
  '            “It\'s not a bug, it\'s a <a href="#">feature</a>.”',
  '',
  '        </p>',
  '',
  '',
  '',
  '        <h2>History</h2>',
  '',
  '        <p>...</p>',
  '',
  '',
  '',
  '    </div>',
  '',
  '</div>',
  '',
  '',
  '',
  '</body>',
  '',
  '</html>',
];

export default function CodeWindow({
  scale = 1,
  initialPosition = DEFAULT_POSITION,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  sidebarItems = DEFAULT_SIDEBAR_ITEMS,
  codeLines = DEFAULT_CODE_LINES,
}) {
  const { position, startDrag } = useDraggablePosition(scale, initialPosition);
  // 위치/크기 배치는 전역 scale만 사용
  const stagePos = useCallback((value) => `${value * scale}px`, [scale]);
  // 내부 UI 요소(폰트, 패딩 등)는 높이 배율에 따라 추가 확대
  const uiScale = Math.max(0.5, height / DEFAULT_HEIGHT);
  const stageUi = useCallback((value) => `${value * scale * uiScale}px`, [scale, uiScale]);
  // 빈 줄 제거하여 행간에 불필요한 공백 최소화
  const renderedLines = codeLines.filter((line) => line.trim().length > 0);
  const lineDigits = Math.max(2, String(renderedLines.length).length);
  const gutterRef = useRef(null);
  const codeRef = useRef(null);
  const lastEmitRef = useRef(0);
  const lastNumSpanRef = useRef(null);
  const activeSpansRef = useRef(new Map()); // el -> { timer }

  // 지네 헤드 접근 시 WikiWindow에 글리치 이벤트 브로드캐스트
  useEffect(() => {
    const onHead = (e) => {
      const now = performance.now();
      const container = codeRef.current;
      const { x, y } = e.detail || {};
      if (!container || typeof x !== "number" || typeof y !== "number") return;
      // 코드 내 숫자(하이라이트된 span[data-cw-num])들과의 최소 거리
      const spans = container.querySelectorAll('span[data-cw-num="1"]');
      if (!spans || spans.length === 0) return;
      let minDist = Infinity, nearest = null;
      spans.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = (r.left + r.right) / 2;
        const cy = (r.top + r.bottom) / 2;
        const d = Math.hypot(cx - x, cy - y);
        if (d < minDist) { minDist = d; nearest = el; }
      });
      const threshold = 96; // px 넉넉하게
      const level = Math.max(0, 1 - minDist / threshold);
      if (level > 0.01 && now - lastEmitRef.current > 40) {
        lastEmitRef.current = now;
        window.dispatchEvent(new CustomEvent("wikiGlitch", { detail: { level } }));
        // 콘텐츠 규모 변경 이벤트 (숫자에 반응)
        window.dispatchEvent(new CustomEvent("wikiContentScale", { detail: { factor: 1 + level * 1.5 } }));
        // 스타일 세팅: prop/value 전송 (가능한 경우)
        const prop = nearest.getAttribute("data-prop");
        const idxAttr = nearest.getAttribute("data-index");
        const index = typeof idxAttr === "string" ? Number(idxAttr) : undefined;
        const value = Number(nearest.textContent);
        if (prop && !Number.isNaN(value)) {
          window.dispatchEvent(new CustomEvent("wikiSetStyle", { detail: { prop, value, index } }));
        }
        // 숫자 활성화: 한 번 닿이면 영구 빨간색 표시
        if (nearest && !activeSpansRef.current.has(nearest)) {
          nearest.style.color = "#ef4444";
        }
        // prop이 있을 때만 값 진동(±50)과 스타일 반영 루프 시작
        if (nearest && prop && !Number.isNaN(value)) {
          if (!activeSpansRef.current.has(nearest)) {
            const base = value;
            const min = base - 50;
            const max = base + 50;
            const tick = () => {
              const rand = Math.round(min + Math.random() * (max - min));
              nearest.textContent = String(rand);
              window.dispatchEvent(new CustomEvent("wikiSetStyle", { detail: { prop, value: rand, index } }));
            };
            tick();
            const id = setInterval(tick, 180);
            activeSpansRef.current.set(nearest, { id });
          }
        }
      }
    };
    window.addEventListener("centipedeHead", onHead);
    return () => {
      window.removeEventListener("centipedeHead", onHead);
      // cleanup intervals
      activeSpansRef.current.forEach(({ id }) => clearInterval(id));
      activeSpansRef.current.clear();
    };
  }, []);

  // 코드 문자열을 HTML-safe로 이스케이프하고, 코드 안의 숫자 토큰을 노란색으로 하이라이트
  const htmlCode = useMemo(() => {
    const escapeHtml = (s) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const wrap = (num, attrs = "") => `<span data-cw-num="1" ${attrs} style="color:#facc15">${num}</span>`;
    const transformLine = (raw) => {
      let s = escapeHtml(raw);
      // font-size: Npx
      s = s.replace(/font-size:\s*(\d+(?:\.\d+)?)px/gi, (_m, n) => `font-size: ${wrap(n, 'data-prop="font-size" data-index="0"')}px`);
      // padding: Apx Bpx (support 1 or 2 values)
      s = s.replace(/padding:\s*(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/gi, (_m, a, b) => {
        return `padding: ${wrap(a, 'data-prop="padding" data-index="0"')}px ${wrap(b, 'data-prop="padding" data-index="1"')}px`;
      });
      s = s.replace(/padding:\s*(\d+(?:\.\d+)?)px/gi, (_m, a) => `padding: ${wrap(a, 'data-prop="padding" data-index="0"')}px`);
      // width: Npx
      s = s.replace(/width:\s*(\d+(?:\.\d+)?)px/gi, (_m, n) => `width: ${wrap(n, 'data-prop="width" data-index="0"')}px`);
      // fallback: any other number highlight without prop
      s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, (_m, n) => wrap(n));
      return s;
    };
    return renderedLines.map((line) => transformLine(line)).join("\n");
  }, [renderedLines]);

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
        border: "1px solid rgba(255,255,255,0.65)",
        background: "#0a0a0a",
        boxShadow: "0 32px 60px rgba(0,0,0,0.45)",
        overflow: "hidden",
        color: "#e5e7eb",
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
      }}
    >
      <div
        onPointerDown={startDrag}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${stageUi(4.58333)} ${stageUi(10.3125)}`,
          borderBottom: "1px solid rgba(255,255,255,0.65)",
          background: "#000000",
          fontSize: stageUi(8.02083),
          cursor: "grab",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", gap: stageUi(6.875), color: "#ffffff", fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
          {["File", "Edit", "Selection", "View"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div style={{ color: "#ffffff" }}>
          Bug_Sumulation
        </div>
        <div style={{ display: "flex", gap: stageUi(4.58333) }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: stageUi(6.875),
                height: stageUi(6.875),
                borderRadius: 0,
                border: "1px solid #ffffff",
                background: "transparent",
              }}
            />
          ))}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${stageUi(120.312)} 1fr`,
          minHeight: 0,
          flex: 1,
          background: "#0a0a0a",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          overflow: "hidden",
        }}
      >
        <aside
          style={{
            padding: stageUi(12.6042),
            borderRight: "1px solid rgba(255,255,255,0.35)",
            display: "flex",
            flexDirection: "column",
            gap: stageUi(3.4375),
            color: "#ffffff",
            fontSize: stageUi(8.02083),
          }}
          onPointerDown={startDrag}
        >
          {sidebarItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                paddingLeft: stageUi(6.875 + item.level * 9.1667),
                fontFamily: item.prefix ? "JetBrains Mono, ui-monospace, monospace" : undefined,
                fontWeight: item.active ? 700 : item.weight || 300,
                color: "#ffffff",
              }}
            >
              {item.label}
            </div>
          ))}
        </aside>
        <div style={{ padding: `${stageUi(10.3125)} ${stageUi(12.6042)}`, overflow: "auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: stageUi(7.44792),
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
              color: "#d1d5db",
              marginBottom: stageUi(6.875),
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              paddingBottom: stageUi(3.4375),
            }}
          >
            <span>components &gt; JS main.js &gt; Main &gt; controls</span>
            <span>main.js</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${stageUi(25.2083)} 1fr`,
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
              fontSize: stageUi(7.44792),
              color: "#ffffff",
            }}
          >
            <div
              ref={gutterRef}
              style={{
                background: "transparent",
                borderRight: "1px solid rgba(255,255,255,0.35)",
                padding: `${stageUi(4.58333)} ${stageUi(5.72917)}`,
                textAlign: "right",
                lineHeight: 1.6,
                color: "#facc15",
              }}
              onPointerDown={startDrag}
            >
              {renderedLines.map((_, idx) => (
                <div key={idx} style={{ opacity: 0.75 }}>
                  {String(idx + 1).padStart(lineDigits, "0")}
                </div>
              ))}
            </div>
            <pre
              ref={codeRef}
              style={{
                margin: 0,
                padding: `${stageUi(4.58333)} ${stageUi(10.3125)}`,
                background: "transparent",
                borderRadius: 0,
                border: "1px solid rgba(255,255,255,0.35)",
                boxShadow: "none",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                color: "#ffffff",
                fontFamily: "JetBrains Mono, ui-monospace, monospace",
              }}
              dangerouslySetInnerHTML={{ __html: htmlCode }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


