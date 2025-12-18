import dynamic from "next/dynamic";
import Image from "next/image";
import { memo, useCallback, useRef, useState, useEffect } from "react";
import WebIntroPopup from "@/components/WebIntroPopup";
import BugPopupContent from "@/components/BugPopupContent";
import webIntroCards from "@/data/webIntroCards";

// 캔버스 기반 카드에서만 SSR 비활성화
const MainCanvas = dynamic(() => import("@/components/main"), { ssr: false });

function BugCard({
  index,
  title,
  imageSrc,
  imageFit = "contain",
  videoSrc,
  children,
  bg = "#0f0f10",
  onClick,
  folderOnly = false,
  hideIndex = false,
}) {
  const [isHover, setIsHover] = useState(false);
  const floatStyle = {
    animation: "bugFloat 3.4s ease-in-out infinite alternate",
    animationDelay: `${(index % 5) * 0.18}s`,
    willChange: "transform",
  };

  return (
    <div
      style={{
        cursor: "pointer",
        display: "block",
        background: "transparent",
        padding: 0,
        margin: 0,
        position: "relative",
      }}
      role="button"
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div style={{ ...floatStyle, position: "relative" }}>
        {videoSrc ? (
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              transform: isHover ? "scale(1.08)" : "scale(1)",
              boxShadow: "none",
              filter: isHover
                ? "drop-shadow(0 0 12px rgba(0,255,0,0.75)) drop-shadow(0 0 24px rgba(0,255,0,0.45))"
                : "none",
              transition: "transform 220ms ease-in-out, filter 220ms ease-in-out",
              position: "relative",
              zIndex: 1,
            }}
          />
        ) : (
          <img
            src={imageSrc}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              transform: isHover ? "scale(1.08)" : "scale(1)",
              boxShadow: "none",
              filter: isHover
                ? "drop-shadow(0 0 12px rgba(0,255,0,0.75)) drop-shadow(0 0 24px rgba(0,255,0,0.45))"
                : "none",
              transition: "transform 220ms ease-in-out, filter 220ms ease-in-out",
              position: "relative",
              zIndex: 1,
            }}
          />
        )}
      </div>
    </div>
  );
}

function WebIntroSection({ cards = webIntroCards }) {
  const introImages = [
    "/IntroBugCard/최종스프라이트-01.png",
    "/IntroBugCard/최종스프라이트-02.png",
    "/IntroBugCard/최종스프라이트-03.png",
    "/IntroBugCard/최종스프라이트-04.png",
    "/IntroBugCard/최종스프라이트-05.png",
    "/IntroBugCard/최종스프라이트-06.png",
    "/IntroBugCard/최종스프라이트-07.png",
    "/IntroBugCard/최종스프라이트-08.png",
    "/IntroBugCard/최종스프라이트-09.png",
    "/IntroBugCard/최종스프라이트-10.png",
    "/IntroBugCard/최종스프라이트-11.png",
    "/IntroBugCard/최종스프라이트-12.png",
  ];
  const [openIndex, setOpenIndex] = useState(null);
  const close = useCallback(() => setOpenIndex(null), []);
  const heroRef = useRef(null);

  // hero 영역 위치/스타일 디버그 로그
  useEffect(() => {
    if (!heroRef.current) return;
    const el = heroRef.current;
    const rect = el.getBoundingClientRect();
    const styles = getComputedStyle(el);
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "B",
        location: "WebIntroSection.js:hero",
        message: "Hero block rect/z-index/pointer",
        data: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          zIndex: styles.zIndex,
          pointerEvents: styles.pointerEvents,
          position: styles.position,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero */}
      <div ref={heroRef} style={{ padding: "100px 240px 100px 240px" }}>
        <div
          style={{
            paddingInline: 12,
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: 0.5,
            textShadow: "0 0 8px rgba(255,255,255,0.15)",
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', monospace",
            color: "rgb(0, 255, 0)",
          }}
        >
          VibeCodingBUGEncyclopedia.com
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "0 240px 60px 240px", flex: 1 }}>
        <div className="bug-grid">
          {cards.map(({ id, title, imageSrc, render, imageFit, bg }, idx) => {
            // Hide cards after the provided IntroBugCard set (only first 11 shown)
            if (idx >= 11) return null;
            const injectedImage = introImages[idx] || imageSrc;
            return (
              <BugCard
                key={id}
                index={id}
                title={title}
                imageSrc={injectedImage}
                imageFit={imageFit}
                bg={bg}
                folderOnly={false}
                videoSrc={undefined}
                hideIndex={false}
                onClick={() => setOpenIndex(id)}
              >
                {render ? render() : null}
              </BugCard>
            );
          })}
        </div>
      </div>

      {/* Popup */}
      <WebIntroPopup open={openIndex !== null} onClose={close}>
        {openIndex !== null && (
          <BugPopupContent
            data={{
              ...cards.find((card) => card.id === openIndex)?.popup,
              imageSrc: cards.find((card) => card.id === openIndex)?.imageSrc,
              videoSrc: cards.find((card) => card.id === openIndex)?.videoSrc,
              detailRoute: cards.find((card) => card.id === openIndex)?.detailRoute,
            }}
          />
        )}
      </WebIntroPopup>
      <style jsx>{`
        .bug-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 32px;
        }
        @keyframes bugFloat {
          from {
            transform: translateY(-2px);
          }
          to {
            transform: translateY(3px);
          }
        }
        @media (min-width: 2000px) {
          .bug-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }
        @media (max-width: 1280px) {
          .bug-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 900px) {
          .bug-grid {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default memo(WebIntroSection);
