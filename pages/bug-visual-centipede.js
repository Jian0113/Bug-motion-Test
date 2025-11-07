import Main from "@/components/main";

export default function BugVisualCentipedePage() {
  const spritePaths = {
    centipede: {
      head: "/1_parts_head.svg",
      // body: use single centered body sprite
      body: "/1_parts_body.svg",
      // legs per side
      legLeft: "/1_parts_Left.svg",
      legRight: "/1_parts_Right.svg",
      legLeft2: "/1_parts_Left_2.svg",
      legRight2: "/1_parts_Right_2.svg",
    },
  };
  // 필요 시 회전 오프셋(deg)으로 방향 보정 가능
  const spriteRotationOffset = {
    // 예) head: -90,
    // 예) bodyLeft: 0, bodyRight: 0, bodyLeft2: 0, bodyRight2: 0,
    // 예) legLeft: 0, legRight: 0,
  };
  return <Main initialMode="centipede" hideUI spritePaths={spritePaths} spriteRotationOffset={spriteRotationOffset} showControls />;
}


