import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>인트로</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        flexDirection: "column",
      }}>
        인트로 페이지 입니다
        <a href="/bug-visual" style={{
          marginTop: 16,
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          textDecoration: "none",
          color: "#111827",
          background: "#f3f4f6",
        }}>Bug Visual 열기</a>
      </div>
    </>
  );
}
