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
