import { useEffect, useRef, useState } from "react";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
let runtimeScale = 0.58;
const stage = (value) => `${value * runtimeScale}px`;

const IDE_WIDTH = 593.101;
const IDE_DEFAULT_POS = { x: 51.0148, y: 47.94 };
const WIKI_WIDTH = 650.621;
const WIKI_DEFAULT_POS = { x: 462.365, y: 315.653 };

const sidebarItems = [
  { label: "MY-APP", level: 0, weight: 600 },
  { label: ".cursor", level: 1 },
  { label: "{ } mcp.json", level: 2, accent: true },
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

const codeLines = [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '<head>',
  '  <meta charset="UTF-8">',
  '  <title>Bug (engineering) - Wikipedia</title>',
  '  <style>',
  '    body {',
  '      font-family: Arial, sans-serif;',
  '      margin: 0;',
  '      padding: 0;',
  '      line-height: 1.6;',
  '    }',
  '',
  '    /* 상단 헤더 */',
  '    .header {',
  '      display: flex;',
  '      align-items: center;',
  '    }',
];

const wikiParagraphs = [
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

export default function DetailTwo() {
  const [scale, setScale] = useState(1);
  const [desktopPos, setDesktopPos] = useState(IDE_DEFAULT_POS);
  const [wikiPos, setWikiPos] = useState(WIKI_DEFAULT_POS);
  const dragRef = useRef({
    active: false,
    target: null,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  });

  useEffect(() => {
    const updateScale = () => {
      if (typeof window === "undefined") return;
      const { innerWidth, innerHeight } = window;
      const next = Math.min(innerWidth / BASE_WIDTH, innerHeight / BASE_HEIGHT);
      setScale(next || 1);
    };

    const handlePointerMove = (event) => {
      if (!dragRef.current.active) return;
      const dx = (event.clientX - dragRef.current.startX) / runtimeScale;
      const dy = (event.clientY - dragRef.current.startY) / runtimeScale;
      if (dragRef.current.target === "desktop") {
        setDesktopPos({
          x: dragRef.current.baseX + dx,
          y: dragRef.current.baseY + dy,
        });
      } else if (dragRef.current.target === "wiki") {
        setWikiPos({
          x: dragRef.current.baseX + dx,
          y: dragRef.current.baseY + dy,
        });
      }
    };

    const handlePointerUp = () => {
      dragRef.current.active = false;
      dragRef.current.target = null;
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  runtimeScale = scale;

  const startDrag = (event, target) => {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      active: true,
      target,
      startX: event.clientX,
      startY: event.clientY,
      baseX: target === "desktop" ? desktopPos.x : wikiPos.x,
      baseY: target === "desktop" ? desktopPos.y : wikiPos.y,
    };
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        background: "#05060c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          width: stage(BASE_WIDTH),
          height: stage(BASE_HEIGHT),
          background: "#05060c",
          borderRadius: stage(24),
        }}
      >
        <DesktopWindow position={desktopPos} width={IDE_WIDTH} onDragStart={(e) => startDrag(e, "desktop")} />
        <WikiWindow position={wikiPos} width={WIKI_WIDTH} onDragStart={(e) => startDrag(e, "wiki")} />
      </div>
    </div>
  );
}

function DesktopWindow({ position, width, onDragStart }) {
  return (
    <div
      style={{
        position: "absolute",
        left: stage(position.x),
        top: stage(position.y),
        width: stage(width),
        borderRadius: stage(10.3125),
        border: "1px solid rgba(148,163,184,0.24)",
        background: "#0b0f19",
        boxShadow: "0 32px 60px rgba(0,0,0,0.45)",
        overflow: "hidden",
      }}
    >
      <DesktopHeader onPointerDown={onDragStart} />
      <DesktopBody />
    </div>
  );
}

function DesktopHeader({ onPointerDown }) {
  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${stage(4.58333)} ${stage(10.3125)}`,
        borderBottom: "1px solid rgba(148,163,184,0.16)",
        background: "linear-gradient(180deg, rgba(21,29,48,1) 0%, rgba(11,15,25,1) 100%)",
        fontSize: stage(8.02083),
        cursor: "grab",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", gap: stage(6.875), color: "rgba(226,232,240,0.85)" }}>
        {["File", "Edit", "Selection", "View"].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", color: "#f8fafc" }}>Bug_Sumulation</div>
      <div style={{ display: "flex", gap: stage(4.58333) }}>
        {["#ef4444", "#f59e0b", "#22c55e"].map((color) => (
          <span key={color} style={{ width: stage(6.875), height: stage(6.875), borderRadius: "50%", background: color }} />
        ))}
      </div>
    </div>
  );
}

function DesktopBody() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${stage(120.312)} 1fr`,
        minHeight: stage(206.25),
        background: "linear-gradient(180deg, #060911 0%, #0f172a 100%)",
        borderBottom: "1px solid rgba(148,163,184,0.18)",
      }}
    >
      <aside
        style={{
          padding: stage(12.6042),
          borderRight: "1px solid rgba(148,163,184,0.18)",
          display: "flex",
          flexDirection: "column",
          gap: stage(3.4375),
          color: "rgba(226,232,240,0.82)",
          fontSize: stage(8.02083),
        }}
      >
        {sidebarItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              paddingLeft: stage(6.875 + item.level * 9.1667),
              fontFamily: item.prefix ? "JetBrains Mono, ui-monospace, monospace" : undefined,
              fontWeight: item.active ? 600 : item.weight || 300,
              color: item.active ? "#38bdf8" : undefined,
            }}
          >
            {item.label}
          </div>
        ))}
      </aside>
      <div style={{ padding: `${stage(10.3125)} ${stage(12.6042)}` }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: stage(7.44792),
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
            color: "rgba(226,232,240,0.75)",
            marginBottom: stage(6.875),
          }}
        >
          <span>components &gt; JS main.js &gt; Main &gt; controls</span>
          <span>main.js</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `${stage(25.2083)} 1fr`,
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
            fontSize: stage(7.44792),
            color: "#cbd5f5",
          }}
        >
          <div
            style={{
              background: "rgba(148,163,184,0.18)",
              padding: `${stage(4.58333)} ${stage(5.72917)}`,
              textAlign: "right",
              lineHeight: 1.6,
            }}
          >
            {codeLines.map((_, idx) => (
              <div key={idx} style={{ opacity: 0.6 }}>
                {String(idx + 1).padStart(2, "0")}
              </div>
            ))}
          </div>
          <pre
            style={{
              margin: 0,
              padding: `${stage(4.58333)} ${stage(10.3125)}`,
              background: "rgba(6,9,17,0.65)",
              borderRadius: stage(6.875),
              border: "1px solid rgba(148,163,184,0.35)",
              boxShadow: "inset 0 0 30px rgba(6,11,20,0.5)",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {codeLines.join("\n")}
          </pre>
        </div>
      </div>
    </div>
  );
}

function WikiWindow({ position, width, onDragStart }) {
  return (
    <div
      style={{
        position: "absolute",
        left: stage(position.x),
        top: stage(position.y),
        width: stage(width),
        borderRadius: stage(10.3125),
        border: "1px solid rgba(17,24,39,0.85)",
        boxShadow: "0 32px 60px rgba(0,0,0,0.45)",
        background: "#ffffff",
        color: "#111827",
        overflow: "hidden",
      }}
    >
      <div
        onPointerDown={onDragStart}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${stage(8.02083)} ${stage(11.4583)}`,
          borderBottom: "1px solid #111827",
          background: "rgba(255,255,255,0.92)",
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: stage(8.02083),
          cursor: "grab",
          userSelect: "none",
        }}
      >
        <div>http://localhost:3000/bug-visual-centipede</div>
        <div style={{ display: "flex", gap: stage(6.875), alignItems: "center" }}>
          <div
            style={{
              width: stage(9.16667),
              height: stage(9.16667),
              borderRadius: "50%",
              border: "2px solid #111827",
            }}
          />
          <div style={{ display: "flex", gap: stage(4.58333), alignItems: "center" }}>
            <input
              placeholder="Search Wikipedia"
              style={{
                border: "1px solid #111827",
                borderRadius: stage(2.29167),
                padding: `${stage(3.4375)} ${stage(5.72917)}`,
                fontSize: stage(8.02083),
              }}
            />
            <button
              style={{
                padding: `${stage(3.4375)} ${stage(10.3125)}`,
                border: "1px solid #111827",
                borderRadius: stage(2.29167),
                background: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              SEARCH
            </button>
          </div>
        </div>
      </div>
      <div style={{ padding: `${stage(16.0417)} ${stage(20.625)}` }}>
        <div style={{ display: "flex", gap: stage(17.1875) }}>
          <nav style={{ minWidth: stage(80.2083) }}>
            <div style={{ fontWeight: 600, marginBottom: stage(4.58333) }}>Contents</div>
            <div style={{ display: "flex", flexDirection: "column", gap: stage(3.4375), color: "#0369a1", fontSize: stage(8.02083) }}>
              {["Top", "History", "feature", "References"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </nav>
          <article style={{ flex: "1 1 0%", display: "flex", flexDirection: "column", gap: stage(11.4583) }}>
            <header>
              <h2 style={{ margin: 0, fontSize: stage(17.1875) }}>Bug(engineering)</h2>
              <p style={{ color: "#4b5563", fontSize: stage(8.02083), marginTop: stage(2.29167) }}>
                From Wikipedia, the free encyclopedia
              </p>
            </header>
            <div
              style={{
                border: "1px solid #111827",
                borderRadius: stage(3.4375),
                padding: stage(8.02083),
                lineHeight: 1.8,
                fontSize: stage(8.02083),
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
            <section style={{ display: "flex", gap: stage(16.0417) }}>
              <div style={{ flex: "1 1 0%", display: "flex", flexDirection: "column", gap: stage(8.02083), fontSize: stage(8.02083), lineHeight: 1.9 }}>
                {wikiParagraphs.map((paragraph, idx) => (
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
                  width: stage(154.688),
                  border: "1px solid #111827",
                  borderRadius: stage(5.72917),
                  padding: stage(5.72917),
                  textAlign: "center",
                  fontSize: stage(6.875),
                  lineHeight: 1.6,
                }}
              >
                <img
                  src="https://www.figma.com/api/mcp/asset/afa5f21d-8921-4487-9ea7-c45aba4df702"
                  alt="Calculator displaying syntax error"
                  style={{ width: "100%", borderRadius: stage(4.58333), marginBottom: stage(4.58333) }}
                />
                <figcaption>
                  A <a href="https://en.wikipedia.org/wiki/BASIC">BASIC</a> program failing due to a{" "}
                  <a href="https://en.wikipedia.org/wiki/Syntax_error">syntax error</a> in its code
                </figcaption>
              </figure>
            </section>
            <footer>
              <h3 style={{ margin: 0, fontSize: stage(14.8958) }}>History</h3>
              <div style={{ marginTop: stage(4.58333), borderBottom: "1px solid #111827" }} />
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}

function DesktopMenu({ onDragStart }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${stage(8)} ${stage(18)}`,
        borderBottom: "1px solid rgba(148,163,184,0.16)",
        background: "linear-gradient(180deg, rgba(21,29,48,1) 0%, rgba(11,15,25,1) 100%)",
        fontSize: stage(14),
        cursor: "grab",
        userSelect: "none",
      }}
      onPointerDown={onDragStart}
    >
      <div style={{ display: "flex", gap: stage(12) }}>
        {["File", "Edit", "Selection", "View"].map((item) => (
          <span key={item} style={{ color: "#e2e8f0", opacity: 0.85 }}>
            {item}
          </span>
        ))}
      </div>
      <div style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", color: "#f8fafc" }}>
        Bug_Sumulation
      </div>
      <div style={{ display: "flex", gap: stage(8) }}>
        {["#ef4444", "#f59e0b", "#22c55e"].map((color) => (
          <span
            key={color}
            style={{
              width: stage(12),
              height: stage(12),
              borderRadius: "50%",
              background: color,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function EditorPane() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${stage(210)} 1fr`,
        minHeight: stage(360),
        background: "linear-gradient(180deg, #060911 0%, #0f172a 100%)",
        borderBottom: "1px solid rgba(148,163,184,0.18)",
      }}
    >
      <div style={{ padding: stage(22), borderRight: "1px solid rgba(148,163,184,0.18)" }}>
        <SidebarTree />
      </div>
      <div style={{ padding: `${stage(18)} ${stage(22)}` }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: stage(13),
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
            color: "rgba(226,232,240,0.75)",
            marginBottom: stage(12),
          }}
        >
          <span>components &gt; JS main.js &gt; Main &gt; controls</span>
          <span>main.js</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `${stage(44)} 1fr`,
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
            fontSize: stage(13),
            color: "#cbd5f5",
          }}
        >
          <div
            style={{
              background: "rgba(148,163,184,0.18)",
              padding: `${stage(8)} ${stage(10)}`,
              textAlign: "right",
              lineHeight: 1.6,
            }}
          >
            {codeSnippet.map((_, idx) => (
              <div key={idx} style={{ opacity: 0.6 }}>
                {String(idx + 1).padStart(2, "0")}
              </div>
            ))}
          </div>
          <pre
            style={{
              margin: 0,
              padding: `${stage(8)} ${stage(18)}`,
              background: "rgba(6,9,17,0.65)",
              borderRadius: stage(12),
              border: "1px solid rgba(148,163,184,0.35)",
              boxShadow: "inset 0 0 30px rgba(6,11,20,0.5)",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {codeSnippet.join("\n")}
          </pre>
        </div>
      </div>
    </div>
  );
}

function SidebarTree() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: stage(6) }}>
      {sidebarItems.map((item, idx) => (
        <div
          key={idx}
          style={{
            paddingLeft: stage(12 + item.level * 16),
            fontSize: stage(14),
            color: item.active ? "#38bdf8" : "rgba(226,232,240,0.82)",
            fontWeight: item.weight || (item.active ? 600 : 300),
            fontFamily: item.prefix ? "JetBrains Mono, ui-monospace, monospace" : undefined,
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
