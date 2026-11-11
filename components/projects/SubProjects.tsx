"use client";

import { useId, useState } from "react";
import Image from "@/components/ui/OptimizedImage";

import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/data/format";
import { monogram } from "@/lib/data/monogram";
import type { ResolvedSubProject } from "@/lib/data/overview";
import { STATUS_COLOR_VAR } from "@/lib/data/status";
import { useLang } from "@/lib/i18n/LangProvider";
import { l10n } from "@/lib/i18n/l10n";

import styles from "./ProjectModal.module.css";

/**
 * 팝업 안의 "하위 프로젝트" 아코디언 (spec §6.2). 항목마다 헤더 버튼을
 * 누르면 펼쳐진다 — 기본은 모두 접힘. 접힌 패널은 렌더하지 않아서
 * 팝업 포커스 트랩의 탭 순서에도 들어가지 않는다.
 */
export function SubProjects({ items }: { items: ResolvedSubProject[] }) {
  const { dict } = useLang();
  if (items.length === 0) return null;

  return (
    <section className={`${styles.tile} ${styles.span4} ${styles.subWrap}`}>
      <h3 className={styles.tileLabel}>
        {dict.modal.subProjects}{" "}
        <span className={styles.memberCount}>{items.length}</span>
      </h3>
      <ul className={styles.subList}>
        {items.map((sp) => (
          <SubProjectItem key={sp.id} item={sp} />
        ))}
      </ul>
    </section>
  );
}

function SubProjectItem({ item }: { item: ResolvedSubProject }) {
  const { lang, dict } = useLang();
  const [open, setOpen] = useState(false);
  const panelId = `sub-${useId()}`;

  const color = STATUS_COLOR_VAR[item.status];
  const end = item.finishedAt
    ? formatDate(item.finishedAt)
    : item.status === "active"
      ? dict.modal.subPeriodOngoing
      : dict.modal.subPeriodUndecided;
  const period =
    item.status === "planning" && !item.finishedAt
      ? `${formatDate(item.startedAt)} ~`
      : `${formatDate(item.startedAt)} ~ ${end}`;

  return (
    <li className={styles.subItem}>
      <h4 className={styles.subHeading}>
        <button
          type="button"
          className={styles.subHeader}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.subTitle}>{item.title}</span>
          <span className={styles.subMeta}>
            <span className={styles.subPeriod}>{period}</span>
            <span className={styles.subStatus}>
              <span
                className={styles.statusDot}
                style={{ background: color }}
                aria-hidden="true"
              />
              <span style={{ color }}>{dict.status[item.status]}</span>
            </span>
          </span>
          <span
            className={`${styles.subChevron} ${open ? styles.subChevronOpen : ""}`}
            aria-hidden="true"
          />
        </button>
      </h4>
      {open ? (
        <div id={panelId} className={styles.subPanel} role="region" aria-label={item.title}>
          {item.overview ? <p className={styles.secBody}>{item.overview}</p> : null}

          {item.images.length > 0 ? (
            <div className={styles.subImages}>
              {item.images.map((img) => (
                <figure key={img.src} className={styles.imageFigure}>
                  <Image
                    src={`/images/${img.src}`}
                    alt={img.description ? l10n(img.description, lang) : ""}
                    width={960}
                    height={540}
                    className={styles.image}
                  />
                  {img.description ? (
                    <figcaption className={styles.imageCaption}>
                      {l10n(img.description, lang)}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          ) : null}

          {item.sections.map((sec) => (
            <div key={sec.no} className={styles.subSection}>
              <span className={styles.secNo}>{sec.no}</span>
              <h5 className={styles.subSecTitle}>{sec.title}</h5>
              {sec.body ? <p className={styles.secBody}>{sec.body}</p> : null}
              {sec.image ? (
                <div className={styles.secImage}>
                  <Image
                    src={`/images/${sec.image}`}
                    alt=""
                    width={800}
                    height={450}
                    className={styles.secImageImg}
                  />
                </div>
              ) : null}
            </div>
          ))}

          {item.links.length > 0 ? (
            <div className={styles.subLinks}>
              <span className={styles.tileLabel}>{dict.modal.linksLabel}</span>
              {item.links.map((l) => (
                <Badge
                  key={l.link}
                  href={l.link}
                  mono={monogram(l.type)}
                  iconType={l.type}
                  className={styles.linkBadge}
                  logoClassName={styles.linkMono}
                >
                  {l.label}
                  <span className={styles.linkArrow}>↗</span>
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
