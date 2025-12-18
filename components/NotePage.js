import Link from "next/link";
import noteCategories from "@/data/noteCategories";

const border = "1px solid rgba(255,255,255,0.18)";
const headerBg = "rgba(255,255,255,0.05)";

export default function NotePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060606",
        color: "#f6f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1280 }}>
        <div
          style={{
            color: "#fff",
            letterSpacing: 0.4,
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800 }}>Bug Taxonomy</div>
          <div style={{ fontSize: 14, color: "#c4c8d0" }}>클릭 시 상세 Note 이동</div>
        </div>

        <div
          style={{
            border,
            borderRadius: 10,
            overflow: "hidden",
            background: "rgba(255,255,255,0.02)",
            boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr 1fr 1.1fr",
              background: headerBg,
              borderBottom: border,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.2,
              color: "#e9edf4",
            }}
          >
            <div style={{ padding: "14px 16px" }}>과(버그 분류)</div>
            <div style={{ padding: "14px 16px" }}>종 (버그 이름)</div>
            <div style={{ padding: "14px 16px" }}>발생 원인</div>
            <div style={{ padding: "14px 16px" }}>시각적 결과</div>
          </div>

          {noteCategories.map((category, idx) => {
            const detailHref = `/Note_${category.id}_Detail`;
            const isLast = idx === noteCategories.length - 1;
            return (
              <Link
                key={category.id}
                href={detailHref}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.1fr 1fr 1fr 1.1fr",
                  textDecoration: "none",
                  color: "inherit",
                  borderBottom: isLast ? "none" : border,
                  background: "rgba(255,255,255,0.01)",
                  transition: "background 0.18s ease, transform 0.18s ease",
                }}
              >
                <div
                  style={{
                    padding: "16px 16px 14px",
                    borderRight: border,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{category.title}</div>
                    <div style={{ fontSize: 13, color: "#c4c8d0", marginTop: 4 }}>{category.subtitle}</div>
                  </div>
                </div>

                <div style={{ padding: "16px", borderRight: border }}>
                  {category.bugs.map((bug, bugIdx) => (
                    <div key={bug.name} style={{ fontSize: 14, lineHeight: 1.5, marginBottom: bugIdx === category.bugs.length - 1 ? 0 : 6 }}>
                      {bugIdx + 1}. {bug.name} ({bug.description})
                    </div>
                  ))}
                </div>

                <div style={{ padding: "16px", borderRight: border, fontSize: 13.5, lineHeight: 1.6, color: "#d8dbe3" }}>
                  {category.causes}
                </div>

                <div style={{ padding: "16px", fontSize: 13.5, lineHeight: 1.6, color: "#d8dbe3" }}>
                  {category.visualResult}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
