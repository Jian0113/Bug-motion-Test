import Head from "next/head";
import { useState } from "react";
import { introButtons, BugCard } from "@/components/intro-buttons";
import { computeGlassStyles } from "@/components/glass/glassLib";
import GlassSampleCard from "@/components/glass/GlassSampleCard";
import { Leva, useControls } from "leva";
import MiniCentipede from "@/components/glass/MiniCentipede";

export default function GlassStudy() {
  const [hovered, setHovered] = useState(-1);

  const {
    blurPx,
    opacity,
    saturationPct,
    borderAlpha,
    insetAlpha,
    radiusPx,
    shadowPx,
    applyToCard,
    applyToImage,
    hoverReleases,
    roughness,
    pixelMode,
    pixelSize,
  } = useControls("Glass", {
    blurPx: { value: 10, min: 0, max: 40, step: 1 },
    opacity: { value: 0.06, min: 0, max: 0.3, step: 0.01 },
    saturationPct: { value: 120, min: 0, max: 300, step: 1 },
    borderAlpha: { value: 0.22, min: 0, max: 1, step: 0.01 },
    insetAlpha: { value: 0.08, min: 0, max: 0.4, step: 0.01 },
    radiusPx: { value: 0, min: 0, max: 24, step: 1 },
    shadowPx: { value: 30, min: 0, max: 80, step: 1 },
    applyToCard: { value: true },
    applyToImage: { value: true },
    hoverReleases: { value: true },
    roughness: { value: 0.25, min: 0, max: 1, step: 0.01 },
    pixelMode: { value: "smooth", options: { Smooth: "smooth", Pixelated: "pixel" } },
    pixelSize: { value: 6, min: 2, max: 16, step: 1 },
  });

  const styles = computeGlassStyles({
    blurPx,
    opacity,
    saturationPct,
    borderAlpha,
    insetAlpha,
    radiusPx,
    shadowPx,
    roughness,
    pixelMode,
    pixelSize,
  });

  return (
    <>
      <Head>
        <title>Bugs Encyclopedia (Glass Study)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Leva collapsed={false} />
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#0a0a0a",
        color: "#e5e7eb",
        padding: 24,
        position: "relative",
      }}>
        <div className="grid-bg" />
        <header style={{
          width: "100%",
          maxWidth: 2000,
          padding: "24px 0",
          background: "rgba(0,0,0,0.3)",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}>
          <h1 style={{
            fontSize: 44,
            lineHeight: "1.2",
            letterSpacing: -1.2,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,monospace",
            margin: 0,
          }}>
            Bugs Encyclopedia — Glass Study
          </h1>
        </header>
        <div style={{
          width: "100%",
          maxWidth: 2000,
          background: "transparent",
          borderRadius: 0,
          padding: 40,
          boxShadow: "none",
          border: "none",
        }}>
          <div style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
            gap: 24,
          }}>
            {introButtons.map((c, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(-1)}
              >
                <BugCard
                  index={idx + 1}
                  label={c.label}
                  desc={c.desc}
                  mode={c.mode}
                  previewSrc={idx === 0 && c.mode === "centipede" ? undefined : c.previewSrc}
                  onOpen={() => {}}
                  style={{ ...(applyToCard ? (hoverReleases && hovered === idx ? styles.cardPlainStyle : styles.cardGlassStyle) : {}), minWidth: 420 }}
                  previewOverlayStyle={
                    applyToImage
                      ? (hoverReleases && hovered === idx ? styles.previewOverlayPlainStyle : styles.previewOverlayGlassStyle)
                      : undefined
                  }
                  previewChildren={
                    idx === 0 && c.mode === "centipede"
                      ? <MiniCentipede />
                      : null
                  }
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 24 }}>
            {[0,1,2].map((i) => (
              <GlassSampleCard
                key={i}
                title={`Sample #${i+1}`}
                subtitle="Glass Demo Card"
                style={applyToCard ? styles.cardGlassStyle : undefined}
                overlayStyle={applyToImage ? styles.previewOverlayGlassStyle : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}


