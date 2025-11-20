import Head from "next/head";
import { useMemo, useState } from "react";
import { BugProvider, useBugs } from "@/context/BugContext";
import BackgroundCodeLayer from "@/components/BackgroundCodeLayer";
import BugGrid from "@/components/BugGrid";
import BugModal from "@/components/BugModal";
import useBehaviorEngine from "@/hooks/useBehaviorEngine";
import { BUGS } from "@/lib/bugBehaviors";

function IdleInner() {
  const { released, selectedBugId, setSelectedBugId, releaseBug } = useBugs();
  const [intensity, setIntensity] = useState(1.4);
  useBehaviorEngine({ releasedBugIds: released, rootSelector: "#idle-root", intensity });

  const selectedBug = useMemo(() => BUGS.find((b) => b.id === selectedBugId) || null, [selectedBugId]);

  return (
    <>
      <Head>
        <title>WEB-ART: Imaginary Bugs</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div id="idle-root" style={{
        minHeight: "100vh",
        position: "relative",
        background: "#05060c",
        color: "#e5e7eb",
        overflow: "hidden",
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
      }}>
        <BackgroundCodeLayer lines={120} />
        <header style={{
          position: "relative",
          zIndex: 2,
          padding: "24px 28px",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div data-duplicate data-reposition style={{ fontSize: 28, letterSpacing: 1, fontWeight: 800, textShadow: "0 0 12px rgba(0,255,255,0.24)" }}>
            12 IMAGINARY BUGS — CONTROLLED CHAOS
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ fontSize: 12, opacity: 0.8 }}>INTENSITY</label>
            <input
              type="range"
              min={0.4}
              max={5}
              step={0.1}
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              style={{ width: 180 }}
            />
          </div>
        </header>
        <main style={{
          position: "relative",
          zIndex: 2,
          padding: 28,
          maxWidth: 1400,
          margin: "0 auto",
        }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 12 }}>
            Released: {released.length} / 12
          </div>
          <BugGrid onSelect={(bug) => setSelectedBugId(bug.id)} />
        </main>
      </div>
      {selectedBug && (
        <BugModal
          bug={selectedBug}
          onCloseRelease={() => {
            releaseBug(selectedBug.id);
            setSelectedBugId(null);
          }}
          onCancel={() => setSelectedBugId(null)}
        />
      )}
    </>
  );
}

export default function DetailOne() {
  return (
    <BugProvider>
      <IdleInner />
    </BugProvider>
  );
}


