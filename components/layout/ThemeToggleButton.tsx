"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { useLang } from "@/lib/i18n/LangProvider";
import { useTheme } from "@/lib/theme/ThemeProvider";

import styles from "./NavPill.module.css";

export function ThemeToggleButton() {
  const { theme, mounted, toggleTheme } = useTheme();
  const { dict } = useLang();

  return (
    <button
      type="button"
      className={styles.pillBtn}
      onClick={toggleTheme}
      aria-label={dict.theme.toggle}
    >
      {/* mounted 전엔 서버와 같은 중립 자리표시만 그린다 — 실제 테마로
          바로 그리면 서버 추정(dark)과 달라 하이드레이션이 깨진다. */}
      {mounted ? (
        theme === "dark" ? (
          <SunIcon />
        ) : (
          <MoonIcon />
        )
      ) : (
        <span style={{ width: 18, height: 18 }} aria-hidden="true" />
      )}
    </button>
  );
}
