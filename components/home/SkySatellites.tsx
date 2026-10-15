"use client";

import { useLang } from "@/lib/i18n/LangProvider";
import { fillTemplate } from "@/lib/i18n/template";
import type { OrbitClass, SatellitePosition } from "@/lib/satellite/types";

import styles from "./SkySatellites.module.css";

const ZENITH_PCT = 8;
const HORIZON_PCT = 90;

/**
 * 궤도마다 지상 관측자 기준 각속도(하늘을 가로지르는 속도)가 많이
 * 다르다 — 저궤도(ISS 등)는 몇 분 만에 하늘을 가로지르지만, 정지
 * 궤도는 지구 자전과 같이 돌아서 사실상 하늘에 고정돼 보인다. 꼬리
 * 길이를 궤도별로 다르게 둬서 이 차이를 시각적으로 드러낸다.
 * 정지궤도는 꼬리를 아예 안 그린다(실제로 거의 움직이지 않는데
 * 움직이는 것처럼 보이면 오히려 틀린 정보라서).
 */
const TRAIL_LENGTH_PX: Record<OrbitClass, number> = {
  leo: 46,
  meo: 20,
  geo: 0,
};
const DEFAULT_TRAIL_LENGTH_PX = 46;

function toScreen(azimuthDeg: number, elevationDeg: number) {
  return {
    left: (azimuthDeg / 360) * 100,
    top: ZENITH_PCT + (1 - elevationDeg / 90) * (HORIZON_PCT - ZENITH_PCT),
  };
}

/** 방위각이 0/360을 넘나드는 경우를 보정한 차이(-180~180). */
function angleDelta(a: number, b: number): number {
  let d = a - b;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/**
 * flightradar24 AR 모드처럼 하늘을 올려다본 위치에 점을 찍는다
 * (spec §7). 방위각(0~360°)을 가로, 앙각(0°=지평선·90°=위쪽 끝)을
 * 세로에 매핑한다. 점 옆엔 이름만 작고 연한 색으로 쓴다 — 방위·앙각
 * 수치는 호버했을 때만 보이는 말풍선으로 보여준다.
 */
export function SkySatellites({ positions }: { positions: SatellitePosition[] }) {
  const { dict } = useLang();

  return (
    <div aria-hidden="true" className={styles.layer}>
      {positions.map((p) => {
        const { left, top } = toScreen(p.azimuthDeg, p.elevationDeg);
        const trailLengthPx = p.orbitClass
          ? TRAIL_LENGTH_PX[p.orbitClass]
          : DEFAULT_TRAIL_LENGTH_PX;

        let trailDeg: number | null = null;
        if (trailLengthPx > 0 && p.prevAzimuthDeg != null && p.prevElevationDeg != null) {
          const prev = toScreen(p.prevAzimuthDeg, p.prevElevationDeg);
          const dAz = angleDelta(p.azimuthDeg, p.prevAzimuthDeg);
          const dx = (dAz / 360) * 100;
          const dy = top - prev.top;
          if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
            trailDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 180;
          }
        }

        return (
          <div
            key={p.noradId}
            className={styles.dot}
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            {trailDeg != null ? (
              <span
                className={styles.trail}
                style={{ transform: `rotate(${trailDeg}deg)`, width: trailLengthPx }}
              />
            ) : null}
            <span className={styles.pt} />
            <span className={`mono ${styles.label}`}>
              {p.name}
              <span className={styles.meta}>
                {p.orbitClass && p.altitudeKm != null
                  ? fillTemplate(dict.hero.satMetaWithOrbitTemplate, {
                      az: Math.round(p.azimuthDeg),
                      el: Math.round(p.elevationDeg),
                      orbit: dict.hero.satOrbitClass[p.orbitClass],
                      alt: p.altitudeKm,
                    })
                  : fillTemplate(dict.hero.satMetaTemplate, {
                      az: Math.round(p.azimuthDeg),
                      el: Math.round(p.elevationDeg),
                    })}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
