import Head from "next/head";
import { useEffect } from "react";
import WebIntroSection from "@/components/WebIntroSection";
import WebIntroBackground from "@/components/WebIntroBackground";

export default function WEB_Intro() {
  useEffect(() => {
    const bots = window.__bots || [];
    if (bots.length === 0) {
      window.__bots = [{
        kind: "spider",
        variant: "patch",
        scaleMultiplier: 1,
        segmentCount: 60,
      }];
    }
    let aborted = false;
    async function pingMcp() {
      try {
        const res = await fetch("/api/mcp/figma/ping").catch(() => null);
        if (!res || !res.ok) return;
        const data = await res.json().catch(() => ({}));
        if (!aborted) {
          // eslint-disable-next-line no-console
          console.log("[MCP] Figma MCP ping:", data);
        }
      } catch {
        // ignore
      }
    }
    pingMcp();
    return () => {
      aborted = true;
    };
  }, []);

  return (
    <>
      <Head>
        <title>WEB_Intro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "#000000",
          overflow: "hidden",
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', monospace",
        }}
      >
        <WebIntroBackground />
        {/* 화면 전체 어둡게 오버레이 (봇 위, 콘텐츠 아래) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.3)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <WebIntroSection />
        </div>
      </div>
    </>
  );
}

