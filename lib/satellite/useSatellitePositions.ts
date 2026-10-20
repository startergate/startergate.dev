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

import { MIN_ELEVATION_DEG } from "./screen";
import type { Observer, SatellitePosition, SatellitesFile } from "./types";

const MAX_SATELLITES = 15;
const MIN_SATELLITES = 6;
/** 화면 폭 이만큼(px)마다 위성 하나 — 좁은 화면에서 점과 이름표가 빽빽해지지 않게 한다. */
const PX_PER_SATELLITE = 96;
const UPDATE_INTERVAL_MS = 3000;
/**
 * 정지궤도·중궤도는 지구 자전 대비 각속도가 느려서 전체 중 여러
 * 자리를 차지하면 하늘이 정적으로 보인다 — 궤도별로 한 번에 보여줄
 * 수를 제한해 저궤도 위성이 들어올 자리를 남겨 둔다. 화면 폭에 따라
 * 전체 수가 줄면 이 상한도 같은 비율(전체의 1/3)로 줄인다.
 */
const MAX_GEO_SATELLITES = 5;

type SatelliteLimits = { total: number; perSlowOrbit: number };

function limitsForWidth(width: number): SatelliteLimits {
  const total = Math.min(
    MAX_SATELLITES,
    Math.max(MIN_SATELLITES, Math.round(width / PX_PER_SATELLITE)),
  );
  return { total, perSlowOrbit: Math.max(1, Math.round(total / 3)) };
}

type LoadedSatellite = {
  name: string;
  noradId: number;
  satrec: ReturnType<typeof twoline2satrec>;
  altitudeKm?: number;
  orbitClass?: SatellitePosition["orbitClass"];
  isKorean?: boolean;
};

/**
 * 앙각 10° 이상인 위성 중 최대 15개(화면 폭에 따라 6~15개)를
 * 우선순위·앙각 순으로 뽑는다 (spec §7). 정지궤도·중궤도는 각각 전체의
 * 1/3(15개일 때 5개)까지만 포함하고 넘치는 자리는 저궤도 위성으로
 * 채운다 — 정지궤도·중궤도는 각속도가 느려서 비중이 크면 하늘이
 * 정적으로 보인다. 정지궤도 중 한국 위성은 항상 포함하고, 나머지는
 * 접속할 때마다(이 훅이 다시 설정될 때) 무작위로 뽑아 고정한다 —
 * 매번 같은 위성만 뜨지 않게 하면서도, 매 틱 다시 뽑아 깜빡이지는
 * 않게 한다.
 * 화면상 겹쳐 보이는 정지궤도 후보는 매 틱이 아니라 수집 시점
 * (scripts/fetch-satellites.mjs의 dedupeGeoBySeoulScreenPosition)
 * 에서 이미 걸러져 있으므로 여기서는 다시 거르지 않는다 — 매 틱
 * 다시 걸러내면 앙각이 근소하게 뒤바뀔 때마다 결과가 깜빡인다.
 * public/data/satellites.json 로드나 전파 계산이 실패하면 빈 배열을
 * 반환한다 — 오류 문구 없이 위성 없는 별 하늘만 보이게 한다.
 */
export function useSatellitePositions(observer: Observer): SatellitePosition[] {
  const [positions, setPositions] = useState<SatellitePosition[]>([]);
  const satellitesRef = useRef<LoadedSatellite[]>([]);
  const [loaded, setLoaded] = useState(false);
  // 매 틱 읽기만 하므로 ref에 둔다 — 상태로 두면 폭이 바뀔 때마다
  // 아래 effect가 다시 돌아 정지궤도 무작위 선택까지 다시 뽑힌다.
  const limitsRef = useRef<SatelliteLimits>(limitsForWidth(Number.POSITIVE_INFINITY));
  // 위성별 직전 위치 — 점 옆 트레일 방향 계산용.
  const lastSeenRef = useRef<Map<number, { azimuthDeg: number; elevationDeg: number }>>(
    new Map(),
  );

  useEffect(() => {
    const update = () => {
      limitsRef.current = limitsForWidth(window.innerWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
              altitudeKm: s.altitudeKm,
              orbitClass: s.orbitClass,
              isKorean: s.isKorean,
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
    // 한국 정지궤도 위성이 아닌 나머지 자리는 접속(이 useEffect가 다시
    // 도는 시점)마다 한 번만 무작위로 뽑아 고정한다 — 정지궤도는 거의
    // 안 움직이니 매 틱 다시 뽑으면 의미가 없고 깜빡이기만 한다.
    let randomGeoPick: Set<number> | null = null;

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
          computed.push({
            name: sat.name,
            noradId: sat.noradId,
            azimuthDeg,
            elevationDeg,
            altitudeKm: sat.altitudeKm,
            orbitClass: sat.orbitClass,
            isKorean: sat.isKorean,
          });
        } catch {
          // 이 위성만 건너뛴다(쇠퇴한 TLE 등으로 전파가 실패할 수 있다).
        }
      }

      computed.sort((a, b) => {
        const pa = priorityIndex.get(a.noradId) ?? Number.POSITIVE_INFINITY;
        const pb = priorityIndex.get(b.noradId) ?? Number.POSITIVE_INFINITY;
        if (pa !== pb) return pa - pb;
        // 우선순위 목록 밖에서는 한국 위성(궤도 무관)을 먼저 둔다.
        if (a.isKorean !== b.isKorean) return a.isKorean ? -1 : 1;
        return b.elevationDeg - a.elevationDeg;
      });

      if (randomGeoPick === null) {
        const geoCandidates = computed.filter((c) => c.orbitClass === "geo");
        const koreanGeoCount = geoCandidates.filter((c) => c.isKorean).length;
        const nonKoreanGeo = geoCandidates.filter((c) => !c.isKorean);
        const remainingSlots = Math.max(0, MAX_GEO_SATELLITES - koreanGeoCount);
        // Fisher-Yates — 한국 위성 제외 정지궤도 후보 중 remainingSlots개를 무작위로 고른다.
        for (let i = nonKoreanGeo.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonKoreanGeo[i], nonKoreanGeo[j]] = [nonKoreanGeo[j], nonKoreanGeo[i]];
        }
        randomGeoPick = new Set(nonKoreanGeo.slice(0, remainingSlots).map((c) => c.noradId));
      }
      const fixedRandomGeoPick = randomGeoPick;

      const limits = limitsRef.current;
      const selected: typeof computed = [];
      let geoCount = 0;
      let meoCount = 0;
      for (const candidate of computed) {
        if (selected.length >= limits.total) break;
        if (candidate.orbitClass === "geo") {
          if (geoCount >= limits.perSlowOrbit) continue;
          // 한국 위성은 항상 포함하고, 나머지는 접속 시 무작위로 뽑아 둔 것만 포함한다.
          if (!candidate.isKorean && !fixedRandomGeoPick.has(candidate.noradId)) continue;
          geoCount += 1;
        } else if (candidate.orbitClass === "meo") {
          if (meoCount >= limits.perSlowOrbit) continue;
          meoCount += 1;
        }
        selected.push(candidate);
      }

      const next = selected.map(
        ({ name, noradId, azimuthDeg, elevationDeg, altitudeKm, orbitClass, isKorean }) => {
          const prev = lastSeenRef.current.get(noradId);
          return {
            name,
            noradId,
            azimuthDeg,
            elevationDeg,
            altitudeKm,
            orbitClass,
            isKorean,
            prevAzimuthDeg: prev?.azimuthDeg,
            prevElevationDeg: prev?.elevationDeg,
          };
        });
      for (const p of next) {
        lastSeenRef.current.set(p.noradId, {
          azimuthDeg: p.azimuthDeg,
          elevationDeg: p.elevationDeg,
        });
      }
      setPositions(next);
    };

    tick();
    const id = setInterval(tick, UPDATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loaded, observer]);

  return positions;
}
