"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";

import { CloseIcon, CopyLinkIcon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { sendEvent } from "@/lib/analytics";
import { daysBetween, formatDate } from "@/lib/data/format";
import { monogram } from "@/lib/data/monogram";
import type { ProjectOverview } from "@/lib/data/overview";
import { getPerson } from "@/lib/data/people";
import { SITE_URL } from "@/lib/site-meta";
import { STATUS_COLOR_VAR } from "@/lib/data/status";
import { getTechByName } from "@/lib/data/techs";
import type { Project } from "@/lib/data/types";
import { useLang } from "@/lib/i18n/LangProvider";
import { l10n } from "@/lib/i18n/l10n";
import { fillTemplate } from "@/lib/i18n/template";
import { useTheme } from "@/lib/theme/ThemeProvider";

import { PeriodArc } from "./PeriodArc";
import styles from "./ProjectModal.module.css";

const SELF_NAME = "최호승";
/** 참여 인원 중 AI 도구를 이렇게 표시한다 — 이름 옆에 작은 "AI" 배지가 붙는다. */
const AI_NAME = "Claude Code";

/**
 * 프로젝트 상세 팝업. 메인·목록 공용 (spec §6.2, 시안 ProjectModal.dc.html).
 * `projects`의 순서가 이전/다음 탐색 순서다.
 */
export function ProjectModal({
  projects,
  overviews,
  currentId,
  onClose,
  onNavigate,
}: {
  projects: Project[];
  overviews: Record<string, ProjectOverview>;
  currentId: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const { lang, dict } = useLang();
  const { theme, mounted } = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const index = projects.findIndex((p) => p.id === currentId);
  const project = projects[index];
  const prev = index > 0 ? projects[index - 1] : undefined;
  const next = index >= 0 && index < projects.length - 1 ? projects[index + 1] : undefined;
  const resolved = overviews[currentId];

  // 열려 있는 동안 스크롤 잠금 (spec §접근성).
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // 처음 열릴 때 포커스 이동.
  useEffect(() => {
    overlayRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    sendEvent("project_open", { id: currentId });
  }, [currentId]);

  useEffect(() => {
    return () => clearTimeout(copyTimer.current);
  }, []);

  if (!project) return null;

  const statusColor = STATUS_COLOR_VAR[project.status];
  const statusLabel = dict.status[project.status];
  const days = daysBetween(project.startedAt, project.finishedAt);
  const clipWidth =
    project.status === "planning" ? 0 : project.status === "active" ? 200 : 400;
  const routeCaption =
    project.status === "planning"
      ? dict.modal.planningCaption
      : fillTemplate(dict.modal.daysStatusTemplate, { days, status: statusLabel });
  const endLabel =
    project.status === "planning"
      ? dict.modal.endPlanned
      : project.status === "canceled"
        ? dict.modal.endCanceled
        : dict.modal.endDone;
  const endValue = project.finishedAt
    ? formatDate(project.finishedAt)
    : dict.modal.noEndValue;

  const kindLabel = project.team
    ? fillTemplate(dict.modal.teamProjectTemplate, { team: project.team.name })
    : project.category === "personal"
      ? dict.modal.personalProject
      : dict.modal.teamProject;

  const shareUrl = `${SITE_URL}/${lang}/projects/${project.id}/`;

  // mounted 전엔 서버와 같은 기본(src) 변형만 쓴다 (components/home/Resume.tsx와 동일한 이유).
  const logoSrc =
    mounted && theme === "light" && project.logo?.srcOnLight
      ? project.logo.srcOnLight
      : project.logo?.src;

  const stack = project.techs.map((name) => {
    const tech = getTechByName(name);
    return {
      name,
      mono: tech?.abbr ?? monogram(name),
      logoSrc: tech?.logo?.src,
      logoBackground: tech?.logo?.background,
      logoPadding: tech?.logo?.padding,
    };
  });

  const members = project.collaborators.map((c) => {
    const person = getPerson(c.name);
    const roles = c.roles.map((r) => (typeof r === "string" ? r : l10n(r, lang)));
    return {
      name: c.name,
      role: roles.join(" · "),
      href: person?.link,
      avatar: person?.avatar,
      initial: c.name.charAt(0).toUpperCase(),
      isMe: c.name === SELF_NAME,
      isAI: c.name === AI_NAME,
    };
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // 클립보드 접근 불가 — 조용히 무시한다.
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  const trapFocus = (e: KeyboardEvent<HTMLDivElement>) => {
    const root = overlayRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowLeft" && prev) {
      onNavigate(prev.id);
    } else if (e.key === "ArrowRight" && next) {
      onNavigate(next.id);
    } else if (e.key === "Tab") {
      trapFocus(e);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
      tabIndex={-1}
      ref={overlayRef}
      onClick={onClose}
      onKeyDown={onKeyDown}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.copyBtn}
          onClick={copyLink}
          title={shareUrl}
        >
          <CopyLinkIcon />
          <span aria-live="polite">
            {copied ? dict.modal.copyLinkDone : dict.modal.copyLink}
          </span>
        </button>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label={dict.modal.closeAria}
        >
          <CloseIcon />
        </button>

        <header className={styles.header}>
          <span
            className={styles.mono}
            aria-hidden="true"
            style={project.logo?.background ? { background: project.logo.background } : undefined}
          >
            {logoSrc ? (
              <Image
                src={`/images/${logoSrc}`}
                alt=""
                width={60}
                height={60}
                className={styles.monoImg}
              />
            ) : (
              monogram(project.name)
            )}
          </span>
          <div style={{ minWidth: 0 }}>
            <div className={styles.kind}>{kindLabel}</div>
            <h2 className={styles.title}>{project.name}</h2>
            <p className={styles.desc}>{l10n(project.description, lang)}</p>
          </div>
        </header>

        <div className={styles.grid}>
          <div className={`${styles.tile} ${styles.span4} ${styles.strip}`}>
            <div>
              <div className={styles.tileLabel}>{dict.modal.start}</div>
              <div className={styles.dateValue}>
                {formatDate(project.startedAt)}
              </div>
            </div>
            <PeriodArc
              idSuffix={project.id}
              color={statusColor}
              clipWidth={clipWidth}
              caption={routeCaption}
            />
            <div style={{ textAlign: "right" }}>
              <div className={styles.tileLabel}>{endLabel}</div>
              <div className={styles.dateValue}>{endValue}</div>
            </div>
          </div>

          {project.images && project.images.length > 0 ? (
            <div className={`${styles.tile} ${styles.span4} ${styles.imagesWrap}`}>
              {project.images.map((img) => (
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

          <div className={`${styles.tile} ${styles.statusTile}`}>
            <span className={styles.tileLabel}>{dict.modal.statusLabel}</span>
            <div className={styles.statusRow}>
              <span
                className={styles.statusDot}
                style={{
                  background: statusColor,
                  boxShadow: `0 0 0 4px color-mix(in srgb, ${statusColor} 22%, transparent)`,
                }}
              />
              <span className={styles.statusLabel} style={{ color: statusColor }}>
                {statusLabel}
              </span>
            </div>
          </div>

          <div className={`${styles.tile} ${styles.span3} ${styles.membersTile}`}>
            <span className={styles.tileLabel}>
              {dict.modal.members}{" "}
              <span className={styles.memberCount}>{members.length}</span>
            </span>
            <div className={styles.members}>
              {members.map((m) => {
                const Tag = m.href ? "a" : "div";
                return (
                  <Tag
                    key={m.name}
                    href={m.href}
                    target={m.href ? "_blank" : undefined}
                    rel={m.href ? "noreferrer" : undefined}
                    className={styles.member}
                  >
                    <span
                      className={styles.memberAvatar}
                      style={
                        m.isMe
                          ? { background: "var(--accent)", color: "var(--accent-ink)" }
                          : undefined
                      }
                    >
                      {/* 본인은 사진이 있어도 강조색 아바타로 표시한다
                          (spec §6.2) — 다른 참여자와 구분되게 한다. */}
                      {m.avatar && !m.isMe ? (
                        <Image
                          src={`/images/${m.avatar}`}
                          alt=""
                          width={34}
                          height={34}
                          className={styles.memberAvatarImg}
                        />
                      ) : (
                        m.initial
                      )}
                    </span>
                    <span className={styles.memberInfo}>
                      <span className={styles.memberNameRow}>
                        <span className={styles.memberName}>{m.name}</span>
                        {m.isAI ? <span className={styles.aiBadge}>AI</span> : null}
                      </span>
                      <span className={styles.memberRole}>{m.role}</span>
                    </span>
                  </Tag>
                );
              })}
            </div>
          </div>

          <article className={`${styles.tile} ${styles.span2} ${styles.article}`}>
            <h3 className={styles.tileLabel}>{dict.modal.overview}</h3>
            <p className={styles.overviewText}>{resolved?.overview}</p>
          </article>

          <article className={`${styles.tile} ${styles.span2} ${styles.article}`}>
            <h3 className={styles.tileLabel}>{dict.modal.techStack}</h3>
            <div className={styles.badgeRow}>
              {stack.map((t) => (
                <Badge
                  key={t.name}
                  mono={t.mono}
                  logoSrc={t.logoSrc}
                  logoBackground={t.logoBackground}
                  logoPadding={t.logoPadding}
                  className={styles.stackBadge}
                  logoClassName={styles.stackMono}
                >
                  {t.name}
                </Badge>
              ))}
            </div>
          </article>

          {(resolved?.sections ?? []).map((sec) => (
            <article
              key={sec.no}
              className={`${styles.tile} ${styles.span2} ${styles.article}`}
            >
              <span className={styles.secNo}>{sec.no}</span>
              <h3 className={styles.secTitle}>{sec.title}</h3>
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
            </article>
          ))}

          {project.links && project.links.length > 0 ? (
            <div className={`${styles.tile} ${styles.span4} ${styles.linksWrap}`}>
              <span className={styles.tileLabel}>{dict.modal.linksLabel}</span>
              {project.links.map((l) => (
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

        <nav aria-label={dict.modal.prevNextAria} className={styles.navRow}>
          {prev ? (
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => onNavigate(prev.id)}
            >
              <span className={styles.navSub}>← {dict.modal.prevProject}</span>
              <span className={styles.navName}>{prev.name}</span>
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnEnd}`}
              onClick={() => onNavigate(next.id)}
            >
              <span className={styles.navSub}>{dict.modal.nextProject} →</span>
              <span className={styles.navName}>{next.name}</span>
            </button>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}
