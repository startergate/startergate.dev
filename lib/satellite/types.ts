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
};

export type Observer = { lat: number; lon: number };

export const SEOUL_OBSERVER: Observer = { lat: 37.5665, lon: 126.978 };
