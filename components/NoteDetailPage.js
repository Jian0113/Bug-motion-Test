import Head from "next/head";
import Link from "next/link";
import noteCategories from "@/data/noteCategories";

export default function NoteDetailPage({ categoryId }) {
  const category =
    noteCategories.find((c) => c.id === categoryId) ||
    noteCategories.find((c) => c.id.toLowerCase() === categoryId?.toLowerCase());

  const title = category?.title || "Unknown";
  const subtitle = category?.subtitle || "데이터가 없습니다.";

  return (
    <>
      <Head>
        <title>{`Note · ${title}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        style={{
          minHeight: "100vh",
          background: "#060606",
          color: "#f6f7fb",
          padding: "40px 24px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>{title}</div>
              <div style={{ fontSize: 15, color: "#c4c8d0", marginTop: 6 }}>{subtitle}</div>
            </div>
            <Link href="/note" style={{ color: "#7fb8ff", fontSize: 14 }}>
              ← 목록으로
            </Link>
          </div>

          {category ? (
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 12,
                padding: 20,
                background: "rgba(255,255,255,0.03)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
              }}
            >
              <Section title="버그 리스트">
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                  {category.bugs.map((bug) => (
                    <li key={bug.name}>
                      <strong>{bug.name}</strong> — {bug.description}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="발생 원인">
                <p style={{ margin: 0, lineHeight: 1.7 }}>{category.causes}</p>
              </Section>

              <Section title="시각적 결과">
                <p style={{ margin: 0, lineHeight: 1.7 }}>{category.visualResult}</p>
              </Section>
            </div>
          ) : (
            <div style={{ color: "#f47f7f" }}>카테고리를 찾을 수 없습니다.</div>
          )}
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "#e9edf4" }}>{title}</div>
      <div style={{ fontSize: 14, color: "#d8dbe3" }}>{children}</div>
      <div style={{ height: 6 }} />
    </div>
  );
}
