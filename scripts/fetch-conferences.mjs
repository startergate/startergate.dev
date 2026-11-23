#!/usr/bin/env node
/**
 * 컨퍼런스 페이지(spec §4.4)의 원본인 startergate/Conferences 저장소를
 * 빌드 전에 받아 둔다. `npm run build`(배포 workflow 포함)와
 * `npm run dev`가 이 스크립트를 먼저 돌린다.
 *
 * - 저장소가 이미지 때문에 수백 MB라서, blob 없이 얕게 clone한 뒤
 *   sparse checkout으로 이미지(jpg/jpeg/png 등)를 뺀 나머지만 꺼낸다(확장자 없는
 *   노트 파일도 있어서 `*.md`만으로는 부족하다). 이미지는 빌드에 넣지 않고
 *   raw.githubusercontent.com에서 바로 불러온다(lib/data/conferences-markdown.ts).
 * - `CONFERENCES_DIR` 환경 변수로 로컬 체크아웃을 가리키면 clone하지 않고
 *   그 폴더를 그대로 읽는다(Conferences 쪽 변경을 푸시 전에 확인할 때).
 * - `--if-missing`: 이미 받아 둔 폴더가 있으면 다시 받지 않는다(dev용).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
// lib/data/conferences.ts의 DEFAULT_CONFERENCES_DIR과 같은 값.
const TARGET = path.join(ROOT, ".conferences");
const REPO_URL = "https://github.com/startergate/Conferences.git";
const BRANCH = "master";
// gitignore-style: everything, minus images (case-insensitive extensions).
const ci = (ext) => [...ext].map((c) => `[${c}${c.toUpperCase()}]`).join("");
const SPARSE_PATTERNS = ["/*", ...["jpg", "jpeg", "png", "gif", "webp", "heic", "mp4", "mov"].map((e) => `!*.${ci(e)}`)];

function git(args, cwd) {
  execFileSync("git", args, { cwd, stdio: ["ignore", "inherit", "inherit"] });
}

function main() {
  if (process.env.CONFERENCES_DIR) {
    console.log(
      `[fetch-conferences] CONFERENCES_DIR=${process.env.CONFERENCES_DIR}, skipping clone`,
    );
    return;
  }
  if (process.argv.includes("--if-missing") && fs.existsSync(path.join(TARGET, "README.md"))) {
    console.log("[fetch-conferences] .conferences/ already present, skipping");
    return;
  }

  fs.rmSync(TARGET, { recursive: true, force: true });
  git([
    "clone",
    "--depth=1",
    "--filter=blob:none",
    "--no-checkout",
    "--single-branch",
    `--branch=${BRANCH}`,
    REPO_URL,
    TARGET,
  ]);
  git(["sparse-checkout", "set", "--no-cone", ...SPARSE_PATTERNS], TARGET);
  git(["checkout", BRANCH], TARGET);
  console.log(`[fetch-conferences] checked out ${REPO_URL}#${BRANCH} (images excluded) into .conferences/`);
}

main();
