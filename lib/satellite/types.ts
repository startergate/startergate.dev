export type OrbitClass = "leo" | "meo" | "geo";

export type SatelliteRecord = {
  name: string;
  noradId: number;
  tle1: string;
  tle2: string;
  /** scripts/fetch-satellites.mjs가 TLE 평균 운동에서 미리 계산해 둔다. */
  altitudeKm?: number;
  orbitClass?: OrbitClass;
  /** CelesTrak SATCAT의 OWNER === "SKOR"(대한민국) 여부. */
  isKorean?: boolean;
};

export type SatellitesFile = {
  generatedAt: string;
  satellites: SatelliteRecord[];
};

export type SatellitePosition = {
  name: string;
  noradId: number;
  azimuthDeg: number;
  elevationDeg: number;
  altitudeKm?: number;
  orbitClass?: OrbitClass;
  isKorean?: boolean;
  /** 직전 갱신 때의 위치 — 점 옆 트레일 방향을 계산하는 데 쓴다.
   * 이번이 그 위성의 첫 갱신이면 없다. */
  prevAzimuthDeg?: number;
  prevElevationDeg?: number;
  /** First update after the observer changed — move without a transition,
   * since the jump is a change of viewpoint, not satellite motion. */
  instant?: boolean;
};

export type Observer = { lat: number; lon: number };

export const SEOUL_OBSERVER: Observer = { lat: 37.5665, lon: 126.978 };
