import { useEffect, useState } from "react";
import { BugCard } from "@/components/intro-buttons";
import CodeWindow from "@/components/windows/CodeWindow";
import WikiWindow from "@/components/windows/WikiWindow";
import DummyWindow from "@/components/windows/DummyWindow";

export default function WindowsPage({ open, onClose, selected }) {
  const [overlayStage, setOverlayStage] = useState("card"); // 'card' | 'text'
  const [overlayGrow, setOverlayGrow] = useState(false);

  useEffect(() => {
    if (open) {
      setOverlayStage("card");
      setOverlayGrow(false);
      const t1 = setTimeout(() => setOverlayGrow(true), 20);
      const t2 = setTimeout(() => setOverlayStage("text"), 520);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setOverlayGrow(false);
      setOverlayStage("card");
    }
  }, [open, selected?.index]);

  if (!open || !selected) return null;

  return (
    <div
      className="overlay-backdrop"
      onClick={onClose}
      style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    }}>
      <div
        className="overlay-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
        position: "relative",
        width: "min(100%, 1200px)",
        height: "auto",
        background: "transparent",
        borderRadius: 0,
        overflow: "visible",
        boxShadow: "none",
        border: "none",
          display: "flex",
          flexWrap: "wrap",
        gap: 24,
        alignItems: "flex-start",
        padding: 12,
      }}>
        <button
          onClick={onClose}
          aria-label="닫기"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            width: 32,
            height: 32,
            padding: 0,
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.6)",
            background: "rgba(17,24,39,0.9)",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: "32px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          X
        </button>

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

        <CodeWindow selected={selected} stage={overlayStage} />
        <WikiWindow selected={selected} />

        {/* Draggable dummy windows (numbered) */}
        <DummyWindow
          title="Command Prompt"
          number={1}
          initialPosition={{ x: 360, y: -120 }}
          width={760}
          height={220}
        >
{`Microsoft Windows [Version 10.0.26200.7171]
(c) Microsoft Corporation. All rights reserved.

C:\\Users\\user>`}
        </DummyWindow>

        <DummyWindow
          title="X-ray Window"
          number={2}
          initialPosition={{ x: -40, y: 280 }}
          width={280}
          height={220}
        >
{`>> Safe!
>> Safe!`}
        </DummyWindow>

        <DummyWindow
          title="Window A"
          number={3}
          initialPosition={{ x: -60, y: 100 }}
          width={300}
          height={260}
        >
{`이 영역은 더미입니다. 쉽게 옮길 수 있어요.`}
        </DummyWindow>
      </div>
    </div>
  );
}


