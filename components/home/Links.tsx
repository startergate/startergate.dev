import { getLinkIcon } from "@/lib/data/link-icons";
import { monogram } from "@/lib/data/monogram";
import type { LinkItem } from "@/lib/data/types";

import { Badge } from "./Badge";
import { SectionLabel } from "./SectionLabel";
import styles from "./Links.module.css";

/** 05 — Links. 기술 배지와 같은 스타일의 링크 배지 (spec §4.1). */
export function Links({ links, heading }: { links: LinkItem[]; heading: string }) {
  return (
    <section id="links" className={styles.section}>
      <SectionLabel num="05" label="Links" />
      <h2 style={{ margin: "40px 0 0", fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em" }}>
        {heading}
      </h2>
      <div className={styles.row}>
        {links.map((l) => (
          <Badge
            key={l.type + l.link}
            href={l.link}
            mono={monogram(l.type)}
            logoSrc={getLinkIcon(l.type)}
            className={styles.badge}
            logoClassName={styles.logo}
          >
            <span>{l.type}</span>
            <span className={styles.handle}>{l.external_id}</span>
          </Badge>
        ))}
      </div>
    </section>
  );
}
