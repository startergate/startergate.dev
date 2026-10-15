#!/usr/bin/env node
/**
 * GitHub Action이 하루 1회 돌리는 스크립트 (spec §7).
 *
 * data/satellite-priority.json의 NORAD ID를 CATNR로 하나씩 조회하고,
 * 남는 자리를 채울 CelesTrak `visual`(밝은 위성) 그룹을 통째로 받아
 * public/data/satellites.json에 커밋한다. 실제 방위각/앙각 계산과
 * "앙각 10도 이상 중 최대 10개" 선정은 클라이언트(satellite.js)가
 * 그때그때 한다 — 이 스크립트는 후보 TLE만 모아 둔다.
 *
 * CelesTrak 요청은 이 스크립트가 하루 1회만 돌아서 정책을 지킨다
 * (요청 수 자체는 우선 위성 개수만큼이지만, 실행 빈도가 하루 1회다).
 *
 * 2026-10-15 추가: 후보가 165개 있어도 앙각 10° 이상인 게 거의 없어
 * 실제로 뜨는 위성이 적다는 피드백으로, 저궤도에 수천 기가 퍼져
 * 있는 스타링크에서 궤도면을 고르게 훑는 표본을 추가했다(spec §7
 * 선정 기준의 8번째 자리).
 *
 * 2026-10-15 추가: "맨눈으로 보이는 하늘"이라는 원래 컨셉과 달리
 * 고도와 상관없이 다 보여줘도 된다는 피드백으로, 중궤도(GPS)와
 * 정지궤도(GEO) 그룹도 후보에 더했다. TLE의 평균 운동(mean motion)
 * 에서 고도·궤도 종류를 미리 계산해 각 위성 데이터에 같이 담아서,
 * 클라이언트가 다시 계산할 필요 없이 호버 정보에 바로 쓸 수 있게
 * 한다.
 *
 * 2026-10-15 추가: `visual` 그룹엔 실제로 임무를 수행한 적 없는
 * 로켓 동체(R/B)가 섞여 있다는 피드백으로(157개 중 90개가 R/B),
 * CelesTrak의 SATCAT(satcat/records.php)에서 OBJECT_TYPE을 같이
 * 받아 PAYLOAD(PAY)만 후보로 남긴다. 이름 문자열로 "R/B" 패턴을
 * 추측하는 대신 CelesTrak이 분류한 공식 값을 쓴다(이름에 R/B가
 * 안 붙은 예외도 있다 — 예: ATLAS CENTAUR 2는 사실 PAY로 분류됨).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

/** 그룹의 SATCAT 레코드에서 실제 임무를 수행(했)는 PAYLOAD의 NORAD ID만 모은다. */
async function fetchPayloadNoradIds(group) {
  const res = await fetch(`${SATCAT_URL}?GROUP=${group}&FORMAT=json`);
  if (!res.ok) {
    throw new Error(`CelesTrak SATCAT request failed (${res.status}): GROUP=${group}`);
  }
  const records = await res.json();
  const ids = new Set();
  for (const r of records) {
    if (r.OBJECT_TYPE === "PAY") ids.add(r.NORAD_CAT_ID);
  }
  return ids;
}

function parseNoradFromTle(tle1) {
  return Number.parseInt(tle1.slice(2, 7), 10);
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

function makeEntry(name, noradId, tle1, tle2) {
  const entry = { name, noradId, tle1, tle2 };
  try {
    const altitudeKm = Math.round(altitudeKmFromTle(tle2));
    entry.altitudeKm = altitudeKm;
    entry.orbitClass = orbitClassFromAltitude(altitudeKm);
  } catch {
    // 평균 운동 파싱 실패 — 고도 정보 없이 둔다(클라이언트가 없으면 숨긴다).
  }
  return entry;
}

/** group의 TLE 후보를 받아, 실제 PAYLOAD만 남기고 선택적으로 고르게 샘플링한다. */
async function fetchPayloadCandidates(group, sampleSize) {
  const [tle, payloadIds] = await Promise.all([fetchGroup(group), fetchPayloadNoradIds(group)]);
  const payloads = tle.filter((v) => payloadIds.has(parseNoradFromTle(v.tle1)));
  if (!sampleSize || payloads.length <= sampleSize) return payloads;
  const step = Math.max(1, Math.floor(payloads.length / sampleSize));
  const sampled = [];
  for (let i = 0; i < payloads.length; i += step) sampled.push(payloads[i]);
  return sampled;
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

  // 남는 자리를 채울 밝은 위성 후보 (앙각 기준 선정은 클라이언트가 한다).
  try {
    const visual = await fetchPayloadCandidates("visual");
    for (const v of visual) {
      const noradId = parseNoradFromTle(v.tle1);
      if (seen.has(noradId)) continue;
      satellites.push(makeEntry(v.name, noradId, v.tle1, v.tle2));
      seen.add(noradId);
    }
  } catch (err) {
    console.warn(`[fetch-satellites] visual group fetch failed: ${err.message}`);
  }

  // 스타링크는 저궤도에 수천 기가 퍼져 있어, 연속으로 N개를 받으면
  // 같은 궤도면(발사 배치)에 몰려 특정 시간대엔 다 같이 지평선
  // 아래에 있기 쉽다. 전체를 고른 간격으로 샘플링해 여러 궤도면을
  // 섞는다.
  try {
    const starlink = await fetchPayloadCandidates("starlink", 40);
    for (const v of starlink) {
      const noradId = parseNoradFromTle(v.tle1);
      if (seen.has(noradId)) continue;
      satellites.push(makeEntry(v.name, noradId, v.tle1, v.tle2));
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
      satellites.push(makeEntry(v.name, noradId, v.tle1, v.tle2));
      seen.add(noradId);
    }
  } catch (err) {
    console.warn(`[fetch-satellites] gps-ops group fetch failed: ${err.message}`);
  }

  // 정지궤도 — 경도별로 수백 기가 있어 스타링크와 같은 방식으로
  // 고르게 샘플링한다(관측자 위치에 따라 지평선 위에 오는 경도대가
  // 다르므로 한쪽에 몰아 받지 않는다).
  try {
    const geo = await fetchPayloadCandidates("geo", 60);
    for (const v of geo) {
      const noradId = parseNoradFromTle(v.tle1);
      if (seen.has(noradId)) continue;
      satellites.push(makeEntry(v.name, noradId, v.tle1, v.tle2));
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
