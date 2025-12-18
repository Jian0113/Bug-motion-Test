import styles from "./styles.module.css";

export default function BugCard({
  index,
  label,
  desc,
  mode,
  onOpen,
  previewSrc,
  videoSrc,
  style,
  previewStyle,
  previewOverlayStyle,
  previewChildren,
  statusText = "stuffing Sucess!",
  statusColor,
  statusDotColor,
}) {
  return (
    <button className={styles.card} onClick={() => onOpen(mode)} style={style}>
      {/* X-ray style tab header and number */}
      <div className={styles.winTab}>Random</div>
      <div className={styles.winNum}>{String(index).padStart(2, "0")}</div>

      {/* 기존 텍스트는 시각적으로 숨김(접근성 유지) */}
      <div className={styles.visuallyHidden}>
        <div className={styles.codeLine}>
          <span>#{index}</span>
          <span>Bug</span>
          <span>(</span>
          <span>{label}</span>
          <span>)</span>
          <span>;</span>
        </div>
        <div className={styles.desc}>{desc}</div>
      </div>

      <div className={styles.preview} style={previewStyle}>
        <div className={styles.gridOverlay} />
        {videoSrc && previewSrc ? (
          <div className={styles.previewStack}>
            <img src={previewSrc} alt="" className={styles.previewImg} />
            <video className={styles.previewVideo} src={videoSrc} autoPlay loop muted playsInline />
          </div>
        ) : videoSrc ? (
          <video className={styles.previewImg} src={videoSrc} autoPlay loop muted playsInline />
        ) : previewSrc ? (
          <img src={previewSrc} alt="" className={styles.previewImg} />
        ) : null}
        {previewChildren}
        <div className={styles.previewOverlay} style={previewOverlayStyle} />
        {/* bottom status */}
        <div className={styles.status} style={statusColor ? { color: statusColor } : undefined}>
          <span
            className={styles.dot}
            style={statusDotColor ? {
              background: statusDotColor,
              boxShadow: `0 0 8px ${statusDotColor}CC`
            } : undefined}
          />
          {statusText}
        </div>
      </div>
    </button>
  );
}


