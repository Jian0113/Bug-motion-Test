import Main from "@/components/main";
import { useEffect, useState } from "react";
import { useBugs } from "@/context/BugContext";
import CodeWindow from "@/components/windows/CodeWindow";
import WikiWindow from "@/components/windows/WikiWindow";

export default function BugVisualCentipedePage() {
  const { releaseBug } = useBugs();
  // 화면 비율에 맞춰 창 스케일 계산 (Detail/2와 동일한 기준)
  const BASE_WIDTH = 1920;
  const BASE_HEIGHT = 1080;
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const updateScale = () => {
      const { innerWidth, innerHeight } = window;
      const next = Math.min(innerWidth / BASE_WIDTH, innerHeight / BASE_HEIGHT);
      setScale(next || 1);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);
  // 페이지를 떠날 때(닫기/뒤로가기 포함) 지네 탈출 기록
  useEffect(() => {
    const markReleased = () => {
      try {
        localStorage.setItem("centipedeReleased", "1");
      } catch {}
      try {
        releaseBug("centipede");
      } catch {}
    };
    const onBeforeUnload = () => markReleased();
    const onPageHide = () => markReleased();
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      markReleased(); // 컴포넌트 언마운트 시에도 기록
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [releaseBug]);

  const spritePaths = {
    centipede: {
      head: "/1_parts_head.png",
      // body: use single centered body sprite
      body: "/1_parts_body.png",
      // legs per side
      legLeft: "/1_parts_Left.png",
      legRight: "/1_parts_Right.png",
      legLeft2: "/1_parts_Left_2.png",
      legRight2: "/1_parts_Right_2.png",
    },
  };
  // 필요 시 회전 오프셋(deg)으로 방향 보정 가능
  const spriteRotationOffset = {
    // 예) head: -90,
    // 예) bodyLeft: 0, bodyRight: 0, bodyLeft2: 0, bodyRight2: 0,
    // 예) legLeft: 0, legRight: 0,
  };
  return (
    <>
      <Main
        initialMode="centipede"
        hideUI
        spritePaths={spritePaths}
        spriteRotationOffset={spriteRotationOffset}
        showControls
      />
      {/* CodeWindow: 캔버스 아래 (지네가 위로 지나감) */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
          <CodeWindow scale={scale} width={1186.202} height={1040} />
        </div>
      </div>
      {/* WikiWindow: 최상단 레이어 (지네를 가림) */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 4 }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
          <WikiWindow scale={scale} width={650.621} height={520} />
        </div>
      </div>
    </>
  );
}


