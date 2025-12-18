export default function GlassSampleCard({ title = "Glass Card", subtitle = "Demo", style = {}, overlayStyle = {} }) {
  return (
    <div style={{ ...style, padding: 20, minHeight: 220, position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", ...overlayStyle }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#e5e7eb" }}>{title}</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "#9ca3af" }}>{subtitle}</div>
        <div style={{ marginTop: 12, color: "#cbd5e1", lineHeight: 1.7 }}>
          Adjustable glassmorphism card. Tweak blur, opacity, saturation, border and radius with Leva.
        </div>
      </div>
    </div>
  );
}






