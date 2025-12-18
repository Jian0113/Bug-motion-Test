import { createContext, useCallback, useContext, useMemo, useState } from "react";

const BugCtx = createContext(null);

export function BugProvider({ children }) {
  const [released, setReleased] = useState([]); // array of bug ids
  const [selectedBugId, setSelectedBugId] = useState(null);

  const releaseBug = useCallback((id) => {
    setReleased((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);
  const clearReleased = useCallback(() => setReleased([]), []);

  const value = useMemo(() => ({
    released,
    selectedBugId,
    setSelectedBugId,
    releaseBug,
    clearReleased,
  }), [released, selectedBugId, releaseBug, clearReleased]);

  return <BugCtx.Provider value={value}>{children}</BugCtx.Provider>;
}

export function useBugs() {
  const ctx = useContext(BugCtx);
  if (!ctx) throw new Error("useBugs must be used within BugProvider");
  return ctx;
}


