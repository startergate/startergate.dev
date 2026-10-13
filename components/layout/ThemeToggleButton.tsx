"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { useLang } from "@/lib/i18n/LangProvider";
import { useTheme } from "@/lib/theme/ThemeProvider";

import styles from "./NavPill.module.css";

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const { dict } = useLang();

  return (
    <button
      type="button"
      className={styles.pillBtn}
      onClick={toggleTheme}
      aria-label={dict.theme.toggle}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
