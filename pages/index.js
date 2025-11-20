import Head from "next/head";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { introButtons, BugCard } from "@/components/intro-buttons";

// 동적 로드로 클라이언트 전용 캔버스 의존성 회피
const MainCanvas = dynamic(() => import("@/components/main"), { ssr: false });

export default function Home() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [activeMode, setActiveMode] = useState("centipede");
  const [overlayStage, setOverlayStage] = useState("card"); // 'card' | 'text'
  const [overlayGrow, setOverlayGrow] = useState(false);

  // 버튼 데이터는 components/intro-buttons 폴더의 개별 파일(n1~n12.js)로 모듈화됨

  const openOverlay = (mode) => {
    setActiveMode(mode);
    setOverlayStage("card");
    setOverlayGrow(false);
    setOverlayOpen(true);
    // 살짝 커지는 애니메이션 후 텍스트 노출
    setTimeout(() => setOverlayGrow(true), 20);
    setTimeout(() => setOverlayStage("text"), 520);
  };

  const closeOverlay = () => {
    setOverlayOpen(false);
    setOverlayGrow(false);
    setOverlayStage("card");
  };

  const selected = useMemo(() => {
    const idx = introButtons.findIndex((b) => b.mode === activeMode);
    return { data: introButtons[idx >= 0 ? idx : 0], index: (idx >= 0 ? idx : 0) + 1 };
  }, [activeMode]);

  return (
    <>
      <Head>
        <title>Bugs Encyclopedia</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#0a0a0a",
        color: "#e5e7eb",
        padding: 24,
        position: "relative",
      }}>
        <div className="grid-bg" />
        {/* Header */}
        <header style={{
          width: "100%",
          maxWidth: 2000,
          padding: "24px 0",
          background: "rgba(0,0,0,0.3)",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}>
          <h1 style={{
            fontSize: 44,
            lineHeight: "1.2",
            letterSpacing: -1.2,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,monospace",
            margin: 0,
          }}>
            Bugs Encyclopedia
          </h1>
        </header>
        <div style={{
          width: "100%",
          maxWidth: 2000,
          
          background: "transparent",
          borderRadius: 0,
          padding: 40,
          boxShadow: "none",
          border: "none",
        }}>

          <div style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
            gap: 24,
          }}>
            {introButtons.map((c, idx) => (
              <BugCard key={idx}
                index={idx + 1}
                label={c.label}
                desc={c.desc}
                mode={c.mode}
                previewSrc={c.previewSrc}
                onOpen={openOverlay}
              />
            ))}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <a href="/bug-visual" style={{
              padding: "10px 16px",
              borderRadius: 0,
              background: "#111827",
              color: "#fff",
              fontSize: 14,
              border: "1px solid rgba(255,255,255,0.16)",
            }}>전체 데모 보기</a>
            <a href="/detail/1" style={{
              padding: "10px 16px",
              borderRadius: 0,
              background: "#111827",
              color: "#fff",
              fontSize: 14,
              border: "1px solid rgba(255,255,255,0.16)",
              textDecoration: "none",
            }}>1.js</a>
            <a href="/detail/2" style={{
              padding: "10px 16px",
              borderRadius: 0,
              background: "#111827",
              color: "#fff",
              fontSize: 14,
              border: "1px solid rgba(255,255,255,0.16)",
              textDecoration: "none",
            }}>2.js</a>
          </div>
        </div>
      </div>

      {overlayOpen && (
        <div className="overlay-backdrop" style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
        }}>
          <div className="overlay-panel" style={{
            position: "relative",
            width: "min(100%, 1200px)",
            height: "auto",
            background: "transparent", // 투명
            borderRadius: 0,
            overflow: "visible",
            boxShadow: "none",
            border: "none",
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
            padding: 12,
          }}>
            <button
              onClick={closeOverlay}
              aria-label="닫기"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 10,
                padding: 4,
                borderRadius: 0,
                border: "none",
                background: "transparent",
                color: "#e5e7eb",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: "18px",
              }}
            >
              x
            </button>

            {/* 확대 카드 */}
            <BugCard
              index={selected.index}
              label={selected.data.label}
              desc={selected.data.desc}
              mode={selected.data.mode}
              previewSrc={overlayStage === "card" ? selected.data.previewSrc : undefined}
              videoSrc={selected.data.videoSrc && overlayStage === "text" ? selected.data.videoSrc : undefined}
              onOpen={() => {}}
              style={{
                transform: overlayGrow ? "scale(1.08)" : "scale(0.96)",
                transition: "transform 450ms ease",
                pointerEvents: "none",
                minWidth: 420,
              }}
            />

            {/* 우측 더미 텍스트 */}
            <div style={{
              width: 420,
              color: "#cbd5e1",
              fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,monospace",
              fontSize: 12,
              lineHeight: "18px",
              opacity: overlayStage === "text" ? 1 : 0,
              transition: "opacity 350ms ease",
              whiteSpace: "pre-wrap",
            }}>
{`name( ${selected.data.label} );\n\nreturn{\n  steps: [\n    'initialize()',\n    'setupScene()',\n    'drawSegments()',\n    'animate()',\n    'cleanup()',\n  ],\n  note: '이 영역은 더미 텍스트입니다. 실제 설명을 넣어주세요.'\n};\n\n// click 'x' to close`}
              <div style={{ marginTop: 12 }}>
                <a href={selected.index === 1 ? "/bug-visual-centipede" : "/bug-visual-centipede"} style={{
                  padding: "8px 12px",
                  border: "1px solid rgba(255,255,255,0.4)",
                  color: "#e5e7eb",
                  textDecoration: "none",
                  background: "transparent",
                }}>Detail</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
