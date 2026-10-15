import styles from "./SectionLabel.module.css";

/**
 * 섹션 번호 라벨("01 — About" 등). 강조색이 아니라 회색(dim) 계열이다 (spec).
 *
 * id는 보통 상위 <section>이 아니라 여기 둔다 — 섹션마다 위 padding이
 * 달라서(About만 120px, 나머지는 40px) <section>을 점프 목적지로 쓰면
 * 네비 pill과의 간격이 섹션마다 들쭉날쭉해진다. 실제 랜드마크인 이
 * 라벨에 scroll-margin-top을 주면 모든 섹션에서 똑같이 네비 바로
 * 아래로 온다.
 */
export function SectionLabel({
  num,
  label,
  id,
}: {
  num: string;
  label: string;
  id?: string;
}) {
  return (
    <div id={id} className={`mono ${styles.cue}`}>
      {num} — {label}
    </div>
  );
}
