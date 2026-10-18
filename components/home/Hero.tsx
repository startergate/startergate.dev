"use client";

import { useEffect, useMemo, useState } from "react";

import { ChevronDownIcon, LocationPinIcon } from "@/components/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { SITE_EMAIL, SITE_OPEN_TO_WORK, getSiteName } from "@/lib/site-meta";
import { useLang } from "@/lib/i18n/LangProvider";
import type { ProfileMode } from "@/lib/data/types";
import { SEOUL_OBSERVER, type Observer } from "@/lib/satellite/types";
import { useSatellitePositions } from "@/lib/satellite/useSatellitePositions";

import { SkySatellites } from "./SkySatellites";
import { StarField } from "./StarField";
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
 * 히어로. 위성 하늘(별·유성·위성 점) + KST 캡션·내 위치 토글
 * (spec §4.1, §7). 좌표는 내 위치로 보기를 눌렀을 때만 요청하고,
 * 저장하거나 외부로 보내지 않는다 — 이 세션의 위성 계산에만 쓴다.
 */
export function Hero({ mode }: { mode: ProfileMode }) {
  const { lang, dict } = useLang();
  const clock = useKstClock();
  const [loc, setLoc] = useState<"seoul" | "mine">("seoul");
  const [coords, setCoords] = useState<Observer | null>(null);

  const observer = useMemo<Observer>(
    () => (loc === "mine" && coords ? coords : SEOUL_OBSERVER),
    [loc, coords],
  );
  const satellites = useSatellitePositions(observer);

  const toggleLoc = () => {
    if (loc === "mine") {
      setLoc("seoul");
      return;
    }
    try {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLoc("mine");
        },
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
      <StarField />
      <SkySatellites positions={satellites} />

      <div className={styles.sky}>
        <button type="button" className={styles.locBtn} onClick={toggleLoc}>
          <LocationPinIcon />
          {loc === "mine" ? dict.hero.locToSeoul : dict.hero.locToMine}
        </button>
        <span className={styles.skyCaption}>
          <span className={styles.skyBlink} aria-hidden="true" />
          {loc === "mine" ? dict.hero.skyMine : dict.hero.skySeoul} · <span className="mono">{clock}</span>
          <Tooltip content={dict.hero.skyDisclaimer} align="end" side="top" className={styles.skyInfo}>
            ⓘ
          </Tooltip>
        </span>
      </div>

      <div className={`wrap ${styles.content}`}>
        <h1 className={styles.title}>
          <span className={styles.slogan}>{dict.hero.slogan}</span>
        </h1>
        <p className={`mono ${styles.name}`}>
          STARTERGATE <span className={styles.nameSlash}>/</span> {getSiteName(lang)}
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
