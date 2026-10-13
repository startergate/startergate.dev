"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { ArrowUpIcon } from "@/components/icons";
import { useLang } from "@/lib/i18n/LangProvider";

import { ModeSwitch } from "./ModeSwitch";
import styles from "./BottomDock.module.css";

/** 우측 하단 고정 버튼. 프로필 모드 스위치는 메인에서만 보인다 (spec §3.2). */
export function BottomDock() {
  const { lang, dict } = useLang();
  const pathname = usePathname();
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;

  const scrollTop = () => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    window.scrollTo({ top: 0, behavior });
  };

  return (
    <div className={styles.dock}>
      {isHome ? (
        <Suspense fallback={null}>
          <ModeSwitch />
        </Suspense>
      ) : null}
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
