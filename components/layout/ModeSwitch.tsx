"use client";

import { useLang } from "@/lib/i18n/LangProvider";
import { useProfileMode } from "@/lib/mode/useProfileMode";

import styles from "./ModeSwitch.module.css";

/** 프로필 모드 스위치. 메인에서만 보인다 (spec §3.2). */
export function ModeSwitch() {
  const { dict } = useLang();
  const [mode, setMode] = useProfileMode();

  return (
    <div role="group" aria-label={dict.bottomDock.modeBackend} className={styles.group}>
      <button
        type="button"
        className={`${styles.btn} ${mode === "backend" ? styles.btnOn : ""}`}
        onClick={() => setMode("backend")}
        aria-label={dict.bottomDock.modeBackend}
        aria-pressed={mode === "backend"}
      >
        <span className={styles.emoji} aria-hidden="true">
          💻
        </span>
      </button>
      <button
        type="button"
        className={`${styles.btn} ${mode === "game" ? styles.btnOn : ""}`}
        onClick={() => setMode("game")}
        aria-label={dict.bottomDock.modeGame}
        aria-pressed={mode === "game"}
      >
        <span className={styles.emoji} aria-hidden="true">
          🎮
        </span>
      </button>
    </div>
  );
}
