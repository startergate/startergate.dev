/**
 * 방위각·앙각 → 히어로 화면 좌표(%) 변환. components/home/SkySatellites.tsx
 * (실제 그리기)와 lib/satellite/useSatellitePositions.ts(겹침 방지
 * 선정)가 똑같은 매핑을 써야 "화면상 가까움" 판단이 실제로 그려지는
 * 위치와 어긋나지 않는다 — 한 곳에서만 정의해 공유한다.
 */
export const ZENITH_PCT = 8;
export const HORIZON_PCT = 90;

export function toScreen(azimuthDeg: number, elevationDeg: number): { left: number; top: number } {
  return {
    left: (azimuthDeg / 360) * 100,
    top: ZENITH_PCT + (1 - elevationDeg / 90) * (HORIZON_PCT - ZENITH_PCT),
  };
}
