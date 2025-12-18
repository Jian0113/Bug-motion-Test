import Head from "next/head";
import { buildDetailById } from "@/data/noteDetailBuilder";

export default function NoteStructureDetail() {
  const detail = buildDetailById("STRUCTURE");
  const { categoryNumber, categoryTitle, categorySubtitle, headline, descriptionLines, cards } = detail;

  return (
    <>
      <Head>
        <title>{`Note · ${categoryTitle}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#070707", color: "#f6f7fb" }}>
        <div style={{ maxWidth: 1480, margin: "0 auto", padding: "28px 28px 48px" }}>
          <NavBar />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "360px 1fr",
              gap: 28,
              alignItems: "start",
            }}
          >
            <LeftPanel
              number={categoryNumber}
              title={categoryTitle}
              subtitle={categorySubtitle}
              headline={headline}
              descriptionLines={descriptionLines}
            />

            <CardsGrid cards={cards} />
          </div>
        </div>
      </div>
    </>
  );
}

function NavBar() {
  const navText = { fontSize: 15, fontWeight: 600, color: "#f6f7fb" };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 0 18px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ ...navText, fontSize: 16, letterSpacing: 0.3 }}>VibeCodingBUGEncyclopedia</div>
        <div style={navText}>Note</div>
        <div style={navText}>BugDetector</div>
        <div style={navText}>About</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ ...navText, color: "#cfd3da" }}>VibeCodingBug.js - Indicia Deficiens - Nomal</div>
        <div style={{ ...navText, fontSize: 14 }}>KR / EN</div>
      </div>
    </div>
  );
}

function LeftPanel({ number, title, subtitle, headline, descriptionLines }) {
  const labelStyle = { fontSize: 14, color: "#cfd3da" };
  return (
    <div style={{ paddingRight: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#f6f7fb" }}>{number}</div>
        <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: 0.4, color: "#f6f7fb" }}>{title}</div>
      </div>
      <div style={{ fontSize: 15, color: "#f6f7fb", marginBottom: 14 }}>{subtitle}</div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#f6f7fb" }}>{headline}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, lineHeight: 1.6, color: "#d8dbe3" }}>
        {descriptionLines.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
      <div style={{ height: 24 }} />
      <div style={{ ...labelStyle, fontWeight: 600 }}>{title}</div>
    </div>
  );
}

function CardsGrid({ cards }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 18,
      }}
    >
      {cards.map((card) => (
        <Card key={card.title} card={card} />
      ))}
    </div>
  );
}

function Card({ card }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.26)",
        borderRadius: 4,
        overflow: "hidden",
        background: "rgba(255,255,255,0.02)",
        boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "10px 14px",
          background: "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 800, color: "#f6f7fb" }}>{card.title}</div>
        <div style={{ fontSize: 13, color: "#cfd3da" }}>{card.subtitle}</div>
        <div
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 13,
            color: "#cfd3da",
          }}
        >
          {card.number}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          background: "#0d0d0d",
          minHeight: 340,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 14,
        }}
      >
        <img
          src={card.image}
          alt={card.title}
          style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "screen" }}
        />
      </div>

      <div style={{ padding: "14px 16px 12px", borderTop: "1px solid rgba(255,255,255,0.16)" }}>
        {card.causeLines.map((line, idx) => (
          <div key={idx} style={{ fontSize: 13.5, lineHeight: 1.5, color: "#d8dbe3", marginBottom: 6 }}>
            {line}
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
        {card.prompts.map((prompt) => (
          <div
            key={prompt}
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: 6,
              padding: "10px 12px",
              fontSize: 13,
              color: "#e6e8ed",
            }}
          >
            {prompt}
          </div>
        ))}
      </div>
    </div>
  );
}
