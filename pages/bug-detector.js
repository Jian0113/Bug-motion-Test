import Head from "next/head";
import BugDetectorPage from "@/components/BugDetectorPage";

export default function BugDetector() {
  return (
    <>
      <Head>
        <title>BugDetector</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <BugDetectorPage />
    </>
  );
}
