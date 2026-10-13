export type SatelliteRecord = {
  name: string;
  noradId: number;
  tle1: string;
  tle2: string;
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
  /** 직전 갱신 때의 위치 — 점 옆 트레일 방향을 계산하는 데 쓴다.
   * 이번이 그 위성의 첫 갱신이면 없다. */
  prevAzimuthDeg?: number;
  prevElevationDeg?: number;
};

export type Observer = { lat: number; lon: number };

export const SEOUL_OBSERVER: Observer = { lat: 37.5665, lon: 126.978 };
