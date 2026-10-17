import Image from "next/image";
import type { ReactNode } from "react";

import { getLinkIcon, type LinkIconType } from "@/lib/data/link-icons";

import styles from "./Badge.module.css";

/**
 * 공용 배지(기술/링크/GitHub·StackShare 핸들 등). href가 있으면 링크,
 * 없으면 일반 배지로 렌더한다 (시안 .badge/.logo 참고).
 *
 * 로고는 두 가지 방식으로 준다: 링크 종류(`iconType`, 예: "github")를
 * 주면 `getLinkIcon`으로 직접 찾아 쓰고, 기술 스택처럼 링크 종류가
 * 아닌 다른 출처(`tech.logo`)의 로고는 `logoSrc` 등을 바로 넘긴다.
 */
export function Badge({
  href,
  mono,
  iconType,
  logoSrc,
  logoBackground,
  logoPadding,
  className,
  logoClassName,
  children,
  style,
}: {
  href?: string;
  mono?: string;
  /**
   * `lib/data/link-icons.ts`의 링크 종류(예: "github", "stackshare").
   * 주면 로고를 직접 찾아 쓴다. 등록된 종류는 자동완성되지만, 사용자
   * 데이터(`l.type`)처럼 등록 안 된 임의의 문자열도 받는다 — 없는
   * 종류면 `getLinkIcon`이 그냥 못 찾을 뿐 오류는 아니다.
   */
  iconType?: LinkIconType | (string & {});
  logoSrc?: string;
  /** 흰색/검은색 한 가지뿐인 로고가 테마에 따라 안 보이는 걸 막는
   * 고정 배경색(데이터의 logo.background). */
  logoBackground?: string;
  /** 원본 이미지가 가장자리까지 꽉 차 있어 원형 틀에 잘리는 로고를
   * 위한 안쪽 여백(px, 데이터의 logo.padding) — 전부에 일괄로 주지
   * 않고 필요한 로고 데이터에만 지정한다. */
  logoPadding?: number;
  className?: string;
  logoClassName?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  const icon = iconType ? getLinkIcon(iconType) : undefined;
  const resolvedLogoSrc = icon?.src ?? logoSrc;
  const resolvedLogoBackground = icon?.background ?? logoBackground;
  const resolvedLogoPadding = icon?.padding ?? logoPadding;
  const Tag = href ? "a" : "span";
  const logoStyle: React.CSSProperties | undefined =
    resolvedLogoBackground || resolvedLogoPadding
      ? {
          ...(resolvedLogoBackground ? { background: resolvedLogoBackground } : null),
          ...(resolvedLogoPadding ? { padding: resolvedLogoPadding } : null),
        }
      : undefined;
  return (
    <Tag
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer" : undefined}
      className={`${styles.badge} ${className ?? ""}`}
      style={style}
    >
      <span className={`${styles.logo} ${logoClassName ?? ""}`} style={logoStyle}>
        {resolvedLogoSrc ? (
          <Image
            src={`/images/${resolvedLogoSrc}`}
            alt=""
            width={26}
            height={26}
            className={styles.logoImg}
          />
        ) : (
          mono
        )}
      </span>
      {children}
    </Tag>
  );
}
