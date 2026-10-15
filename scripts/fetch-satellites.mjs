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
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PRIORITY_FILE = path.join(ROOT, "data/satellite-priority.json");
const OUT_FILE = path.join(ROOT, "public/data/satellites.json");
const CELESTRAK = "https://celestrak.org/NORAD/elements/gp.php";

async function fetchTle(query) {
  const res = await fetch(`${CELESTRAK}?${query}&FORMAT=TLE`);
  if (!res.ok) {
    throw new Error(`CelesTrak request failed (${res.status}): ${query}`);
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

function parseNoradFromTle(tle1) {
  return Number.parseInt(tle1.slice(2, 7), 10);
}

async function main() {
  const priority = JSON.parse(fs.readFileSync(PRIORITY_FILE, "utf8"));

  const satellites = [];
  const seen = new Set();

  for (const p of priority) {
    try {
      const found = await fetchByCatnr(p.noradId);
      if (found) {
        satellites.push({ name: p.name, noradId: p.noradId, tle1: found.tle1, tle2: found.tle2 });
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
    const visual = await fetchGroup("visual");
    for (const v of visual) {
      const noradId = parseNoradFromTle(v.tle1);
      if (seen.has(noradId)) continue;
      satellites.push({ name: v.name, noradId, tle1: v.tle1, tle2: v.tle2 });
      seen.add(noradId);
    }
  } catch (err) {
    console.warn(`[fetch-satellites] visual group fetch failed: ${err.message}`);
  }

  // 스타링크는 저궤도에 수천 기가 퍼져 있어, 연속으로 N개를 받으면
  // 같은 궤도면(발사 배치)에 몰려 특정 시간대엔 다 같이 지평선
  // 아래에 있기 쉽다. 전체를 고른 간격으로 샘플링해 여러 궤도면을
  // 섞는다.
  const STARLINK_SAMPLE_SIZE = 40;
  try {
    const starlink = await fetchGroup("starlink");
    const step = Math.max(1, Math.floor(starlink.length / STARLINK_SAMPLE_SIZE));
    for (let i = 0; i < starlink.length; i += step) {
      const v = starlink[i];
      const noradId = parseNoradFromTle(v.tle1);
      if (seen.has(noradId)) continue;
      satellites.push({ name: v.name, noradId, tle1: v.tle1, tle2: v.tle2 });
      seen.add(noradId);
    }
  } catch (err) {
    console.warn(`[fetch-satellites] starlink group fetch failed: ${err.message}`);
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
