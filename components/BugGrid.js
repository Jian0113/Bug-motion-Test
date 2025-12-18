import { BUGS } from "@/lib/bugBehaviors";

export default function BugGrid({ onSelect }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: 20,
    }}>
      {BUGS.map((bug) => (
        <button
          key={bug.id}
          onClick={() => onSelect && onSelect(bug)}
          style={{
            position: "relative",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "linear-gradient(180deg, #0b1120, #0a0a0a)",
            color: "#e5e7eb",
            borderRadius: 0,
            padding: 16,
            textAlign: "left",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.75 }}>ID</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.5, color: bug.color }}>{bug.name}</div>
          <div style={{ marginTop: 8, fontSize: 12, color: "rgba(203,213,225,0.9)" }}>
            {bug.behaviors.join(" + ")}
          </div>
          <div style={{
            position: "absolute",
            right: -20, bottom: -12,
            width: 120, height: 120,
            background: `radial-gradient(circle, ${bug.color}33, transparent 60%)`,
            filter: "blur(4px)",
          }} />
        </button>
      ))}
    </div>
  );
}


