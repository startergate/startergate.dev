import Image from "next/image";
import type { ReactNode } from "react";

import styles from "./Badge.module.css";

/**
 * 공용 배지(기술/링크/GitHub·StackShare 핸들 등). href가 있으면 링크,
 * 없으면 일반 배지로 렌더한다 (시안 .badge/.logo 참고).
 */
export function Badge({
  href,
  mono,
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
  logoSrc?: string;
  /** 흰색/검은색 한 가지뿐인 로고가 테마에 따라 안 보이는 걸 막는
   * 고정 배경색(데이터의 logo.background, spec 외 — 피드백으로 추가). */
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
  const Tag = href ? "a" : "span";
  const logoStyle: React.CSSProperties | undefined =
    logoBackground || logoPadding
      ? {
          ...(logoBackground ? { background: logoBackground } : null),
          ...(logoPadding ? { padding: logoPadding } : null),
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
        {logoSrc ? (
          <Image src={`/images/${logoSrc}`} alt="" width={26} height={26} className={styles.logoImg} />
        ) : (
          mono
        )}
      </span>
      {children}
    </Tag>
  );
}
