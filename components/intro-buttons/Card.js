import styles from "./styles.module.css";

export default function BugCard({ index, label, desc, mode, onOpen, previewSrc, videoSrc, style }) {
  return (
    <button className={styles.card} onClick={() => onOpen(mode)} style={style}>
      <div className={styles.codeLine}>
        <span style={{ color: "#9ca3af" }}>#{index}</span>
        <span style={{ color: "#93c5fd" }}>Bug</span>
        <span style={{ color: "#9ca3af" }}>(</span>
        <span style={{ color: "#f59e0b" }}>{label}</span>
        <span style={{ color: "#9ca3af" }}>)</span>
        <span style={{ color: "#9ca3af" }}>;</span>
      </div>
      <div className={styles.desc}>{desc}</div>
      <div className={styles.preview}>
        {videoSrc ? (
          <video className={styles.previewImg} src={videoSrc} autoPlay loop muted playsInline />
        ) : previewSrc ? (
          // alt는 비워 시각적 장식으로 사용
          <img src={previewSrc} alt="" className={styles.previewImg} />
        ) : null}
      </div>
    </button>
  );
}


