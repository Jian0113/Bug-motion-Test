import Head from "next/head";
import { useRouter } from "next/router";
import One from "@/components/detail/1";
import Two from "@/components/detail/2";

const registry = {
  "1": One,
  "2": Two,
};

export default function DetailVariantPage() {
  const router = useRouter();
  const { id } = router.query;
  const Comp = id && registry[id] ? registry[id] : null;

  return (
    <>
      <Head>
        <title>Detail Variant {id || ""}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {Comp ? <Comp /> : <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>해당 id의 컴포넌트가 없습니다.</div>}
    </>
  );
}

