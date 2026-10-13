import styles from "./PageHeader.module.css";

/**
 * 목록·타임라인 페이지 전용. 히어로 대신 좌측 상단에 제목만 둔다
 * (spec §2.2) — 설명 문구는 의도적으로 넣지 않는다.
 */
export function PageHeader({ title }: { title: string }) {
  return (
    <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
      <header id="top" className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
      </header>
    </div>
  );
}
