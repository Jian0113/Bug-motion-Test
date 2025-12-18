import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

export default function SideBar({
  treeData = [],
  headerHeight = 72,
  initialOpen = [],
  iconSrc = "/WhiteBugicon.svg",
  activeFileId = null,
  onHoverChange = () => {},
}) {
  const router = useRouter();
  const STORAGE_KEY = "sidebarOpenFolders";
  const [openFolders, setOpenFolders] = useState(() => new Set(initialOpen));
  const [hydrated, setHydrated] = useState(false);
  const [activeFile, setActiveFile] = useState(activeFileId ?? null);

  // 초기 렌더 시 저장된 오픈 상태 복원 (있으면 우선)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          setOpenFolders(new Set(arr));
        }
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  // 오픈 상태 변경 시 저장
  useEffect(() => {
    if (!hydrated) return;
    try {
      const arr = Array.from(openFolders);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch {
      // ignore
    }
  }, [openFolders, hydrated]);

  const toggleFolder = useCallback((id) => {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H1",
        location: "SideBar.js:toggleFolder",
        message: "toggle folder",
        data: { id },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleFileClick = useCallback(
    (route, id) => {
      if (!route) return;
      setActiveFile(id ?? null);
      // 동일 경로로의 하드 네비게이션 시 Invariant 에러 방지
      const normalizePath = (v) => {
        try {
          return (v || "").split("#")[0].split("?")[0];
        } catch {
          return v || "";
        }
      };
      const current = normalizePath(router.asPath);
      const target = normalizePath(route);
      if (current === target) return;
      router.push(route);
    },
    [router]
  );

  const TreeItem = useCallback(
    ({ node, depth = 0 }) => {
      const indent = depth * 12;
      const renderLabel = (label) => {
        // "bug( Something );" 형태에 색상 적용
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "pre-fix",
            hypothesisId: "H2",
            location: "SideBar.js:renderLabel",
            message: "render label called",
            data: { label, isString: typeof label === "string" },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        const normalized = typeof label === "string" ? label.trim() : "";
        const match = typeof normalized === "string" ? normalized.match(/^bug\s*\(\s*(.+?)\s*\)\s*;?\s*$/i) : null;
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "pre-fix",
            hypothesisId: "H2b",
            location: "SideBar.js:renderLabel",
            message: "normalized/match result",
            data: { normalized, matched: !!match },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        if (!match) return label;
        const inner = match[1];
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "pre-fix",
            hypothesisId: "H3",
            location: "SideBar.js:renderLabel",
            message: "bug pattern matched",
            data: { inner },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        return (
          <span style={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', monospace", fontSize: 13.5, fontWeight: 600 }}>
            <span style={{ color: "#ffffff" }}>bug</span>
            <span style={{ color: "rgb(0,255,0)" }}>(</span>
            <span style={{ color: "#ffffff" }}>{inner}</span>
            <span style={{ color: "rgb(0,255,0)" }}>)</span>
            <span style={{ color: "#ffffff" }}>;</span>
          </span>
        );
      };
      if (node.type === "folder") {
        const opened = openFolders.has(node.id);
        return (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 6px",
                cursor: "pointer",
                userSelect: "none",
                color: "#e8e8e8",
                gap: 6,
              fontSize: 13.5,
              fontWeight: 300,
              }}
              onClick={() => toggleFolder(node.id)}
            >
              <span
                style={{
                  display: "inline-flex",
                  width: 32,
                  height: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
              fontWeight: 300,
                  fontSize: 18,
                  lineHeight: "20px",
                  color: "#bfc0c2",
                  transform: opened ? "rotate(0deg)" : "rotate(0deg)",
                  cursor: "pointer",
                }}
                aria-label={opened ? "close folder" : "open folder"}
              >
                {opened ? "▾" : "▸"}
              </span>
              <span style={{ marginLeft: indent, whiteSpace: "nowrap" }}>{node.label}</span>
            </div>
            {opened && node.children?.length ? (
              <div style={{ marginLeft: 12 }}>
                {node.children.map((child) => (
                  <TreeItem key={child.id} node={child} depth={depth + 1} />
                ))}
              </div>
            ) : null}
          </div>
        );
      }

      const isActive = activeFile === node.id || activeFileId === node.id;
      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/aa0df7a3-9505-41db-a875-29a987833b4d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "pre-fix",
          hypothesisId: "H4",
          location: "SideBar.js:TreeItem",
          message: "render tree item",
          data: { id: node.id, type: node.type, depth, indent, isActive, label: node.label },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "4px 6px",
            marginLeft: indent,
            cursor: node.route ? "pointer" : "default",
            color: node.route ? "#f5f5f5" : "#888",
            transition: "background 0.15s ease",
            gap: 6,
            background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
            borderRadius: 0,
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', monospace",
            fontSize: 13.5,
            fontWeight: 200,
            width: "100%",
            boxSizing: "border-box",
          }}
          onClick={() => handleFileClick(node.route, node.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleFileClick(node.route, node.id);
          }}
          role="button"
          tabIndex={0}
        >
          <img
            src={iconSrc}
            alt=""
            style={{
              width: 24,
              height: 24,
              objectFit: "contain",
              filter: isActive
                ? "brightness(0) saturate(100%) invert(67%) sepia(99%) saturate(1458%) hue-rotate(79deg) brightness(103%) contrast(102%)" // rgb(0,255,0) 근사
                : "brightness(0) invert(1)", // 기본 화이트
              transition: "filter 0.15s ease, transform 0.15s ease",
              transform: isActive ? "scale(1.05)" : "scale(1)",
            }}
          />
          <span>{renderLabel(node.label)}</span>
        </div>
      );
    },
    [activeFile, activeFileId, handleFileClick, iconSrc, openFolders, toggleFolder]
  );

  const content = useMemo(
    () => treeData.map((node) => <TreeItem key={node.id} node={node} />),
    [TreeItem, treeData]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: headerHeight,
        bottom: 0,
        left: 0,
        width: 280,
        background: "rgba(0,0,0,0.5)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        color: "#f0f0f0",
        overflowY: "auto",
        padding: "8px 6px",
        boxSizing: "border-box",
        pointerEvents: "auto",
        backdropFilter: "blur(4px)",
        fontFamily: "'JetBrains Mono', 'Noto Sans KR', monospace",
        fontSize: 14,
        fontWeight: 200,
        lineHeight: 1.35,
      }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {content}
    </div>
  );
}
