import { useEffect, useState } from "react";
import useDraggablePosition from "./useDraggablePosition";

let __zCounter = 20;

export default function DummyWindow({
  title = "Window",
  number = 1,
  initialPosition = { x: 12, y: 12 },
  width = 360,
  height = 180,
  children,
  background = "#000000",
  contentOverflow = "auto",
}) {
  const { position, startDrag } = useDraggablePosition(1, initialPosition);
  const [z, setZ] = useState(++__zCounter);
  useEffect(() => { setZ(++__zCounter); }, []); // mount -> front
  const bringToFront = () => setZ(++__zCounter);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width,
        height,
        background,
        border: "1px solid #ffffff",
        borderRadius: 0,
        color: "#e5e7eb",
        fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        zIndex: z,
      }}
    >
      <div
        onPointerDown={(e) => { bringToFront(); startDrag(e); }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px",
          borderBottom: "1px solid #ffffff",
          background: "#111111",
          userSelect: "none",
          cursor: "grab",
        }}
      >
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ color: "#ffffff", opacity: 0.9 }}>{String(number).padStart(2, "0")}</div>
      </div>
      <div style={{ padding: 12, fontSize: 12, lineHeight: "18px", flex: "1 1 auto", overflow: contentOverflow }}>
        {children || "이 영역은 더미 윈도우입니다. 원하는 내용을 주입하세요."}
      </div>
    </div>
  );
}


