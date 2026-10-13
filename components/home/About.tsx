import { renderBold } from "@/lib/ui/renderBold";
import type { ProfileMode } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/ko";

import { SectionLabel } from "./SectionLabel";
import styles from "./About.module.css";

/**
 * 01 — About. 소개 → 기술 스택 → 경험 → 마무리 순서의 문단 4개
 * (spec §4.1). 모드(backend/game)에 따라 내용 전체가 바뀐다.
 */
export function About({
  mode,
  dict,
}: {
  mode: ProfileMode;
  dict: Dictionary;
}) {
  const content = dict.about[mode];

  return (
    <section id="about" className={styles.section}>
      <SectionLabel num="01" label="About" />
      <h2 className={styles.heading}>
        {content.title1}
        <br />
        <span className={styles.headingAccent}>{content.title2}</span>
      </h2>
      <p className={styles.subtitle}>{content.subtitle}</p>
      <div className={styles.grid}>
        {content.paragraphs.map((p, i) => (
          <div key={i}>
            {"label" in p && p.label ? (
              <h3 className={styles.label}>{p.label}</h3>
            ) : null}
            <p className={styles.body}>{renderBold(p.body)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
