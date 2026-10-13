import styles from "./SectionLabel.module.css";

/** 섹션 번호 라벨("01 — About" 등). 강조색이 아니라 회색(dim) 계열이다 (spec). */
export function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className={`mono ${styles.cue}`}>
      {num} — {label}
    </div>
  );
}
