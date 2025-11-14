import { useCallback, useEffect, useState } from "react";
import CodeWindow from "@/components/windows/CodeWindow";
import WikiWindow from "@/components/windows/WikiWindow";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

const IDE_WIDTH = 1186.202;
const IDE_DEFAULT_POS = { x: 51.0148, y: 47.94 };
const WIKI_WIDTH = 650.621;
const WIKI_DEFAULT_POS = { x: 462.365, y: 315.653 };
const IDE_HEIGHT = 1040; // 2x 높이
const WIKI_HEIGHT = 520; // 절반 높이

export default function DetailTwo() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (typeof window === "undefined") return;
      const { innerWidth, innerHeight } = window;
      const next = Math.min(innerWidth / BASE_WIDTH, innerHeight / BASE_HEIGHT);
      setScale(next || 1);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const stage = useCallback((value) => `${value * scale}px`, [scale]);

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
          borderRadius: 0,
        }}
      >
        <CodeWindow scale={scale} initialPosition={IDE_DEFAULT_POS} width={IDE_WIDTH} height={IDE_HEIGHT} />
        <WikiWindow scale={scale} initialPosition={WIKI_DEFAULT_POS} width={WIKI_WIDTH} height={WIKI_HEIGHT} />
      </div>
    </div>
  );
}
