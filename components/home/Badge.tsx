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
  className,
  logoClassName,
  children,
  style,
}: {
  href?: string;
  mono?: string;
  logoSrc?: string;
  className?: string;
  logoClassName?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  const Tag = href ? "a" : "span";
  return (
    <Tag
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer" : undefined}
      className={`${styles.badge} ${className ?? ""}`}
      style={style}
    >
      <span className={`${styles.logo} ${logoClassName ?? ""}`}>
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
