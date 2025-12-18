import Head from "next/head";
import NotePage from "@/components/NotePage";

export default function Note() {
  return (
    <>
      <Head>
        <title>Note</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <NotePage />
    </>
  );
}
