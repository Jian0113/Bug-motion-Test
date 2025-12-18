import webIntroCards from "@/data/webIntroCards";

export default function BugDetailPage({ bugId }) {
  const bug = webIntroCards.find((b) => b.id === bugId);

  if (!bug) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        해당 버그 데이터를 찾을 수 없습니다.
      </div>
    );
  }

  const { title, imageSrc, popup } = bug;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: 20,
            boxSizing: "border-box",
          }}
        >
          <img
            src={imageSrc}
            alt={title}
            style={{ width: "100%", height: "100%", maxHeight: 420, objectFit: "contain" }}
          />
        </div>
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: 24,
            boxSizing: "border-box",
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800 }}>{popup?.title || title}</div>
          <div style={{ fontSize: 14, color: "#c3c7cf" }}>{popup?.fileName}</div>
          <div style={{ fontSize: 15, lineHeight: 1.7 }}>{popup?.description}</div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Bug DNA</div>
            <ul style={{ paddingLeft: 18, margin: 0, color: "#dfe1e6", lineHeight: 1.5 }}>
              {(popup?.dnaPrompt || []).map((item, idx) => (
                <li key={idx}>
                  {item.label}: {item.value}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Examples</div>
            <ul style={{ paddingLeft: 18, margin: 0, color: "#dfe1e6", lineHeight: 1.5 }}>
              {(popup?.examples || []).map((item, idx) => (
                <li key={idx}>
                  <div style={{ fontWeight: 700 }}>{item.prompt}</div>
                  <div style={{ fontSize: 13, color: "#b9bec7" }}>{item.good}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
