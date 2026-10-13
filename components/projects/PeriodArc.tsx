"use client";

import { usePrefersReducedMotion } from "@/lib/ui/usePrefersReducedMotion";

import styles from "./ProjectModal.module.css";

/**
 * 시작일~종료일을 곡선 점선 호로 잇는 기간 표시 (spec §6.2).
 * 호는 상태에 따라 채워진다: 완료/취소는 끝까지, 진행 중은 절반,
 * 계획 중은 비어 있음. clipPath + rect width 애니메이션을 쓴다
 * (pathLength와 vector-effect를 함께 쓰면 계산이 틀어져서 피한다).
 */
export function PeriodArc({
  idSuffix,
  color,
  clipWidth,
  caption,
}: {
  idSuffix: string;
  color: string;
  clipWidth: number;
  caption: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const clipId = `pm-arc-clip-${idSuffix}`;

  return (
    <div className={styles.route} aria-hidden="true">
      <svg
        width="100%"
        height="56"
        viewBox="0 0 400 56"
        preserveAspectRatio="none"
        fill="none"
        className={styles.routeSvg}
      >
        <path
          d="M2 52 Q200 -20 398 52"
          style={{ stroke: "var(--line)" }}
          strokeWidth="1.5"
          strokeDasharray="3 6"
          vectorEffect="non-scaling-stroke"
        />
        <defs>
          <clipPath id={clipId}>
            {reducedMotion ? (
              <rect x="0" y="-30" height="100" width={clipWidth} />
            ) : (
              <rect x="0" y="-30" height="100" width="0">
                <animate
                  attributeName="width"
                  from="0"
                  to={clipWidth}
                  dur="1.2s"
                  begin="0.2s"
                  fill="freeze"
                  calcMode="spline"
                  keyTimes="0;1"
                  keySplines="0.4 0 0.2 1"
                />
              </rect>
            )}
          </clipPath>
        </defs>
        <path
          d="M2 52 Q200 -20 398 52"
          clipPath={`url(#${clipId})`}
          style={{ stroke: color }}
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className={styles.routeDotStart} style={{ background: color }} />
      <span
        className={styles.routeDotEnd}
        style={{ borderColor: color }}
      />
      <span className={styles.plane}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <g transform="rotate(90 12 12)">
            <path
              d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
              style={{ fill: "var(--muted)" }}
            />
          </g>
        </svg>
      </span>
      <div className={styles.routeCaption}>{caption}</div>
    </div>
  );
}
