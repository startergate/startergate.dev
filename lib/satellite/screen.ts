/**
 * 방위각·앙각 → 히어로 화면 좌표(%) 변환. components/home/SkySatellites.tsx
 * (실제 그리기)와 lib/satellite/useSatellitePositions.ts(겹침 방지
 * 선정)가 똑같은 매핑을 써야 "화면상 가까움" 판단이 실제로 그려지는
 * 위치와 어긋나지 않는다 — 한 곳에서만 정의해 공유한다.
 */
export const ZENITH_PCT = 0;
export const HORIZON_PCT = 100;
/** 이 앙각 미만인 위성은 useSatellitePositions.ts가 애초에 걸러낸다 —
 * 실제로 화면에 그려지는 가장 낮은 위성의 앙각이 0이 아니라 이
 * 값이므로, 매핑도 0이 아니라 이 값을 지평선(HORIZON_PCT)으로 잡아야
 * 보이는 위성들이 세로 범위(0~100%)를 다 쓴다 — 0°를 기준으로 하면
 * 그 밑은 아예 안 쓰이는 구간이라 위성이 화면 아래쪽까지 안
 * 내려가 보인다. */
export const MIN_ELEVATION_DEG = 10;

export function toScreen(azimuthDeg: number, elevationDeg: number): { left: number; top: number } {
  const t = (elevationDeg - MIN_ELEVATION_DEG) / (90 - MIN_ELEVATION_DEG);
  return {
    left: (azimuthDeg / 360) * 100,
    top: HORIZON_PCT - t * (HORIZON_PCT - ZENITH_PCT),
  };
}
