"use client";

import { useEffect, useRef, useState } from "react";
import {
  degreesToRadians,
  ecfToLookAngles,
  eciToEcf,
  gstime,
  propagate,
  radiansToDegrees,
  twoline2satrec,
} from "satellite.js";

import priorityList from "@/data/satellite-priority.json";

import type { Observer, SatellitePosition, SatellitesFile } from "./types";

const MAX_SATELLITES = 10;
const MIN_ELEVATION_DEG = 10;
const UPDATE_INTERVAL_MS = 3000;

type LoadedSatellite = {
  name: string;
  noradId: number;
  satrec: ReturnType<typeof twoline2satrec>;
};

/**
 * 앙각 10° 이상인 위성 중 최대 10개를 우선순위대로 뽑는다 (spec §7).
 * public/data/satellites.json 로드나 전파 계산이 실패하면 빈 배열을
 * 반환한다 — 오류 문구 없이 위성 없는 별 하늘만 보이게 한다.
 */
export function useSatellitePositions(observer: Observer): SatellitePosition[] {
  const [positions, setPositions] = useState<SatellitePosition[]>([]);
  const satellitesRef = useRef<LoadedSatellite[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/satellites.json")
      .then((res) => {
        if (!res.ok) throw new Error("failed to load satellites.json");
        return res.json() as Promise<SatellitesFile>;
      })
      .then((data) => {
        if (cancelled) return;
        const loadedSats: LoadedSatellite[] = [];
        for (const s of data.satellites) {
          try {
            loadedSats.push({
              name: s.name,
              noradId: s.noradId,
              satrec: twoline2satrec(s.tle1, s.tle2),
            });
          } catch {
            // 이 위성의 TLE만 건너뛴다.
          }
        }
        satellitesRef.current = loadedSats;
        setLoaded(true);
      })
      .catch(() => {
        // 로드 실패 — 위성 없이 별 하늘만 보여준다 (loaded는 false로 유지).
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const priorityIndex = new Map<number, number>(
      (priorityList as { noradId: number }[]).map((p, i) => [p.noradId, i]),
    );
    const observerGd = {
      longitude: degreesToRadians(observer.lon),
      latitude: degreesToRadians(observer.lat),
      height: 0.1,
    };

    const tick = () => {
      const now = new Date();
      const gmst = gstime(now);
      const computed: (SatellitePosition & { noradId: number })[] = [];

      for (const sat of satellitesRef.current) {
        try {
          const pv = propagate(sat.satrec, now);
          if (!pv || !pv.position) continue;
          const ecf = eciToEcf(pv.position, gmst);
          const look = ecfToLookAngles(observerGd, ecf);
          const elevationDeg = radiansToDegrees(look.elevation);
          if (elevationDeg < MIN_ELEVATION_DEG) continue;
          const azimuthDeg = (radiansToDegrees(look.azimuth) + 360) % 360;
          computed.push({ name: sat.name, noradId: sat.noradId, azimuthDeg, elevationDeg });
        } catch {
          // 이 위성만 건너뛴다(쇠퇴한 TLE 등으로 전파가 실패할 수 있다).
        }
      }

      computed.sort((a, b) => {
        const pa = priorityIndex.get(a.noradId) ?? Number.POSITIVE_INFINITY;
        const pb = priorityIndex.get(b.noradId) ?? Number.POSITIVE_INFINITY;
        if (pa !== pb) return pa - pb;
        return b.elevationDeg - a.elevationDeg;
      });

      setPositions(
        computed.slice(0, MAX_SATELLITES).map(({ name, noradId, azimuthDeg, elevationDeg }) => ({
          name,
          noradId,
          azimuthDeg,
          elevationDeg,
        })),
      );
    };

    tick();
    const id = setInterval(tick, UPDATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loaded, observer]);

  return positions;
}
