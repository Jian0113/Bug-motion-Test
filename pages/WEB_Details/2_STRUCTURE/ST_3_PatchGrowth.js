import { useEffect } from "react";
import WebDetailTemplate from "@/components/WebDetailTemplate";

export default function ST3PatchGrowthPage() {
  useEffect(() => {
    const defaultBots = [
      { kind: "centipede", variant: "base", scaleMultiplier: 1, segmentCount: 60 },
      { kind: "gecko", variant: "base", scaleMultiplier: 1, segmentCount: 60 },
      { kind: "spider", variant: "patch", scaleMultiplier: 1, segmentCount: 60 },
    ];
    const bots = window.__bots || [];
    if (bots.length === 0) {
      window.__bots = defaultBots;
    } else {
      const existing = new Set(bots.map((b) => `${b.kind}-${b.variant}`));
      defaultBots.forEach((b) => {
        const key = `${b.kind}-${b.variant}`;
        if (!existing.has(key)) bots.push(b);
      });
      window.__bots = bots;
    }
  }, []);

  return <WebDetailTemplate slug="patch-growth" />;
}
