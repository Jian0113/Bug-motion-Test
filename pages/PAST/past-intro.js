import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { introButtons, BugCard } from "@/components/intro-buttons";
import { useBugs } from "@/context/BugContext";
import WindowsPage from "@/components/WindowsPage";
import BackgroundCodeLayer from "@/components/BackgroundCodeLayer";

// 동적 로드로 클라이언트 전용 캔버스 의존성 회피
const MainCanvas = dynamic(() => import("@/components/main"), { ssr: false });

export default function Home() {
  const { released, releaseBug, clearReleased } = useBugs();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [activeMode, setActiveMode] = useState("centipede");
  const [centipedeEscaped, setCentipedeEscaped] = useState(false);
  const [centipedeVisible, setCentipedeVisible] = useState(false);

  const spritePaths = {
    centipede: {
      head: "/1_parts_head.png",
      body: "/1_parts_body.png",
      leg: "/1_parts_Left.png",
      legLeft: "/1_parts_Left.png",
      legRight: "/1_parts_Right.png",
      legLeft2: "/1_parts_Left_2.png",
      legRight2: "/1_parts_Right_2.png",
    },
  };

  // 초기 진입 시 상태를 유지하도록 변경 (배경 상태를 임의로 리셋하지 않음)

  // localStorage에서 탈출 여부 복구(+Context 동기화)
  useEffect(() => {
    let escaped = false;
    try {
      escaped = localStorage.getItem("centipedeReleased") === "1";
    } catch {}
    if (escaped) {
      setCentipedeEscaped(true);
      try { releaseBug("centipede"); } catch {}
    }
  }, [releaseBug]);
  // Context(released) 변화 시 반영
  useEffect(() => {
    if (released?.includes("centipede")) {
      setCentipedeEscaped(true);
    }
  }, [released]);

  // 버튼 데이터는 components/intro-buttons 폴더의 개별 파일(n1~n12.js)로 모듈화됨

  const openOverlay = (mode) => {
    setActiveMode(mode);
    setOverlayOpen(true);
    setCentipedeVisible(false); // 창 열리면 지네 숨김
  };

  const closeOverlay = () => {
    setOverlayOpen(false);
    setCentipedeVisible(true); // 창 닫으면 지네 표시
  };

  const selected = useMemo(() => {
    const idx = introButtons.findIndex((b) => b.mode === activeMode);
    return { data: introButtons[idx >= 0 ? idx : 0], index: (idx >= 0 ? idx : 0) + 1 };
  }, [activeMode]);

  // 배경 지네 클릭 → 카드로 복귀
  useEffect(() => {
    const onReturn = () => {
      setCentipedeVisible(false);
    };
    window.addEventListener("centipedeReturn", onReturn);
    return () => window.removeEventListener("centipedeReturn", onReturn);
  }, []);

  return (
    <>
      <Head>
        <title>Cyberbug Taxidermy Museum</title>
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
        <BackgroundCodeLayer lines={140} mode="typeScroll" typeSpeed={70} scrollSpeed={18} />
        {/* 배경 지네: Window 닫힌 뒤에만 표시 */}
        {!overlayOpen && centipedeVisible && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
          <MainCanvas
            initialMode="centipede"
            hideUI
            spritePaths={spritePaths}
            showControls={false}
            zIndex={1}
            renderMouseFollower={false}
            spawnSingleBot
          />
          </div>
        )}
        <div className="grid-bg" />
        {/* Header */}
        <header style={{
          width: "100%",
          maxWidth: 2000,
          padding: "24px 0",
          background: "rgba(0,0,0,0.3)",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          position: "relative",
          zIndex: 2,
        }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              display: "inline-block",
              padding: "12px 24px",
              border: "1px solid rgba(255,255,255,0.35)",
              background: "rgba(0,0,0,0.35)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
            }}>
              <h1 style={{
                fontSize: 48,
                lineHeight: "1.2",
                letterSpacing: 1,
                fontWeight: 900,
                color: "#ffffff",
                textAlign: "center",
                fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,monospace",
                margin: 0,
                textShadow: "0 0 8px rgba(255,255,255,0.35), 0 0 22px rgba(0,255,255,0.25)",
              }}>
                Cyberbug Taxidermy Museum
              </h1>
            </div>
          </div>
        </header>
        <div style={{
          width: "100%",
          maxWidth: 2000,
          
          background: "transparent",
          borderRadius: 0,
          padding: 40,
          boxShadow: "none",
          border: "none",
          position: "relative",
          zIndex: 2,
        }}>

          <div style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
            gap: 24,
          }}>
            {introButtons.map((c, idx) => {
              const isFirstCentipede = idx === 0 && c.mode === "centipede";
              if (isFirstCentipede && centipedeVisible) {
                // 섹션 프레임은 유지하고, 미리보기 영역 중앙에 404만 표시
                return (
                  <BugCard
                    key={idx}
                    index={idx + 1}
                    label={c.label}
                    desc={c.desc}
                    mode={c.mode}
                    onOpen={() => {}}
                    previewChildren={
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        pointerEvents: "none"
                      }}>
                        <div style={{
                          color: "#ff3b3b",
                          fontSize: 96,
                          fontWeight: 900,
                          letterSpacing: 6
                        }}>404</div>
                        <div style={{
                          color: "#ff3b3b",
                          fontSize: 26,
                          fontWeight: 800,
                          letterSpacing: 3
                        }}>Not Found</div>
                      </div>
                    }
                    statusText="Stuffing Fail!!"
                    statusColor="#ff3b3b"
                    statusDotColor="#ff3b3b"
                  />
                );
              }
              return (
                <BugCard key={idx}
                  index={idx + 1}
                  label={c.label}
                  desc={c.desc}
                  mode={c.mode}
                  previewSrc={c.previewSrc}
                  videoSrc={isFirstCentipede ? c.videoSrc : undefined}
                  onOpen={openOverlay}
                />
              );
            })}
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
        <WindowsPage
          open={overlayOpen}
          onClose={closeOverlay}
          selected={selected}
        />
      )}
    </>
  );
}

