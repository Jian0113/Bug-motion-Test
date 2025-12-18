import Main from "@/components/main";
import { useEffect, useMemo, useState } from "react";
import { useBugs } from "@/context/BugContext";
import SideBar from "@/components/SideBar";
import { SIDEBAR_TREE } from "@/data/sidebarTree";

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

  const treeData = useMemo(() => SIDEBAR_TREE, []);

  const HEADER_HEIGHT = 72;

  return (
    <>
      <Main
        initialMode="centipede"
        hideUI
        spritePaths={spritePaths}
        spriteRotationOffset={spriteRotationOffset}
        showControls
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        {/* 사이드바 */}
        <SideBar
          treeData={treeData}
          headerHeight={HEADER_HEIGHT}
          initialOpen={["vibe", "ambiguity", "structure", "causality", "quant", "scale", "logic", "traditional"]}
        />

        {/* 우측 하단 설명 패널 */}
        <div
          style={{
            position: "absolute",
            right: 24,
            bottom: 24,
            maxWidth: 440,
            width: "38vw",
            minWidth: 260,
            background: "transparent",
            border: "none",
            color: "#e8e8e8",
            padding: 0,
            boxSizing: "border-box",
            pointerEvents: "auto",
            backdropFilter: "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Bug ( Amount );</div>
            <div style={{ fontSize: 12, color: "#c3c7cf" }}>Indicia Deficiens / WHAT / CONTEXT</div>
          </div>
          <div style={{ height: 8 }} />
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "#d5d7db" }}>
            이 종은 “얼마나”라는 지시가 빠졌을 때 나타나는 시각적 변종이다. 필요 수량을 못받아 한두 개만
            놓이거나, 반대로 폭주하여 화면을 가득 채우기도 한다. 사용자가 클릭하면 순한하듯 개체가 번식하며
            1-&gt;2-&gt;4-&gt;16으로 기하급수적으로 늘어난다. 통제되지 않은 증식은 화면을 장식해 아름답게
            만들기도 하지만, 순간적으로 생태계를 전복시키는 과열 상태를 남기기도 한다.
          </div>
        </div>
      </div>
    </>
  );
}

