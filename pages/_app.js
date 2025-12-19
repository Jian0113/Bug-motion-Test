import "@/styles/globals.css";
import { BugProvider } from "@/context/BugContext";
import HeaderBar from "@/components/HeaderBar";

export default function App({ Component, pageProps }) {
  if (typeof window !== "undefined" && !window.__agentFetchPatched) {
    const AGENT_ENDPOINT = "http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d";
    const originalFetch = window.fetch;
    window.__agentFetchPatched = true;
    window.fetch = (...args) => {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
      if (url && url.startsWith(AGENT_ENDPOINT)) {
        return Promise.resolve();
      }
      return originalFetch(...args);
    };
  }

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
