import Head from "next/head";
import AboutPage from "@/components/AboutPage";

export default function About() {
  return (
    <>
      <Head>
        <title>About</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AboutPage />
    </>
  );
}
