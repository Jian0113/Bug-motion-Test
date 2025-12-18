import { useEffect } from "react";

/**
 * Generic overlay popup used by WEB_Intro.
 * - Transparent black panel without border
 * - Dims whole page while open
 * - Close via X button, overlay click, or ESC key
 */
export default function WebIntroPopup({
  open,
  onClose,
  children,
  maxWidth = "75vw",
  maxHeight = "auto",
  overlayOpacity = 0.6,
  panelOpacity = 0.8,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: `rgba(0,0,0,${overlayOpacity})`,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', monospace",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: maxWidth,
          height: maxHeight,
          maxWidth: "960px",
          maxHeight: "645px",
          aspectRatio: "941 / 561",
          background: `rgba(0,0,0,${panelOpacity})`,
          border: "none",
          boxShadow: "0 0 0 rgba(0,0,0,0)",
          overflow: "auto",
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', monospace",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            width: 36,
            height: 36,
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 20,
            lineHeight: "36px",
            zIndex: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
          }}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

