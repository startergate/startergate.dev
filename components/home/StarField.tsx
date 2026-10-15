"use client";

import { useEffect, useRef } from "react";

import { makeMeteor, makeStars, METEOR_X_RANGE, METEOR_Y_RANGE } from "@/lib/sky/stars";

import styles from "./StarField.module.css";

const STARS = makeStars(7, 70);
const INITIAL_METEOR = makeMeteor(23);

/**
 * 히어로 전용 별 하늘 + 유성. 다른 페이지에는 두지 않는다 (spec §3.3).
 * 별은 시드 고정 PRNG라 서버/클라이언트 렌더가 같은 위치를 낸다.
 *
 * 유성은 하나만 둬서 여러 개가 동시에 떨어지지 않게 하고, 매 애니메이션
 * 루프가 끝날 때(animationiteration)마다 순수 클라이언트에서 새 위치로
 * 옮긴다 — 그래서 같은 자리에서만 반복되지도, 여러 개가 겹치지도 않는다.
 */
export function StarField() {
  const meteorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = meteorRef.current;
    if (!el) return;
    const [xMin, xMax] = METEOR_X_RANGE;
    const [yMin, yMax] = METEOR_Y_RANGE;
    const reposition = () => {
      el.style.left = `${xMin + Math.random() * (xMax - xMin)}%`;
      el.style.top = `${yMin + Math.random() * (yMax - yMin)}%`;
    };
    el.addEventListener("animationiteration", reposition);
    return () => el.removeEventListener("animationiteration", reposition);
  }, []);

  return (
    <div aria-hidden="true" className={styles.layer}>
      {STARS.map((s, i) => (
        <span
          key={i}
          className={`${styles.star} ${s.twinkle ? styles.twinkle : ""}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <span
        ref={meteorRef}
        className={styles.meteor}
        style={{
          left: `${INITIAL_METEOR.x}%`,
          top: `${INITIAL_METEOR.y}%`,
          animationDelay: `${INITIAL_METEOR.delay}s`,
        }}
      />
    </div>
  );
}
