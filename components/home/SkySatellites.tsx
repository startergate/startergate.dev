"use client";

import { useLang } from "@/lib/i18n/LangProvider";
import { fillTemplate } from "@/lib/i18n/template";
import { toScreen } from "@/lib/satellite/screen";
import type { OrbitClass, SatellitePosition } from "@/lib/satellite/types";

import styles from "./SkySatellites.module.css";

const SATELLITE_INFO_URL = "https://www.n2yo.com/satellite/?s=";

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
/** 이 값(%) 넘게 오른쪽에 있으면 이름표를 점 왼쪽에 단다 — 안 그러면
 * 글자가 히어로 오른쪽 바깥으로 넘어가 잘린다. */
const RIGHT_EDGE_FLIP_PCT = 82;
/** 직전 위치에서 화면상 이 거리(%) 넘게 떨어지면 전환 없이 바로 옮긴다 —
 * 탭이 백그라운드에 있는 동안 타이머가 느려졌다가 다시 포커스되면 위성이
 * 한 번에 멀리 움직여야 하는데, 이를 2.9초짜리 전환으로 미끄러지게 보여주면
 * 실제 움직임처럼 보이지 않는다. 평상시 3초 갱신 간 이동은 저궤도도 몇 % 이내다. */
const JUMP_THRESHOLD_PCT = 8;

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

        const prev =
          p.prevAzimuthDeg != null && p.prevElevationDeg != null
            ? {
                azimuthDeg: p.prevAzimuthDeg,
                ...toScreen(p.prevAzimuthDeg, p.prevElevationDeg),
              }
            : null;

        // 방위각이 0/360을 넘나들면(예: 359°→2°) left(%)가 거의 반대편으로
        // 뛴다 — 실제로 그만큼 움직인 게 아니라 각도 표현상의 점프다. 또
        // 탭이 백그라운드였다가 돌아오면 실제로도 한 번에 멀리 움직인다.
        // 어느 쪽이든 CSS 전환(transition)이 이 점프를 애니메이션하면 점이
        // 화면을 가로질러 미끄러지는 것처럼 보이므로, 이번 갱신만 전환 없이
        // 바로 새 위치로 옮긴다. 거리는 CSS가 실제로 애니메이션하는 값인
        // 보정 전 left 차이로 잰다.
        const jumped =
          prev != null &&
          (Math.abs(p.azimuthDeg - prev.azimuthDeg) > 180 ||
            Math.hypot(left - prev.left, top - prev.top) > JUMP_THRESHOLD_PCT);

        let trailDeg: number | null = null;
        if (trailLengthPx > 0 && prev != null) {
          const dAz = angleDelta(p.azimuthDeg, prev.azimuthDeg);
          const dx = (dAz / 360) * 100;
          const dy = top - prev.top;
          if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
            trailDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 180;
          }
        }

        const nearRightEdge = left > RIGHT_EDGE_FLIP_PCT;

        return (
          <div
            key={p.noradId}
            className={`${styles.dot} ${nearRightEdge ? styles.dotFlip : ""}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              transition: jumped || p.instant ? "none" : undefined,
            }}
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
              <a
                className={styles.infoLink}
                href={`${SATELLITE_INFO_URL}${p.noradId}`}
                target="_blank"
                rel="noreferrer"
                aria-hidden="false"
                aria-label={fillTemplate(dict.hero.satInfoLinkAriaTemplate, { name: p.name })}
              >
                ↗
              </a>
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
