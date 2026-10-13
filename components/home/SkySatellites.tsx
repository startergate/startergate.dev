import type { SatellitePosition } from "@/lib/satellite/types";

import styles from "./SkySatellites.module.css";

const ZENITH_PCT = 8;
const HORIZON_PCT = 90;

/**
 * flightradar24 AR 모드처럼 하늘을 올려다본 위치에 점을 찍는다
 * (spec §7). 방위각(0~360°)을 가로, 앙각(0°=지평선·90°=위쪽 끝)을
 * 세로에 매핑한다. 이름만 작고 연한 색으로 쓰고, 방위·앙각 수치는
 * 표시하지 않는다.
 */
export function SkySatellites({ positions }: { positions: SatellitePosition[] }) {
  return (
    <div aria-hidden="true" className={styles.layer}>
      {positions.map((p) => {
        const left = (p.azimuthDeg / 360) * 100;
        const top = ZENITH_PCT + (1 - p.elevationDeg / 90) * (HORIZON_PCT - ZENITH_PCT);
        return (
          <div
            key={p.noradId}
            className={styles.dot}
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <span className={styles.pt} />
            <span className={`mono ${styles.label}`}>{p.name}</span>
          </div>
        );
      })}
    </div>
  );
}
