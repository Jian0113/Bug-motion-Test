import "@/styles/globals.css";
import { BugProvider } from "@/context/BugContext";
import HeaderBar from "@/components/HeaderBar";

export default function App({ Component, pageProps }) {
  return (
    <BugProvider>
      <HeaderBar />
      <div
        style={{
          paddingTop: 60,
          background: "#000000",
          minHeight: "100vh",
          color: "#ffffff",
        }}
      >
        <Component {...pageProps} />
      </div>
    </BugProvider>
  );
}
