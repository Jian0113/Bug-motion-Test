import Head from "next/head";
import { useState } from "react";
import dynamic from "next/dynamic";

// 동적 로드로 클라이언트 전용 캔버스 의존성 회피
const MainCanvas = dynamic(() => import("@/components/main"), { ssr: false });

export default function Home() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [activeMode, setActiveMode] = useState("centipede");

  const cards = [
    { key: "centipede", label: "Centipede", desc: "마우스를 따라가는 지네" },
    { key: "gecko", label: "Gecko", desc: "다리 스텝이 있는 게코" },
    { key: "spider", label: "Spider", desc: "거미 렌더" },
  ];

  const openOverlay = (mode) => {
    setActiveMode(mode);
    setOverlayOpen(true);
  };

  return (
    <>
      <Head>
        <title>Bugs Encyclopedia</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#e5e7eb",
        padding: 24,
        position: "relative",
      }}>
        <div className="grid-bg" />
        <div style={{
          width: "100%",
          maxWidth: 1120,
          background: "transparent",
          borderRadius: 16,
          padding: 40,
          boxShadow: "none",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{
            width: "100%",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 12,
            padding: "24px 32px",
            marginBottom: 24,
            background: "rgba(0,0,0,0.3)",
          }}>
            <h1 style={{
              fontSize: 44,
              lineHeight: "1.2",
              letterSpacing: -1.2,
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,monospace",
            }}>
              Bugs Encyclopedia
            </h1>
          </div>

          <div style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {cards.map((c, idx) => (
              <button
                key={c.key}
                onClick={() => openOverlay(c.key)}
                style={{
                  textAlign: "left",
                  background: "#0b0b0b",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: 12,
                  padding: 16,
                  cursor: "pointer",
                  transition: "all .2s ease",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,monospace",
                  fontSize: 14,
                  color: "#d1d5db",
                  paddingBottom: 8,
                  borderBottom: "1px solid rgba(255,255,255,0.16)",
                  marginBottom: 12,
                }}>
                  <span style={{ color: "#9ca3af" }}>#{idx + 1}</span>
                  <span style={{ color: "#93c5fd" }}>Bug</span>
                  <span style={{ color: "#9ca3af" }}>(</span>
                  <span style={{ color: "#f59e0b" }}>{c.label}</span>
                  <span style={{ color: "#9ca3af" }}>)</span>
                  <span style={{ color: "#9ca3af" }}>;</span>
                </div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 0 }}>{c.desc}</div>
                <div style={{
                  height: 180,
                  marginTop: 12,
                  borderRadius: 8,
                  background: "#000000",
                  border: "1px solid rgba(255,255,255,0.4)",
                }} />
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <a href="/bug-visual" style={{
              padding: "10px 16px",
              borderRadius: 10,
              background: "#111827",
              color: "#fff",
              fontSize: 14,
              border: "1px solid rgba(255,255,255,0.16)",
            }}>전체 데모 보기</a>
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
            width: "min(100%, 1100px)",
            height: "min(90vh, 720px)",
            background: "#0b1020",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <button
              onClick={() => setOverlayOpen(false)}
              aria-label="닫기"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 10,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(11,16,32,0.7)",
                color: "#e5e7eb",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
            <MainCanvas initialMode={activeMode} hideUI />
          </div>
        </div>
      )}
    </>
  );
}
