import { makeStars } from "@/lib/sky/stars";

import styles from "./StarField.module.css";

const STARS = makeStars(7, 70);

/**
 * 히어로 전용 별 하늘 + 유성. 다른 페이지에는 두지 않는다 (spec §3.3).
 * 시드 고정 PRNG라 서버/클라이언트 렌더가 같은 위치를 낸다.
 */
export function StarField() {
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
      <span className={styles.meteor} style={{ left: "72%", top: "14%" }} />
    </div>
  );
}
