import { useEffect, useRef } from "react";
import { startBehaviorsForBugs } from "@/lib/bugBehaviors";

export default function useBehaviorEngine({ releasedBugIds = [], rootSelector = "#idle-root", intensity = 1 }) {
  const cleanupRef = useRef(null);
  useEffect(() => {
    const root = typeof document !== "undefined" ? document.querySelector(rootSelector) : null;
    if (!root) return;
    if (cleanupRef.current) {
      try { cleanupRef.current(); } catch {}
      cleanupRef.current = null;
    }
    if (releasedBugIds.length === 0) return;
    cleanupRef.current = startBehaviorsForBugs({ bugIds: releasedBugIds, root, intensity });
    return () => {
      if (cleanupRef.current) {
        try { cleanupRef.current(); } catch {}
        cleanupRef.current = null;
      }
    };
  }, [releasedBugIds, rootSelector, intensity]);
}


