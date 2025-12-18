export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/WEB_Intro",
      permanent: false,
    },
  };
}

export default function Index() {
  // 리다이렉트 전용. CSR 환경 대비 안전한 빈 렌더링.
  return null;
}
