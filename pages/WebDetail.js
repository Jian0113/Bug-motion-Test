import Head from "next/head";

export default function WebDetail() {
  return (
    <>
      <Head>
        <title>Web Detail</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', monospace",
        }}
      >
        Web Detail 페이지
      </div>
    </>
  );
}
