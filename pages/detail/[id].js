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
      <div style={{ minHeight: "100vh", background: "#0b1020", color: "#cbd5e1", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 600 }}>Detail Variants</div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="/detail/1" style={{ color: "#93c5fd" }}>1</a>
            <a href="/detail/2" style={{ color: "#93c5fd" }}>2</a>
          </div>
        </div>
        {Comp ? <Comp /> : <div>해당 id의 컴포넌트가 없습니다.</div>}
      </div>
    </>
  );
}



