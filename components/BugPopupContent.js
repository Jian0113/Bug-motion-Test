import Link from "next/link";
import { useEffect, useRef } from "react";

export default function BugPopupContent({ data }) {
  const {
    // 새 필드 (지정명)
    bugName,
    bugTitle,
    bugType,
    visualResults,
    prompts,
    // 기존 필드 (호환용)
    title = "Bug ( Amount );",
    fileName = "Nomal.js",
    description = "이 종은 “얼마나”라 조사가 빠졌을 때 나타나는 시각적 변종이다. 필요 수량을 못받아 한두 개만 놓이거나, 반대로 폭주하는 화면을 가득 채우기도 한다. 사용자가 클릭하면 순한하듯 개체가 번식하여 1->2->4->16으로 기하급수적으로 늘어난다. 통제되지 않은 증식은 화면을 장식해 아름답게 만들기도 하지만, 순각적으로 생태계를 전복시키는 과열 상태를 남기기도 한다.",
    dnaPrompt = [
      { label: "WHAT", value: "결과물지시 부족증" },
      { label: "Rules / Constraints", value: "조건지시 부족증" },
    ],
    examples = [
      {
        prompt: '"이미지 여러 개 배치해주세요."',
        good: "‘여러개’라고만 하면 AI가 임의로 예상한 것보다 적게 혹은 많게 생성해버림 좋은 예 : 다음 이미지를 가로 20px 간격으로 15개씩생성해줘",
      },
      {
        prompt: '"패턴으로 화면에 꽉 차게는 아니고 그냥 적당히 남겨줘."',
        good: "‘적당히’라고만 하면 AI가 임의로 예상한 것보다 적게 혹은 많게 생성해버림 좋은 예 : 다음 이미지를 가로 20px 간격으로 15개씩생성해줘",
      },
    ],
    ctaLabel = "Detail",
    footerNote = "Detail Page를 통해 Bug 집중 관찰",
    imageSrc = "/bugs/1.svg",
    detailRoute = "/PAST/bug-visual-centipede",
    videoSrc = null,
  } = data || {};

  const detailPanelRef = useRef(null);
  const rootRef = useRef(null);
  const detailButtonRef = useRef(null);

  const sendLog = (payload) => {
    const body = {
      sessionId: "debug-session",
      ...payload,
      timestamp: Date.now(),
    };
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {
      navigator?.sendBeacon?.(
        "http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d",
        JSON.stringify(body)
      );
    });
    // #endregion
  };

  useEffect(() => {
    const btn = detailButtonRef.current;
    const panel = detailPanelRef.current;
    const log = (hypothesisId, message, data) =>
      sendLog({
        runId: "pre-fix-3",
        hypothesisId,
        location: "components/BugPopupContent.js:detailButton",
        message,
        data,
      });

    if (btn) {
      const styles = getComputedStyle(btn);
      log("H1", "button computed styles", {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        filter: styles.filter,
        opacity: styles.opacity,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        mixBlendMode: styles.mixBlendMode,
        textShadow: styles.textShadow,
        boxShadow: styles.boxShadow,
      });
      log("H2", "button class list", {
        className: btn.className,
      });
      log("H3", "button text", { text: btn.innerText });
      const rect = btn.getBoundingClientRect();
      log("H4", "button rect", {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      });
      const inlineColor = btn.getAttribute("style");
      log("H5", "button inline style attr", { style: inlineColor });
      requestAnimationFrame(() => {
        const after = getComputedStyle(btn);
        log("H6", "button computed styles after RAF", {
          color: after.color,
          backgroundColor: after.backgroundColor,
          borderColor: after.borderColor,
          mixBlendMode: after.mixBlendMode,
          textShadow: after.textShadow,
        });
      });
    } else {
      log("H0", "button missing", {});
    }

    if (panel) {
      const styles = getComputedStyle(panel);
      log("H1", "panel computed styles", {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        mixBlendMode: styles.mixBlendMode,
        filter: styles.filter,
      });
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const log = (message, data) =>
      sendLog({
        runId: "pre-fix-3",
        hypothesisId: "H8",
        location: "components/BugPopupContent.js:root",
        message,
        data,
      });
    const styles = getComputedStyle(root);
    log("root computed", {
      transform: styles.transform,
      animationName: styles.animationName,
      animationDuration: styles.animationDuration,
      opacity: styles.opacity,
    });
    requestAnimationFrame(() => {
      const s2 = getComputedStyle(root);
      log("root computed after RAF", {
        transform: s2.transform,
        animationName: s2.animationName,
        animationDuration: s2.animationDuration,
        opacity: s2.opacity,
      });
    });
  }, []);

  const resolvedBugName = bugName ?? fileName;
  const resolvedBugTitle = bugTitle ?? title;
  const resolvedBugType = bugType ?? "Indicia Deficiens / WHAT / CONTEXT";
  // Visual results 섹션을 전역 비활성화
  const resolvedVisualResults = "";
  const promptList =
    prompts && prompts.length
      ? prompts
      : examples && examples.length
        ? examples.map((ex) => ex.prompt).filter(Boolean)
        : [];

  const renderVerticalType = (text) =>
    (text || "").split("").map((char, idx) => (
      <span
        key={`${char}-${idx}`}
        className="vertical-type-char"
        style={{ animationDelay: `${idx * 0.05}s` }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));

  return (
    <>
      <div
        ref={rootRef}
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          width: "100%",
          height: "100%",
          color: "#eaeaea",
          gap: 24,
          padding: 24,
          boxSizing: "border-box",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          position: "relative",
          animation: "popupEase 320ms ease-in-out",
        }}
      >
        {/* Left: visual */}
        <div
          style={{
            position: "relative",
            background: "#090909",
            border: "1px solid #222",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
        {/* header removed to show video only */}
          <div
            style={{
              position: "relative",
              flex: 1,
              background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05), rgba(0,0,0,0.9))",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 20,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "24px 24px, 24px 24px",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 50,
                border: "1px solid rgba(255,255,255,0.25)",
                boxSizing: "border-box",
              }}
            />
            {videoSrc ? (
              <video
                src={videoSrc}
                autoPlay
                loop
                muted
                defaultMuted
                playsInline
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: 0,
                }}
              />
            ) : (
              <img
                src={imageSrc}
                alt={title}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: 32,
                }}
              />
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderTop: "1px solid #222",
              background: "rgba(0,0,0,0.4)",
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 700 }}>Indicia Deficiens</div>
            <div style={{ color: "#9fa3aa" }}>목적, 결과물, 조건이 없는 것이 문제</div>
          </div>
        </div>

        {/* Right: detail */}
        <div
          className="detail-panel type-appear"
          ref={detailPanelRef}
          style={{
            background: "transparent",
            border: "1px solid transparent",
            boxShadow: "none",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            color: "rgb(0,255,0)",
            fontSize: 12,
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', monospace",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4 }} className="type-title">
              {renderVerticalType(resolvedBugTitle)}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.4 }}>{resolvedBugType}</div>
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.6 }}>{description}</div>

          {resolvedVisualResults ? (
            <div
            className="transparent-box"
              style={{
              background: "transparent",
              border: "1px solid transparent",
                padding: 12,
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {resolvedVisualResults}
            </div>
          ) : null}

          {promptList && promptList.length ? (
            <div className="prompt-grid">
              {promptList.map((prompt, idx) => (
                <div
                  key={idx}
                  className="transparent-box"
                  style={{
                    border: "1px solid transparent",
                    background: "transparent",
                    padding: 12,
                    fontSize: 12,
                    minHeight: 60,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{`"${prompt}"`}</div>
                </div>
              ))}
            </div>
          ) : null}

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13 }}>{footerNote}</div>
            <Link href={detailRoute}>
              <button
                className="detail-button"
                ref={detailButtonRef}
                style={{
                  padding: "10px 18px",
                  background: "rgb(0,255,0)",
                  color: "#000000",
                  border: "1px solid rgb(0,255,0)",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {ctaLabel}
              </button>
            </Link>
          </div>
        </div>
      </div>
      <style jsx>{`
        .detail-panel {
          color: rgb(0, 255, 0) !important;
        }
        .detail-panel :not(.detail-button):not(.detail-button *) {
          color: rgb(0, 255, 0) !important;
        }
        .detail-panel .detail-button,
        .detail-panel .detail-button * {
          color: #000 !important;
        }
        .transparent-box {
          background: transparent !important;
          border-color: transparent !important;
          box-shadow: none !important;
        }
        .type-appear {
          overflow: hidden;
          animation: typeIn 1.6s steps(30, end) forwards;
          opacity: 0;
        }
        .type-title {
          display: inline-flex;
          flex-wrap: wrap;
          gap: 0;
        }
        .vertical-type-char {
          display: inline-block;
          opacity: 0;
          transform: translateY(-10px);
          animation: dropIn 0.25s ease-out forwards;
        }
        @keyframes dropIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes typeIn {
          from {
            opacity: 0;
            clip-path: inset(0 100% 0 0);
          }
          to {
            opacity: 1;
            clip-path: inset(0 0 0 0);
          }
        }
        .prompt-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .detail-button {
          color: #000 !important;
          background: rgb(0, 255, 0) !important;
          border-color: rgb(0, 255, 0) !important;
        }
        @keyframes popupEase {
          from {
            transform: scale(0.94);
            opacity: 0.6;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @media (max-width: 1100px) {
          .prompt-grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          }
        }
      `}</style>
    </>
  );
}
