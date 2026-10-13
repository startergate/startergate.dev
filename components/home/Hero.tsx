"use client";

import { useEffect, useState } from "react";

import { ChevronDownIcon, LocationPinIcon } from "@/components/icons";
import { SITE_EMAIL, SITE_OPEN_TO_WORK } from "@/lib/site-meta";
import { useLang } from "@/lib/i18n/LangProvider";
import type { ProfileMode } from "@/lib/data/types";

import styles from "./Hero.module.css";

function useKstClock(): string {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

/**
 * 히어로. 위성 하늘(별·유성·위성 점)은 4단계에서 얹는다 — 지금은
 * 하늘 그라데이션(전역)과 KST 캡션·내 위치 토글만 둔다 (spec §4.1, §7).
 */
export function Hero({ mode }: { mode: ProfileMode }) {
  const { dict } = useLang();
  const clock = useKstClock();
  const [loc, setLoc] = useState<"seoul" | "mine">("seoul");

  const toggleLoc = () => {
    if (loc === "mine") {
      setLoc("seoul");
      return;
    }
    try {
      navigator.geolocation?.getCurrentPosition(
        () => setLoc("mine"),
        () => {
          /* 거부·실패 — 서울 유지 */
        },
        { timeout: 8000 },
      );
    } catch {
      /* Geolocation 미지원 — 서울 유지 */
    }
  };

  return (
    <section id="top" aria-label={dict.hero.roleBackend} className={styles.hero}>
      <div className={styles.sky}>
        <span className={styles.skyCaption}>
          <span className={styles.skyBlink} aria-hidden="true" />
          {loc === "mine" ? dict.hero.skyMine : dict.hero.skySeoul} · {clock}
        </span>
        <button type="button" className={styles.locBtn} onClick={toggleLoc}>
          <LocationPinIcon />
          {loc === "mine" ? dict.hero.locToSeoul : dict.hero.locToMine}
        </button>
      </div>

      <div className={`wrap ${styles.content}`}>
        <h1 className={styles.title}>
          <span className={styles.slogan}>{dict.hero.slogan}</span>
        </h1>
        <p className={`mono ${styles.name}`}>
          STARTERGATE <span className={styles.nameSlash}>/</span> 최호승
        </p>
        <p className={styles.role}>
          {mode === "backend" ? dict.hero.roleBackend : dict.hero.roleGame}
        </p>
        <a className={`mono ${styles.email}`} href={`mailto:${SITE_EMAIL}`}>
          {SITE_EMAIL}
        </a>
        {SITE_OPEN_TO_WORK ? (
          <a className={`mono ${styles.openToWork}`} href={`mailto:${SITE_EMAIL}`}>
            <span className={styles.openDot} aria-hidden="true" />
            <span>{dict.hero.openToWork}</span>
          </a>
        ) : null}
      </div>

      <a href="#about" className={styles.cue} aria-label={dict.hero.scrollDown}>
        <ChevronDownIcon />
      </a>
    </section>
  );
}
