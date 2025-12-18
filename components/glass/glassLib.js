export function computeGlassStyles({
  blurPx = 10,
  opacity = 0.06,
  saturationPct = 120,
  borderAlpha = 0.22,
  insetAlpha = 0.08,
  radiusPx = 0,
  shadowPx = 30,
  roughness = 0,            // 0..1
  pixelMode = "smooth",     // "smooth" | "pixel"
  pixelSize = 6,            // px
} = {}) {
  const baseGlass = {
    background: `rgba(255,255,255,${opacity})`,
    border: `1px solid rgba(255,255,255,${borderAlpha})`,
    boxShadow: `0 8px ${shadowPx}px rgba(0,0,0,${0.25 + roughness * 0.25}), inset 0 0 0 1px rgba(255,255,255,${insetAlpha})`,
    backdropFilter: `blur(${blurPx}px) saturate(${saturationPct}%)`,
    WebkitBackdropFilter: `blur(${blurPx}px) saturate(${saturationPct}%)`,
    borderRadius: radiusPx,
  };
  // texture overlays
  const grainAlpha = Math.max(0, Math.min(1, roughness)) * 0.18; // subtle
  const gridAlpha = Math.max(0, Math.min(1, roughness)) * 0.12;
  const pixelBgImg =
    pixelMode === "pixel"
      ? `linear-gradient(rgba(255,255,255,${gridAlpha}) 1px, rgba(255,255,255,0) 1px),
         linear-gradient(90deg, rgba(255,255,255,${gridAlpha}) 1px, rgba(255,255,255,0) 1px)`
      : `repeating-linear-gradient(0deg, rgba(255,255,255,${grainAlpha}) 0 1px, transparent 1px 2px),
         repeating-linear-gradient(90deg, rgba(255,255,255,${grainAlpha}) 0 1px, transparent 1px 2px)`;
  const pixelBgSize =
    pixelMode === "pixel" ? `${pixelSize}px ${pixelSize}px, ${pixelSize}px ${pixelSize}px` : `2px 2px, 2px 2px`;
  const pixelMix = pixelMode === "pixel" ? "overlay" : "soft-light";

  const cardGlassStyle = baseGlass;
  const previewOverlayGlassStyle = {
    background: `rgba(255,255,255,${opacity})`,
    border: `1px solid rgba(255,255,255,${borderAlpha})`,
    backdropFilter: `blur(${blurPx}px) saturate(${saturationPct}%)`,
    WebkitBackdropFilter: `blur(${blurPx}px) saturate(${saturationPct}%)`,
    opacity: 1,
    borderRadius: radiusPx,
    backgroundImage: pixelBgImg,
    backgroundSize: pixelBgSize,
    mixBlendMode: pixelMix,
  };
  const cardPlainStyle = {
    background: "#0b0b0b",
    border: "1px solid rgba(255,255,255,0.4)",
    boxShadow: "none",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
    borderRadius: radiusPx,
  };
  const previewOverlayPlainStyle = {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0)",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
    opacity: 0,
    borderRadius: radiusPx,
    backgroundImage: "none",
  };
  return {
    cardGlassStyle,
    previewOverlayGlassStyle,
    cardPlainStyle,
    previewOverlayPlainStyle,
  };
}


