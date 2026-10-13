import { monogram } from "@/lib/data/monogram";
import type { ProfileMode, Tech } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/ko";

import { Badge } from "./Badge";
import { SectionLabel } from "./SectionLabel";
import styles from "./Technologies.module.css";

function byLevel(techs: Tech[], level: Tech["level"]) {
  return techs.filter((t) => t.level === level);
}

/** 03 — Technologies. 사용 중 / 사용해 봄 / 학습 중, 모드별로 필터 (spec §4.1). */
export function Technologies({
  mode,
  dict,
  techs,
}: {
  mode: ProfileMode;
  dict: Dictionary;
  techs: Tech[];
}) {
  const filtered = techs.filter((t) => t.mode === mode || t.mode === "all");
  const groups: { key: Tech["level"]; label: string; className?: string }[] = [
    { key: "using", label: dict.tech.using },
    { key: "learned", label: dict.tech.learned, className: styles.learned },
    { key: "learning", label: dict.tech.learning, className: styles.learning },
  ];

  return (
    <section id="tech" className={styles.section}>
      <SectionLabel num="03" label="Technologies" />
      <div className={styles.headRow}>
        <h2 className={styles.heading}>{dict.tech.heading}</h2>
        <Badge href="https://stackshare.io/startergate" mono="SS">
          {dict.tech.ssBadge}
        </Badge>
      </div>
      <div className={styles.groups}>
        {groups.map((g) => {
          const items = byLevel(filtered, g.key);
          if (items.length === 0) return null;
          return (
            <div key={g.key}>
              <h3 className={styles.groupLabel}>{g.label}</h3>
              <div className={styles.badgeRow}>
                {items.map((t) => (
                  <Badge
                    key={t.name}
                    mono={t.abbr ?? monogram(t.name)}
                    logoSrc={t.logo?.src}
                    className={g.className}
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
