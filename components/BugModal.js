import { useMemo } from "react";

export default function BugModal({ bug, onCloseRelease, onCancel }) {
  const code = useMemo(() => {
    const header = `// ${bug?.name || "Unknown Bug"} — Corrupted Fragment`;
    const body = [
      "function corrupt(env){",
      "  const seed = Math.random() * 0xffff;",
      "  for(let i=0;i<128;i++){",
      "    env.noise(i ^ seed).shake(i*7);",
      "    env.glitch(i).saturate((i%7)+1);",
      "    env.text(i).duplicate().warp();",
      "  }",
      "  return env.commit();",
      "}",
    ].join("\n");
    return `${header}\n${body}`;
  }, [bug]);

  if (!bug) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    }}>
      <div style={{
        width: "min(100%, 920px)",
        background: "linear-gradient(180deg, #0b1120, #0a0a0a)",
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 0,
        padding: 16,
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 16,
        color: "#e5e7eb",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
      }}>
        <div style={{ borderRight: "1px solid rgba(255,255,255,0.12)", paddingRight: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Bug</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1, color: bug.color }}>{bug.name}</div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>Behaviors</div>
          <div style={{ fontSize: 13 }}>{bug.behaviors.join(" + ")}</div>
          <div style={{
            marginTop: 16,
            height: 140,
            border: "1px solid rgba(255,255,255,0.2)",
            background: `radial-gradient(circle at 60% 60%, ${bug.color}33 0 40%, transparent 60%)`,
          }} />
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button onClick={onCloseRelease} style={{
              padding: "8px 12px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "#111827",
              color: "#e5e7eb",
              borderRadius: 0,
              cursor: "pointer",
              fontSize: 12,
            }}>Close & Release</button>
            <button onClick={onCancel} style={{
              padding: "8px 12px",
              border: "1px solid rgba(255,255,255,0.16)",
              background: "transparent",
              color: "#cbd5e1",
              borderRadius: 0,
              cursor: "pointer",
              fontSize: 12,
            }}>Cancel</button>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Corrupted Code</div>
          <pre style={{
            marginTop: 8,
            whiteSpace: "pre-wrap",
            padding: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(8,10,20,0.8)",
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
            fontSize: 12,
            lineHeight: "18px",
            color: "#a5b4fc",
            textShadow: "0 0 12px rgba(99,102,241,0.28)",
            minHeight: 260,
          }}>{code}</pre>
        </div>
      </div>
    </div>
  );
}


