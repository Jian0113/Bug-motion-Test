import "@/styles/globals.css";
import { BugProvider } from "@/context/BugContext";

export default function App({ Component, pageProps }) {
  return (
    <BugProvider>
      <Component {...pageProps} />
    </BugProvider>
  );
}
