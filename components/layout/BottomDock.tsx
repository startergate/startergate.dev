"use client";

import { ArrowUpIcon } from "@/components/icons";
import { useLang } from "@/lib/i18n/LangProvider";

import styles from "./BottomDock.module.css";

/**
 * 우측 하단 고정 버튼. 프로필 모드 스위치(메인 전용)는 3단계에서
 * 이 자리에 추가한다 (spec §3.2).
 */
export function BottomDock() {
  const { dict } = useLang();

  const scrollTop = () => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    window.scrollTo({ top: 0, behavior });
  };

  return (
    <div className={styles.dock}>
      <button
        type="button"
        className={styles.fab}
        onClick={scrollTop}
        aria-label={dict.bottomDock.scrollTop}
      >
        <ArrowUpIcon />
      </button>
    </div>
  );
}
