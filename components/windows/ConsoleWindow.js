import { useEffect, useRef, useState } from "react";

export default function ConsoleWindow() {
  const [mutated, setMutated] = useState(0); // 현재 변형된 글자 수
  const [error, setError] = useState(false);
  const [lines, setLines] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    const onMut = (e) => {
      const delta = (e && e.detail && typeof e.detail.delta === "number") ? e.detail.delta : 0;
      setMutated((n) => Math.max(0, n + delta));
    };
    window.addEventListener("cmdCharMutated", onMut);
    return () => window.removeEventListener("cmdCharMutated", onMut);
  }, []);

  // 변형 수에 따른 에러 상태(15 이상일 때)
  useEffect(() => {
    setError(mutated >= 15);
  }, [mutated]);

  useEffect(() => {
    // 재설정
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    intervalRef.current = setInterval(() => {
      setLines((prev) => {
        const next = [...prev, { text: error ? ">Syntax Error!" : ">Success!", color: error ? "#ff4d4d" : "#22c55e" }];
        // 메모리 보호: 최근 400줄만 유지
        return next.length > 400 ? next.slice(-400) : next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [error]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end", // 최신 줄이 항상 하단에 고정
        overflow: "hidden",
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontSize: 14,
        lineHeight: "20px",
        whiteSpace: "pre-wrap",
      }}
    >
      <div>
        {lines.map((l, i) => (
          <div key={i} style={{ color: l.color }}>{l.text}</div>
        ))}
      </div>
    </div>
  );
}


