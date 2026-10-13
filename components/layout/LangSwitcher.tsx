"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FlagKR, FlagUS } from "@/components/icons";
import { useLang } from "@/lib/i18n/LangProvider";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

import styles from "./NavPill.module.css";

/**
 * 언어 전환. 같은 페이지·같은 쿼리를 유지한 채 경로 접두사만 바꾼다
 * (spec §2.1). useSearchParams를 쓰므로 호출부에서 <Suspense>로 감싼다.
 */
export function LangSwitcher() {
  const { lang, dict } = useLang();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const switchTo = useCallback(
    (target: Locale) => {
      setOpen(false);
      try {
        window.localStorage.setItem("lang", target);
      } catch {
        // localStorage 접근 불가 — 이번 전환만 반영하고 넘어간다.
      }
      const segments = pathname.split("/");
      segments[1] = target;
      const newPath = segments.join("/") || "/";
      const query = searchParams.toString();
      router.push(query ? `${newPath}?${query}` : newPath);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className={styles.langWrap} ref={rootRef}>
      <button
        type="button"
        className={styles.pillBtn}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={dict.nav.langSelect}
        title={dict.nav.langSelect}
      >
        {lang === "ko" ? <FlagKR /> : <FlagUS />}
      </button>
      {open ? (
        <div
          className={styles.langMenu}
          role="listbox"
          aria-label={dict.nav.langSelect}
        >
          {LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={lang === option}
              className={`${styles.langOpt} ${lang === option ? styles.langOptOn : ""}`}
              onClick={() => switchTo(option)}
              lang={option}
            >
              {option === "ko" ? <FlagKR /> : <FlagUS />}
              <span className={`mono ${styles.langCode}`}>
                {option.toUpperCase()}
              </span>
              <span className={styles.langName}>
                {option === "ko" ? dict.nav.langKo : dict.nav.langEn}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
