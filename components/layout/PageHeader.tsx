import styles from "./PageHeader.module.css";

/**
 * 목록·타임라인 페이지 전용. 히어로 대신 좌측 상단에 제목만 둔다
 * (spec §2.2) — 설명 문구는 의도적으로 넣지 않는다. 같은 페이지의
 * 나머지 내용과 폭을 맞춰야 해서 .wrap은 호출부에서 감싼다.
 */
export function PageHeader({ title }: { title: string }) {
  return (
    <header id="top" className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
