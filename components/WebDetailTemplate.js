import Main from "@/components/main";
import SideBar from "@/components/SideBar";
import { useEffect, useMemo, useState } from "react";
import { useBugs } from "@/context/BugContext";
import webIntroCards from "@/data/webIntroCards";
import { SIDEBAR_TREE } from "@/data/sidebarTree";

const SLUG_MODE = {
  overbloom: "centipede",
  "sparse-field": "centipede",
  "stack-spread": "centipede",
  "cause-slip": "centipede",
  "event-merge": "centipede",
  "result-loop": "centipede",
  ratiodrift: "gecko",
  macrobloom: "spider",
  minifade: "gecko",
  "scale-drift": "gecko",
  "shape-inflate": "gecko",
  "misalign-form": "gecko",
  amalgmation: "gecko",
  "patch-growth": "spider",
  colordrift: "spider",
  cachefootprint: "spider",
  "soft-edge": "spider",
  "dual-focus": "spider",
  "blurry-boundary": "spider",
  "logic-twist": "spider",
  "phase-mix": "spider",
  "loose-constraint": "spider",
  ghostprint: "spider",
};

const SPRITE_PATHS = {
  centipede: {
    head: "/1_parts_head.png",
    body: "/1_parts_body.png",
    legLeft: "/1_parts_Left.png",
    legRight: "/1_parts_Right.png",
    legLeft2: "/1_parts_Left_2.png",
    legRight2: "/1_parts_Right_2.png",
  },
  gecko: {
    head: "/Ratio_head.png",
    body: "/Ratio_Body.png",
    leg1: "/Ratio_leg_1.png",
    leg2: "/Ratio_leg_2.png",
  },
  // 스파이더 기본값을 PatchGrowth 자산으로 지정 (미로딩 방지)
  spider: {
    head: "/Spider/4_PatchGrowth_Sprite/head.png",
    body: "/Spider/4_PatchGrowth_Sprite/body.png",
    jaw1: "/Spider/4_PatchGrowth_Sprite/jaw_1.png",
    jaw2: "/Spider/4_PatchGrowth_Sprite/jaw_2.png",
    leg1L: "/Spider/4_PatchGrowth_Sprite/1_L.png",
    leg1R: "/Spider/4_PatchGrowth_Sprite/1_R.png",
    leg2L: "/Spider/4_PatchGrowth_Sprite/2_L.png",
    leg2R: "/Spider/4_PatchGrowth_Sprite/2_R.png",
    leg3L: "/Spider/4_PatchGrowth_Sprite/3_L.png",
    leg3R: "/Spider/4_PatchGrowth_Sprite/3R.png",
    leg4L: "/Spider/4_PatchGrowth_Sprite/4_L.png",
    leg4R: "/Spider/4_PatchGrowth_Sprite/4_R.png",
  },
};

// 슬러그별 스프라이트 교체(변형 버전 지정)
const SPRITE_PATH_OVERRIDES = {
  ratiodrift: {
    gecko: {
      // 14-15-14-15 순으로 번갈아 사용할 프레임 배열
      bodyFrames: ["/Ratio_Body-14.png", "/Ratio_Body-15.png"],
    },
  },
  "patch-growth": {
    spider: {
      head: "/Spider/4_PatchGrowth_Sprite/head.png",
      body: "/Spider/4_PatchGrowth_Sprite/body.png",
      jaw1: "/Spider/4_PatchGrowth_Sprite/jaw_1.png",
      jaw2: "/Spider/4_PatchGrowth_Sprite/jaw_2.png",
      leg1L: "/Spider/4_PatchGrowth_Sprite/1_L.png",
      leg1R: "/Spider/4_PatchGrowth_Sprite/1_R.png",
      leg2L: "/Spider/4_PatchGrowth_Sprite/2_L.png",
      leg2R: "/Spider/4_PatchGrowth_Sprite/2_R.png",
      leg3L: "/Spider/4_PatchGrowth_Sprite/3_L.png",
      leg3R: "/Spider/4_PatchGrowth_Sprite/3R.png",
      leg4L: "/Spider/4_PatchGrowth_Sprite/4_L.png",
      leg4R: "/Spider/4_PatchGrowth_Sprite/4_R.png",
    },
  },
};

const SPRITE_ROTATION_OFFSET = {};
const SPIDER_VARIANT_BY_SLUG = {
  macrobloom: "macro",
  ghostprint: "ghost",
  "patch-growth": "patch",
};
const FALLBACK_DESCRIPTION = "상세 설명이 없습니다.";
const FALLBACK_TYPE = "Indicia Deficiens / WHAT / CONTEXT";
const FALLBACK_TITLE = "Bug Detail";

const normalizeSlug = (value) => (value || "").toString().trim().toLowerCase();

export default function WebDetailTemplate({ slug, showControls = true }) {
  const { releaseBug } = useBugs();
  const [sidebarHover, setSidebarHover] = useState(false);

  const normalizedSlug = useMemo(() => normalizeSlug(slug), [slug]);
  const card = useMemo(
    () => webIntroCards.find((b) => normalizeSlug(b.slug) === normalizedSlug),
    [normalizedSlug]
  );
  const treeData = useMemo(() => SIDEBAR_TREE, []);
  const activeId = useMemo(() => normalizeSlug(card?.slug || slug), [card, slug]);
  const spiderVariant = useMemo(
    () => SPIDER_VARIANT_BY_SLUG[normalizedSlug] || "base",
    [normalizedSlug]
  );
  const initialOpen = useMemo(() => {
    if (normalizedSlug === "overbloom") return ["vibe", "quant"];
    return ["vibe", "ambiguity", "structure", "quant", "scale", "logic"];
  }, [normalizedSlug]);
  const initialMode =
    SLUG_MODE[normalizedSlug] || SLUG_MODE[normalizeSlug(card?.slug)] || "centipede";

  useEffect(() => {
    const markReleased = () => {
      const storageKey = `${initialMode}Released`;
      try {
        localStorage.setItem(storageKey, "1");
      } catch {}
      try {
        releaseBug(initialMode);
      } catch {}
    };

    const onBeforeUnload = () => markReleased();
    const onPageHide = () => markReleased();

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      markReleased();
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [initialMode, releaseBug]);

  const description = card?.popup?.description || FALLBACK_DESCRIPTION;
  const title = card?.popup?.bugTitle || card?.title || (slug ? `bug( ${slug} );` : FALLBACK_TITLE);
  const typeLabel = card?.popup?.bugType || FALLBACK_TYPE;

  const spritePaths = useMemo(() => {
    const base = {
      centipede: { ...(SPRITE_PATHS.centipede || {}) },
      gecko: { ...(SPRITE_PATHS.gecko || {}) },
      spider: { ...(SPRITE_PATHS.spider || {}) },
    };
    const override = SPRITE_PATH_OVERRIDES[normalizedSlug];
    if (override) {
      if (override.centipede) base.centipede = { ...base.centipede, ...override.centipede };
      if (override.gecko) base.gecko = { ...base.gecko, ...override.gecko };
      if (override.spider) base.spider = { ...base.spider, ...override.spider };
    }
    // patch-growth 전용 안전장치: spider 경로가 비어있으면 기본 패치 스프라이트로 채움
    if (SPIDER_VARIANT_BY_SLUG[normalizedSlug] === "patch") {
      base.spider = {
        head: base.spider?.head ?? "/Spider/4_PatchGrowth_Sprite/head.png",
        body: base.spider?.body ?? "/Spider/4_PatchGrowth_Sprite/body.png",
        jaw1: base.spider?.jaw1 ?? "/Spider/4_PatchGrowth_Sprite/jaw_1.png",
        jaw2: base.spider?.jaw2 ?? "/Spider/4_PatchGrowth_Sprite/jaw_2.png",
        ...(base.spider || {}),
      };
    }
    return base;
  }, [normalizedSlug]);

  return (
    <>
      <Main
        initialMode={initialMode}
        hideUI
        spritePaths={spritePaths}
        spriteRotationOffset={SPRITE_ROTATION_OFFSET}
        spiderVariant={spiderVariant}
        renderMouseFollower={false}
        showControls={showControls}
        autoReproEnabled={normalizedSlug === "overbloom"}
        scaleMultiplier={initialMode === "centipede" ? 1 : 1}
      />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5 }}>
        {/* Hover 시 캔버스 인터랙션 차단 */}
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 280, // 사이드바 영역은 비워서 클릭 가능
            zIndex: 4,
            pointerEvents: sidebarHover ? "auto" : "none",
          }}
        />

        <SideBar
          treeData={treeData}
          headerHeight={72}
          initialOpen={initialOpen}
          activeFileId={activeId}
          onHoverChange={setSidebarHover}
        />

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              minWidth: 0,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: "clamp(14px, 2.2vw, 22px)",
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', monospace",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "clamp(11px, 2vw, 14px)",
                color: "#c3c7cf",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                minWidth: 0,
                fontFamily: "'Noto Sans KR', 'JetBrains Mono', sans-serif",
                fontWeight: 300,
              }}
            >
              {typeLabel}
            </div>
          </div>

          <div style={{ height: 8 }} />
          <div
            style={{
              fontSize: "clamp(11px, 2vw, 14px)",
              lineHeight: 1.5,
              color: "#d5d7db",
              whiteSpace: "normal",
              wordBreak: "keep-all",
              overflowWrap: "break-word",
              width: "100%",
              fontFamily: "'Noto Sans KR', 'JetBrains Mono', sans-serif",
              fontWeight: 300,
            }}
          >
            {description}
          </div>
        </div>
      </div>
    </>
  );
}


