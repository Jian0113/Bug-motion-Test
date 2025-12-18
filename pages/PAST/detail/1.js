import Head from "next/head";
import Main from "@/components/main";

export default function DetailOneGecko() {
  return (
    <>
      <Head>
        <title>Gecko — Mouse Follow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Main
        initialMode="gecko"
        hideUI={false}
        renderMouseFollower
        disableBots
        showControls
        segmentCount={60}
        zIndex={2}
        backgroundColor="#000000"
        spritePaths={{
          gecko: {
            head: "/Ratio_head.png",
            body: "/Ratio_Body.png",
            leg1: "/Ratio_leg_1.png",
            leg2: "/Ratio_leg_2.png",
          },
        }}
      />
    </>
  );
}

