#!/usr/bin/env node
/**
 * GitHub Action이 하루 1회 돌려 public/data/satellites.json을 만드는
 * 스크립트 (spec §7). CelesTrak에서 후보 위성의 TLE를 모아 고도·
 * 궤도 종류(LEO/MEO/GEO)를 미리 계산해 둔다. 실제 방위각/앙각 계산과
 * "앙각 10도 이상 중 최대 15개" 선정은 클라이언트(satellite.js,
 * useSatellitePositions.ts)가 그때그때 한다.
 *
 * 후보 구성:
 * - data/satellite-priority.json의 NORAD ID(ISS·허블 등, 국적 무관
 *   항상 보여주고 싶은 것들)를 CATNR로 하나씩 조회.
 * - CelesTrak `active` 그룹 전체에서 OWNER === "SKOR"(대한민국)·
 *   PAYLOAD인 것만 걸러 자동으로 가져온다(fetchKoreanPayloads) — 기업·
 *   대학 큐브샛까지 포함해 새 위성이 뜨거나 수명이 다해도 이 스크립트가
 *   다음 실행 때 저절로 반영한다.
 * - CelesTrak `visual`(밝은 위성)·`starlink`(저궤도 표본 150기)·
 *   `gps-ops`·`glo-ops`(중궤도 위성항법)·`geo`(정지궤도 표본) 그룹.
 *   각 그룹은 SATCAT에서 OBJECT_TYPE을 같이 받아 실제 임무를 수행한
 *   PAYLOAD만 남긴다(로켓 동체 R/B 제외).
 *
 * 정지궤도는 서울 상공 기준 경도대가 겹치는 것들이 많아, 수집 시점에
 * dedupeGeoBySeoulScreenPosition으로 한 번만 걸러 둔다(화면상 거리가
 * lib/satellite/screen.ts/useSatellitePositions.ts의 MIN_SEPARATION_PCT
 * 안쪽이면 앙각 낮은 쪽을 버림, 한국 위성 우선). `geo` 그룹과
 * fetchKoreanPayloads의 정지궤도 결과 양쪽에 각각 적용한다. 매 틱
 * 클라이언트에서 다시 거르면 앙각이 근소하게 뒤바뀔 때마다 결과가
 * 바뀌어 깜빡이므로, 겹침 제거는 여기(수집 시점)에서만 한다.
 *
 * CelesTrak SATCAT의 OWNER === "SKOR"(대한민국)인 후보는 isKorean으로
 * 표시해 둔다 — 우선순위 목록 밖에서는 궤도와 상관없이 한국 위성을
 * 먼저 보여준다(useSatellitePositions.ts).
 *
 * CelesTrak 요청은 이 스크립트가 하루 1회만 돌아서 사용 정책을 지킨다.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  degreesToRadians,
  ecfToLookAngles,
  eciToEcf,
  gstime,
  propagate,
  radiansToDegrees,
  twoline2satrec,
} from "satellite.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PRIORITY_FILE = path.join(ROOT, "data/satellite-priority.json");
const OUT_FILE = path.join(ROOT, "public/data/satellites.json");
const GP_URL = "https://celestrak.org/NORAD/elements/gp.php";
const SATCAT_URL = "https://celestrak.org/satcat/records.php";

const GM_KM3_S2 = 398600.4418; // 지구 중력상수
const EARTH_RADIUS_KM = 6378.137;
const GEO_ALTITUDE_THRESHOLD_KM = 34000; // 정지궤도(~35,786km) 근방부터 GEO로 본다
const LEO_ALTITUDE_THRESHOLD_KM = 2000;

// lib/satellite/types.ts의 SEOUL_OBSERVER와 같은 값.
const SEOUL_OBSERVER = { lat: 37.5665, lon: 126.978 };
// lib/satellite/screen.ts의 toScreen/ZENITH_PCT/HORIZON_PCT, 그리고
// lib/satellite/useSatellitePositions.ts의 MIN_SEPARATION_PCT와 같은
// 값 — 여기서 겹친다고 판단한 기준이 클라이언트가 그릴 때와
// 어긋나면 안 되므로 셋이 같이 맞물려 있다.
const ZENITH_PCT = 8;
const HORIZON_PCT = 90;
const MIN_SEPARATION_PCT = 8;

function toScreen(azimuthDeg, elevationDeg) {
  return {
    left: (azimuthDeg / 360) * 100,
    top: ZENITH_PCT + (1 - elevationDeg / 90) * (HORIZON_PCT - ZENITH_PCT),
  };
}

function screenDistance(a, b) {
  const pa = toScreen(a.azimuthDeg, a.elevationDeg);
  const pb = toScreen(b.azimuthDeg, b.elevationDeg);
  let dLeft = Math.abs(pa.left - pb.left);
  if (dLeft > 50) dLeft = 100 - dLeft;
  const dTop = pa.top - pb.top;
  return Math.hypot(dLeft, dTop);
}

async function fetchTle(query) {
  const res = await fetch(`${GP_URL}?${query}&FORMAT=TLE`);
  if (!res.ok) {
    throw new Error(`CelesTrak GP request failed (${res.status}): ${query}`);
  }
  const text = (await res.text()).trim();
  if (!text || text.startsWith("No GP data") || text.startsWith("Invalid query")) {
    return [];
  }
  const lines = text.split("\n").map((l) => l.trimEnd());
  const out = [];
  for (let i = 0; i + 2 < lines.length + 1 && i + 2 <= lines.length; i += 3) {
    const [name, tle1, tle2] = [lines[i], lines[i + 1], lines[i + 2]];
    if (!name || !tle1 || !tle2) continue;
    out.push({ name: name.trim(), tle1, tle2 });
  }
  return out;
}

async function fetchByCatnr(noradId) {
  const entries = await fetchTle(`CATNR=${noradId}`);
  return entries[0];
}

async function fetchGroup(group) {
  return fetchTle(`GROUP=${group}`);
}

/**
 * 그룹의 SATCAT 레코드에서 실제 임무를 수행(했)는 PAYLOAD의 NORAD ID와,
 * 그중 한국 소유(OWNER === "SKOR") NORAD ID를 함께 모은다.
 */
async function fetchSatcatInfo(group) {
  const res = await fetch(`${SATCAT_URL}?GROUP=${group}&FORMAT=json`);
  if (!res.ok) {
    throw new Error(`CelesTrak SATCAT request failed (${res.status}): GROUP=${group}`);
  }
  const records = await res.json();
  const payloadIds = new Set();
  const koreanIds = new Set();
  for (const r of records) {
    if (r.OBJECT_TYPE !== "PAY") continue;
    payloadIds.add(r.NORAD_CAT_ID);
    if (r.OWNER === "SKOR") koreanIds.add(r.NORAD_CAT_ID);
  }
  return { payloadIds, koreanIds };
}

function parseNoradFromTle(tle1) {
  return Number.parseInt(tle1.slice(2, 7), 10);
}

/**
 * SATCAT에서 "현재 활동 중"으로 분류된 전체 객체 중 대한민국
 * 소유(OWNER === "SKOR")·PAYLOAD(OBJECT_TYPE === "PAY")인 것만 골라,
 * `active` 그룹 TLE 전체에서 그 NORAD ID에 해당하는 TLE를 찾아온다.
 * 기업·대학 큐브샛을 포함해 CelesTrak SATCAT을 그대로 따라가므로
 * 새 위성이 뜨거나 수명이 다해도 손으로 고칠 필요가 없다. (달 궤도인
 * 다누리처럼 SGP4로 전파할 수 없는 궤도는 `active` TLE 목록 자체에
 * 없어 자동으로 빠진다.)
 */
async function fetchKoreanPayloads() {
  const satcatRes = await fetch(`${SATCAT_URL}?GROUP=active&FORMAT=json`);
  if (!satcatRes.ok) {
    throw new Error(`CelesTrak SATCAT request failed (${satcatRes.status}): GROUP=active`);
  }
  const records = await satcatRes.json();
  const koreanIds = new Set();
  for (const r of records) {
    if (r.OBJECT_TYPE === "PAY" && r.OWNER === "SKOR") koreanIds.add(r.NORAD_CAT_ID);
  }

  const tle = await fetchGroup("active");
  return tle.filter((v) => koreanIds.has(parseNoradFromTle(v.tle1)));
}

/** TLE 2행의 평균 운동(revs/day, 52~63번째 열)에서 궤도 긴반지름 → 고도(km)를 구한다. */
function altitudeKmFromTle(tle2) {
  const meanMotion = Number.parseFloat(tle2.slice(52, 63));
  const n = (meanMotion * 2 * Math.PI) / 86400; // rad/s
  const semiMajorAxisKm = Math.cbrt(GM_KM3_S2 / (n * n));
  return semiMajorAxisKm - EARTH_RADIUS_KM;
}

function orbitClassFromAltitude(altitudeKm) {
  if (altitudeKm < LEO_ALTITUDE_THRESHOLD_KM) return "leo";
  if (altitudeKm >= GEO_ALTITUDE_THRESHOLD_KM) return "geo";
  return "meo";
}

function makeEntry(name, noradId, tle1, tle2, isKorean) {
  const entry = { name, noradId, tle1, tle2 };
  if (isKorean) entry.isKorean = true;
  try {
    const altitudeKm = Math.round(altitudeKmFromTle(tle2));
    entry.altitudeKm = altitudeKm;
    entry.orbitClass = orbitClassFromAltitude(altitudeKm);
  } catch {
    // 평균 운동 파싱 실패 — 고도 정보 없이 둔다(클라이언트가 없으면 숨긴다).
  }
  return entry;
}

/**
 * group의 TLE 후보를 받아, 실제 PAYLOAD만 남기고(각 항목에 isKorean
 * 표시) 선택적으로 고르게 샘플링한다.
 */
async function fetchPayloadCandidates(group, sampleSize) {
  const [tle, { payloadIds, koreanIds }] = await Promise.all([
    fetchGroup(group),
    fetchSatcatInfo(group),
  ]);
  const payloads = tle
    .filter((v) => payloadIds.has(parseNoradFromTle(v.tle1)))
    .map((v) => ({ ...v, isKorean: koreanIds.has(parseNoradFromTle(v.tle1)) }));
  if (!sampleSize || payloads.length <= sampleSize) return payloads;
  const step = Math.max(1, Math.floor(payloads.length / sampleSize));
  const sampled = [];
  for (let i = 0; i < payloads.length; i += step) sampled.push(payloads[i]);
  return sampled;
}

/**
 * 정지궤도 후보를 서울 기준 방위각·앙각으로 한 번 계산해서, 화면상
 * 너무 가까운(MIN_SEPARATION_PCT 이내) 것끼리는 하나만 남긴다.
 * 정지궤도는 고정 관측자 기준으로는 사실상 움직이지 않으므로, 이
 * 선별을 매 틱 클라이언트에서 다시 하지 않고 여기서 한 번만 해
 * 둔다 — 그래야 앙각이 근소하게 뒤바뀌어도 어느 게 걸러질지 계속
 * 바뀌며 깜빡이는 일이 없다. 지평선 아래(앙각<0)는 아예 제외한다.
 */
function dedupeGeoBySeoulScreenPosition(candidates) {
  const now = new Date();
  const gmst = gstime(now);
  const observerGd = {
    longitude: degreesToRadians(SEOUL_OBSERVER.lon),
    latitude: degreesToRadians(SEOUL_OBSERVER.lat),
    height: 0.1,
  };

  const withLookAngles = [];
  for (const v of candidates) {
    try {
      const satrec = twoline2satrec(v.tle1, v.tle2);
      const pv = propagate(satrec, now);
      if (!pv || !pv.position) continue;
      const ecf = eciToEcf(pv.position, gmst);
      const look = ecfToLookAngles(observerGd, ecf);
      const elevationDeg = radiansToDegrees(look.elevation);
      if (elevationDeg < 0) continue;
      const azimuthDeg = (radiansToDegrees(look.azimuth) + 360) % 360;
      withLookAngles.push({ v, azimuthDeg, elevationDeg });
    } catch {
      // 이 후보만 건너뛴다(전파 실패 등).
    }
  }

  // 한국 위성을 먼저 두면, 겹치는 묶음 안에 한국 위성이 있을 때
  // 그 묶음을 대표해서 살아남는다.
  withLookAngles.sort((a, b) => {
    if (a.v.isKorean !== b.v.isKorean) return a.v.isKorean ? -1 : 1;
    return b.elevationDeg - a.elevationDeg;
  });

  const kept = [];
  for (const candidate of withLookAngles) {
    const overlaps = kept.some((k) => screenDistance(candidate, k) < MIN_SEPARATION_PCT);
    if (overlaps) continue;
    kept.push(candidate);
  }
  return kept.map((k) => k.v);
}

async function main() {
  const priority = JSON.parse(fs.readFileSync(PRIORITY_FILE, "utf8"));

  const satellites = [];
  const seen = new Set();

  for (const p of priority) {
    try {
      const found = await fetchByCatnr(p.noradId);
      if (found) {
        satellites.push(makeEntry(p.name, p.noradId, found.tle1, found.tle2));
        seen.add(p.noradId);
      } else {
        console.warn(`[fetch-satellites] not found in CelesTrak: ${p.name} (${p.noradId})`);
      }
    } catch (err) {
      console.warn(`[fetch-satellites] skip ${p.name} (${p.noradId}): ${err.message}`);
    }
  }

  // 한국 기업·대학 소유 소형위성·큐브샛까지 포함해, 현재 활동 중인
  // 한국 위성 전체를 SATCAT에서 받아 온다 (fetchKoreanPayloads 주석 참고).
  // 천리안·무궁화·아나시스처럼 정지궤도인 것들은 다른 정지궤도
  // 후보와 마찬가지로 서울 상공에서 경도대가 몰려 겹쳐 보이므로,
  // 이 묶음만 따로 떼어 dedupeGeoBySeoulScreenPosition으로 한 번
  // 걸러 준다(저·중궤도 한국 위성은 그럴 일이 없어 그대로 둔다).
  try {
    const korean = await fetchKoreanPayloads();
    const koreanGeo = [];
    const koreanOther = [];
    for (const v of korean) {
      let orbitClass;
      try {
        orbitClass = orbitClassFromAltitude(altitudeKmFromTle(v.tle2));
      } catch {
        orbitClass = undefined;
      }
      (orbitClass === "geo" ? koreanGeo : koreanOther).push(v);
    }
    const koreanGeoDeduped = dedupeGeoBySeoulScreenPosition(koreanGeo);
    for (const v of [...koreanOther, ...koreanGeoDeduped]) {
      const noradId = parseNoradFromTle(v.tle1);
      if (seen.has(noradId)) continue;
      satellites.push(makeEntry(v.name, noradId, v.tle1, v.tle2, true));
      seen.add(noradId);
    }
    console.log(
      `[fetch-satellites] korean: ${koreanOther.length} non-geo + geo ${koreanGeo.length} candidates -> ${koreanGeoDeduped.length} after dedup`,
    );
  } catch (err) {
    console.warn(`[fetch-satellites] korean payloads fetch failed: ${err.message}`);
  }

  // 남는 자리를 채울 밝은 위성 후보 (앙각 기준 선정은 클라이언트가 한다).
  try {
    const visual = await fetchPayloadCandidates("visual");
    for (const v of visual) {
      const noradId = parseNoradFromTle(v.tle1);
      if (seen.has(noradId)) continue;
      satellites.push(makeEntry(v.name, noradId, v.tle1, v.tle2, v.isKorean));
      seen.add(noradId);
    }
  } catch (err) {
    console.warn(`[fetch-satellites] visual group fetch failed: ${err.message}`);
  }

  // 스타링크는 저궤도에 1만 기 넘게 퍼져 있어, 연속으로 N개를 받으면
  // 같은 궤도면(발사 배치)에 몰려 특정 시간대엔 다 같이 지평선
  // 아래에 있기 쉽다. 전체를 고른 간격으로 샘플링해 여러 궤도면을
  // 섞는다. 표본이 클수록 특정 순간에 앙각 10° 이상인 저궤도 후보가
  // 있을 확률이 올라간다(전체 대비 표본 비율이 낮아 순간 가시율이
  // 낮다 — 선정 상한을 늘렸다면 표본도 같이 늘려야 체감이 된다).
  try {
    const starlink = await fetchPayloadCandidates("starlink", 150);
    for (const v of starlink) {
      const noradId = parseNoradFromTle(v.tle1);
      if (seen.has(noradId)) continue;
      satellites.push(makeEntry(v.name, noradId, v.tle1, v.tle2, v.isKorean));
      seen.add(noradId);
    }
  } catch (err) {
    console.warn(`[fetch-satellites] starlink group fetch failed: ${err.message}`);
  }

  // GPS(중궤도) — 그룹 자체가 30여 기뿐이라 전부 받는다.
  try {
    const gps = await fetchPayloadCandidates("gps-ops");
    for (const v of gps) {
      const noradId = parseNoradFromTle(v.tle1);
      if (seen.has(noradId)) continue;
      satellites.push(makeEntry(v.name, noradId, v.tle1, v.tle2, v.isKorean));
      seen.add(noradId);
    }
  } catch (err) {
    console.warn(`[fetch-satellites] gps-ops group fetch failed: ${err.message}`);
  }

  // 글로나스(러시아 위성항법, 중궤도) — GPS와 같은 중궤도지만 궤도면
  // 배치가 달라 GPS만 있을 때보다 하늘에 퍼지는 폭이 넓어진다.
  // 그룹 자체가 30여 기뿐이라 전부 받는다.
  try {
    const glonass = await fetchPayloadCandidates("glo-ops");
    for (const v of glonass) {
      const noradId = parseNoradFromTle(v.tle1);
      if (seen.has(noradId)) continue;
      satellites.push(makeEntry(v.name, noradId, v.tle1, v.tle2, v.isKorean));
      seen.add(noradId);
    }
  } catch (err) {
    console.warn(`[fetch-satellites] glo-ops group fetch failed: ${err.message}`);
  }

  // 정지궤도 — 경도별로 수백 기가 있어서 전부 후보로 쓰는 대신,
  // 서울 기준 화면 좌표로 겹치는 것들을 미리 한 번만 걸러 둔다
  // (dedupeGeoBySeoulScreenPosition 주석 참고).
  try {
    const geoAll = await fetchPayloadCandidates("geo");
    const geo = dedupeGeoBySeoulScreenPosition(geoAll);
    console.log(`[fetch-satellites] geo: ${geoAll.length} candidates -> ${geo.length} after dedup`);
    for (const v of geo) {
      const noradId = parseNoradFromTle(v.tle1);
      if (seen.has(noradId)) continue;
      satellites.push(makeEntry(v.name, noradId, v.tle1, v.tle2, v.isKorean));
      seen.add(noradId);
    }
  } catch (err) {
    console.warn(`[fetch-satellites] geo group fetch failed: ${err.message}`);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    satellites,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`[fetch-satellites] wrote ${satellites.length} satellites to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
