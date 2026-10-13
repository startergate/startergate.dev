import styles from "./Ground.module.css";

/**
 * 모든 페이지 맨 아래의 언덕 두 개 지면과 저작권 표시 (spec §3.3).
 */
export function Ground() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className={styles.hills}
      >
        <path
          d="M0 90 C 260 50, 480 96, 720 70 C 960 44, 1180 92, 1440 64 L1440 220 L0 220 Z"
          style={{ fill: "var(--hill1)" }}
        />
        <path
          d="M0 140 C 240 112, 460 150, 700 130 C 940 110, 1180 150, 1440 126 L1440 220 L0 220 Z"
          style={{ fill: "var(--hill2)" }}
        />
      </svg>
      <div className={styles.captionLayer}>
        <div className={`wrap ${styles.caption}`}>
          <span>© {year} startergate</span>
        </div>
      </div>
    </footer>
  );
}
