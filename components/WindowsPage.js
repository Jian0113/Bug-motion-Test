import { useEffect, useState } from "react";
import { BugCard } from "@/components/intro-buttons";
import DummyWindow from "@/components/windows/DummyWindow";
import CmdWindow from "@/components/windows/CmdWindow";
import ConsoleWindow from "@/components/windows/ConsoleWindow";
import XRayWindow from "@/components/windows/XRayWindow";
import dynamic from "next/dynamic";

export default function WindowsPage({ open, onClose, selected }) {
  const [overlayStage, setOverlayStage] = useState("card"); // 'card' | 'text'
  const [overlayGrow, setOverlayGrow] = useState(false);
  const MainCanvas = dynamic(() => import("@/components/main"), { ssr: false });
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
      background: "rgba(0,0,0,0.6)", // index 페이지 어둡게
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    }}>
      {/* overlay 전용 마우스-팔로우 지네 (배경 투명) */}
      <div style={{ position: "fixed", inset: 0, zIndex: 49, pointerEvents: "none" }}>
        <MainCanvas initialMode="centipede" hideUI showControls={false} zIndex={49} spritePaths={spritePaths} />
      </div>
      <div
        className="overlay-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
        position: "relative",
        width: "min(100%, 1800px)",
        height: "min(50%, 900px",
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
        {/* 흰색 반투명 글라스 바닥 레이어 */}
        <div style={{
          position: "absolute",
          inset: 6,
          border: "2px solid rgba(255,255,255,0.9)",
          borderRadius: 0,
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(2px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          pointerEvents: "none",
          zIndex: 0,
        }} />
        <button
          onClick={onClose}
          aria-label="닫기"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            width: 36,
            height: 36,
            padding: 0,
            borderRadius: 2,
            border: "2px solid #ffffff",
            background: "rgba(255,255,255,0.08)",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: 22,
            lineHeight: "32px",
            textAlign: "center",
            boxShadow: "0 10px 32px rgba(0,0,0,0.5)",
          }}
        >
          ✕
        </button>

        {/* 중앙 큰 카드 -> 더미 윈도우 안에 넣어 이동 가능 */}
        <DummyWindow
          title="X-ray Window"
          number={1}
          initialPosition={{ x: 760, y: -10 }}  // 우측 큰 창
          width={420}
          height={620}
          background="transparent"
        >
          <BugCard
            index={selected.index}
            label={selected.data.label}
            desc={selected.data.desc}
            mode={selected.data.mode}
            previewSrc={overlayStage === "card" ? selected.data.previewSrc : undefined}
            videoSrc={selected.data.videoSrc && overlayStage === "text" ? selected.data.videoSrc : undefined}
            onOpen={() => {}}
            style={{
              transform: "none",
              transition: "none",
              pointerEvents: "none",
              minWidth: 420,
            }}
          />
        </DummyWindow>

        {/* Draggable dummy windows (numbered) */}
        <DummyWindow
          title="Command Prompt"
          number={1}
          initialPosition={{ x: -60, y: -180 }}
          width={1040}
          height={640}
          contentOverflow="hidden"
        >
          <CmdWindow fontScale={3.6} />
        </DummyWindow>

        <DummyWindow
          title="X-ray Window"
          number={2}
          initialPosition={{ x: 0, y: 400 }}
          width={560}
          height={520}
          contentOverflow="hidden"
        >
          <XRayWindow width={520} height={480} />
        </DummyWindow>

        <DummyWindow
          title="Console"
          number={3}
          initialPosition={{ x: 120, y: 320 }}
          width={560}
          height={220}
          contentOverflow="hidden"
        >
          <ConsoleWindow />
        </DummyWindow>

        {/* 우측 하단 추가 Command Prompt */}
        <DummyWindow
          title="Command Prompt"
          number={4}
          initialPosition={{ x: 980, y: 420 }}
          width={640}
          height={420}
          contentOverflow="hidden"
        >
          <CmdWindow fontScale={2.6} />
        </DummyWindow>
      </div>
    </div>
  );
}


