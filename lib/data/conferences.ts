import fs from "node:fs";
import path from "node:path";

/**
 * 컨퍼런스 노트(spec §4.4)를 빌드 시점에 startergate/Conferences
 * 체크아웃에서 읽는다. 체크아웃은 scripts/fetch-conferences.mjs가
 * `.conferences/`에 받아 두고, `CONFERENCES_DIR`로 다른 폴더를 가리킬
 * 수 있다.
 *
 * 저장소 작성 규칙(frontmatter `title`/`date`/`day`, `day-N/` 폴더,
 * `| Time | Topic |` 표, 노트의 `#` 제목 + `####` 발표자)은 spec §4.4에
 * 있다. frontmatter가 아직 없는 README는 `#` 제목과 루트 README의
 * 연도·월 목록으로 대신 채운다(hasFrontmatter=false, 빌드 로그에 경고).
 */

// scripts/fetch-conferences.mjs의 TARGET과 같은 값.
const DEFAULT_CONFERENCES_DIR = ".conferences";

export const CONFERENCES_REPO = "startergate/Conferences";
export const CONFERENCES_BRANCH = "master";

export type ConferenceSession = {
  /** URL segment. Empty for sessions without a note (not routable). */
  slug: string;
  title: string;
  /** "10:00 ~ 10:20"; undefined when the table says "-". */
  time?: string;
  /** One line: "이름, 이름 · 소속". */
  speaker?: string;
  /** Day number of the day this session belongs to, if known. */
  day?: number;
  /** Repo-relative path of the note md; undefined when there is no note. */
  notePath?: string;
};

export type ConferenceDay = {
  /** DAY N; null when the event has no day split. */
  day: number | null;
  /** "YYYY-MM-DD" (or coarser) */
  date?: string;
  sessions: ConferenceSession[];
};

export type ConferenceEvent = {
  slug: string;
  /** Repo-relative folder; undefined for events listed only in the root README. */
  dir?: string;
  title: string;
  /** Attended dates, ascending. "YYYY" | "YYYY-MM" | "YYYY-MM-DD". */
  dates: string[];
  /** Set when only one day of a multi-day event was attended. */
  attendedDay?: number;
  /** Notes kept elsewhere: the README is a single outside link. */
  externalUrl?: string;
  days: ConferenceDay[];
  /** Number of sessions that have a note. */
  noteCount: number;
  hasFrontmatter: boolean;
};

export type ConferenceNote = {
  event: ConferenceEvent;
  session: ConferenceSession;
  /** Markdown body without frontmatter, title and speaker lines. */
  body: string;
  prev?: ConferenceSession;
  next?: ConferenceSession;
};

function sourceDir(): string {
  return path.resolve(process.env.CONFERENCES_DIR || DEFAULT_CONFERENCES_DIR);
}

// ---------------------------------------------------------------- parsing

type Frontmatter = Record<string, string | string[]>;

function unquote(raw: string): string {
  const v = raw.trim();
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
    try {
      return JSON.parse(v) as string;
    } catch {
      return v.slice(1, -1);
    }
  }
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) {
    return v.slice(1, -1).replaceAll("''", "'");
  }
  return v;
}

/** Minimal YAML frontmatter: `key: value` and `key: [a, b]` only. */
export function splitFrontmatter(src: string): { data: Frontmatter | null; body: string } {
  const text = src.replace(/^﻿/, "");
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(text);
  if (!m) return { data: null, body: text };
  const data: Frontmatter = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    const value = kv[2].replace(/\s+#.*$/, "").trim();
    data[kv[1]] =
      value.startsWith("[") && value.endsWith("]")
        ? value
            .slice(1, -1)
            .split(",")
            .map(unquote)
            .filter(Boolean)
        : unquote(value);
  }
  return { data, body: text.slice(m[0].length) };
}

function asList(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  return (Array.isArray(v) ? v : [v]).map((s) => s.trim()).filter(Boolean);
}

function firstHeading(body: string): string | undefined {
  const m = /^#\s+(.+?)\s*#*\s*$/m.exec(body);
  return m?.[1];
}

/** "DEVIEW 2019 DAY 1 (10/28)" → "DEVIEW 2019" */
function stripDaySuffix(title: string): string {
  return title.replace(/\s+DAY\s*\d+.*$/i, "").trim();
}

/** "(10/28)" in a heading → { month, day } */
function headingMonthDay(text: string): { month: number; day: number } | undefined {
  const m = /\((\d{1,2})\/(\d{1,2})\)/.exec(text);
  return m ? { month: Number(m[1]), day: Number(m[2]) } : undefined;
}

function headingDayNumber(text: string): number | undefined {
  const m = /\bDAY\s*(\d+)/i.exec(text);
  return m ? Number(m[1]) : undefined;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Speaker line "백정태 - 카카오 / 정원천 - 카카오" → "백정태, 정원천 · 카카오". */
export function formatSpeaker(raw: string): string {
  const people = raw
    .split(/\s+\/\s+/)
    .map((p) => {
      const i = p.indexOf(" - ");
      return i < 0
        ? { name: p.trim(), org: undefined }
        : { name: p.slice(0, i).trim(), org: p.slice(i + 3).trim() };
    })
    .filter((p) => p.name);
  const orgs = new Set(people.map((p) => p.org));
  if (orgs.size === 1) {
    const [org] = orgs;
    const names = people.map((p) => p.name).join(", ");
    return org ? `${names} · ${org}` : names;
  }
  return people.map((p) => (p.org ? `${p.name} · ${p.org}` : p.name)).join(", ");
}

type TableRow = { time?: string; title: string; href?: string };
type ParsedTable = { heading?: string; rows: TableRow[] };

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

/** Every `| Time | Topic |` table in a README, with the `##` heading above it. */
function parseSessionTables(body: string): ParsedTable[] {
  const lines = body.split(/\r?\n/);
  const tables: ParsedTable[] = [];
  let heading: string | undefined;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h = /^#{2,6}\s+(.+)$/.exec(line);
    if (h) heading = h[1];
    if (!line.trim().startsWith("|")) continue;
    const header = splitRow(line).map((c) => c.toLowerCase());
    if (!(header[0] === "time" && header[1] === "topic")) continue;
    const rows: TableRow[] = [];
    i += 2; // header + separator
    for (; i < lines.length && lines[i].trim().startsWith("|"); i++) {
      const [time = "", topic = ""] = splitRow(lines[i]);
      if (!topic) continue;
      const link = /^\[(.*)\]\(([^)\s]+)\)$/.exec(topic);
      rows.push({
        time: time && time !== "-" ? time : undefined,
        title: link ? link[1] : topic,
        href: link ? link[2] : undefined,
      });
    }
    i--;
    tables.push({ heading, rows });
  }
  return tables;
}

type NoteFile = { title?: string; speakerRaw?: string; body: string };

/** Splits a note into its `#` title, the `####` speaker line right below it, and the rest. */
function parseNote(src: string): NoteFile {
  const { body } = splitFrontmatter(src);
  const lines = body.split(/\r?\n/);
  const t = lines.findIndex((l) => /^#\s+/.test(l));
  if (t < 0) return { body };
  const title = lines[t].replace(/^#\s+/, "").replace(/\s*#*\s*$/, "");
  let j = t + 1;
  while (j < lines.length && !lines[j].trim()) j++;
  let speakerRaw: string | undefined;
  if (j < lines.length && /^####\s+/.test(lines[j])) {
    speakerRaw = lines[j].replace(/^####\s+/, "").trim();
    j++;
  }
  return { title, speakerRaw, body: [...lines.slice(0, t), ...lines.slice(j)].join("\n") };
}

/** Root README year/month list → { "deview-2019": "2019-10", ... } plus unlinked names. */
type RootEntry = { title: string; dir?: string; url?: string; date: string };

function parseRootIndex(src: string): RootEntry[] {
  const entries: RootEntry[] = [];
  let year: string | undefined;
  let month: string | undefined;
  for (const line of src.split(/\r?\n/)) {
    const y = /^##\s+(\d{4})년/.exec(line);
    if (y) {
      year = y[1];
      month = undefined;
      continue;
    }
    const m = /^###\s+(\d{1,2})월/.exec(line);
    if (m) {
      month = pad(Number(m[1]));
      continue;
    }
    const item = /^\*\s+(.+)$/.exec(line);
    if (!item || !year) continue;
    const link = /^\[(.*)\]\(([^)]+)\)$/.exec(item[1].trim());
    const href = link?.[2];
    const local = href && !/^[a-z]+:/i.test(href) ? normalizeDir(href) : undefined;
    entries.push({
      title: link ? link[1] : item[1].trim(),
      dir: local,
      // Only web links become card links (no javascript: and the like).
      url: href && !local && /^https?:\/\//i.test(href) ? href : undefined,
      date: month ? `${year}-${month}` : year,
    });
  }
  return entries;
}

function normalizeDir(p: string): string {
  return p.replace(/^\.\//, "").replace(/\/+$/, "");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------- loading

/** Reads a file inside the checkout; undefined if missing or (via a symlink) outside it. */
function readInside(root: string, file: string): string | undefined {
  if (!isInside(root, file)) return undefined;
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return undefined;
  }
}

/** True if `file` (after resolving symlinks) is inside `root`. */
function isInside(root: string, file: string): boolean {
  try {
    const realRoot = fs.realpathSync(root);
    return fs.realpathSync(file).startsWith(realRoot + path.sep);
  } catch {
    return false;
  }
}

function isFile(file: string): boolean {
  try {
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

/** Resolves a table link to a repo-relative note path if the file exists. */
function resolveNote(root: string, dir: string, href: string | undefined): string | undefined {
  if (!href || /^[a-z]+:/i.test(href) || href.startsWith("#")) return undefined;
  let decoded: string;
  try {
    decoded = decodeURI(href);
  } catch {
    return undefined;
  }
  const rel = path.posix.normalize(path.posix.join(dir, decoded));
  // Never read outside the checkout (e.g. a "../../x.md" link).
  if (rel.startsWith("../") || rel === ".." || path.posix.isAbsolute(rel)) return undefined;
  for (const candidate of [rel, `${rel}.md`]) {
    if (isInside(root, path.join(root, candidate)) && isFile(path.join(root, candidate))) {
      return candidate;
    }
  }
  return undefined;
}

function buildSessions(
  root: string,
  dir: string,
  rows: TableRow[],
  day: number | undefined,
): ConferenceSession[] {
  return rows.map((row) => {
    const notePath = resolveNote(root, dir, row.href);
    const session: ConferenceSession = { slug: "", title: row.title, time: row.time, day, notePath };
    if (notePath) {
      const note = parseNote(fs.readFileSync(path.join(root, notePath), "utf8"));
      if (note.title) session.title = note.title;
      if (note.speakerRaw) session.speaker = formatSpeaker(note.speakerRaw);
      session.slug = slugify(path.posix.basename(notePath).replace(/\.md$/i, ""));
    }
    return session;
  });
}

function dateFromHeading(heading: string | undefined, year: string | undefined): string | undefined {
  if (!heading || !year) return undefined;
  const md = headingMonthDay(heading);
  return md ? `${year}-${pad(md.month)}-${pad(md.day)}` : undefined;
}

function loadEvent(
  root: string,
  dir: string,
  rootIndex: RootEntry[],
): ConferenceEvent | undefined {
  const readme = readInside(root, path.join(root, dir, "README.md"));
  if (readme === undefined) return undefined;
  const { data, body } = splitFrontmatter(readme);
  const heading = firstHeading(body);
  const indexed = rootIndex.find((e) => e.dir === dir);
  const title =
    (typeof data?.title === "string" && data.title) ||
    (heading && stripDaySuffix(heading)) ||
    indexed?.title ||
    dir;
  const fallbackYear = indexed?.date.slice(0, 4) ?? /\b(20\d{2})\b/.exec(title)?.[1];
  let hasFrontmatter = Boolean(data?.title);

  const days: ConferenceDay[] = [];
  // Event README dates; with day-N/ folders each day carries its own instead.
  const fmDates = asList(data?.date);
  const dayDirs = fs
    .readdirSync(path.join(root, dir), { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^day-\d+$/i.test(d.name))
    .map((d) => ({ name: d.name, n: Number(d.name.slice(4)) }))
    .sort((a, b) => a.n - b.n);

  if (dayDirs.length > 0) {
    for (const d of dayDirs) {
      const dayDir = `${dir}/${d.name}`;
      const src = readInside(root, path.join(root, dayDir, "README.md"));
      if (src === undefined) continue;
      const parsed = splitFrontmatter(src);
      const date =
        asList(parsed.data?.date)[0] ??
        dateFromHeading(firstHeading(parsed.body), fallbackYear);
      if (!parsed.data?.date) hasFrontmatter = false;
      const rows = parseSessionTables(parsed.body).flatMap((t) => t.rows);
      days.push({ day: d.n, date, sessions: buildSessions(root, dayDir, rows, d.n) });
    }
  } else {
    const tables = parseSessionTables(body);
    if (tables.length > 1) {
      // Several days in one README, each table under a "## DAY N (m/d)" heading.
      tables.forEach((t, i) => {
        const n = headingDayNumber(t.heading ?? "") ?? i + 1;
        const date = fmDates[i] ?? dateFromHeading(t.heading, fallbackYear);
        days.push({ day: n, date, sessions: buildSessions(root, dir, t.rows, n) });
      });
    } else if (tables.length === 1) {
      const n = data?.day ? Number(data.day) : headingDayNumber(heading ?? "");
      days.push({
        day: n ?? null,
        date: fmDates[0] ?? dateFromHeading(heading, fallbackYear) ?? indexed?.date,
        sessions: buildSessions(root, dir, tables[0].rows, n),
      });
    } else if (/^#{2,6}\s+/m.test(body)) {
      // The README itself is the only note (no session table, but sections).
      days.push({
        day: null,
        date: fmDates[0] ?? indexed?.date,
        // The note's own "#" heading is its title (usually the event title).
        sessions: [{ slug: "note", title: heading ?? title, notePath: `${dir}/README.md` }],
      });
    } else if (fmDates[0] ?? indexed?.date) {
      days.push({ day: null, date: fmDates[0] ?? indexed?.date, sessions: [] });
    }
    if (!data?.date) hasFrontmatter = false;
  }

  // Unique session slugs within the event.
  const seen = new Set<string>();
  for (const s of days.flatMap((d) => d.sessions)) {
    if (!s.slug) continue;
    let slug = s.slug;
    if (seen.has(slug) && s.day) slug = `${slug}-day-${s.day}`;
    for (let k = 2; seen.has(slug); k++) slug = `${s.slug}-${k}`;
    seen.add(slug);
    s.slug = slug;
  }

  // All attended dates: each day's date plus every date the README lists
  // (a date list with a single session table has no per-day split).
  const dates = Array.from(
    new Set(
      [...days.map((d) => d.date), ...(dayDirs.length === 0 ? fmDates : [])].filter(
        (d): d is string => Boolean(d),
      ),
    ),
  ).sort();
  if (dates.length === 0 && indexed) dates.push(indexed.date);
  const daysWithDay = days.filter((d) => d.day !== null);
  const attendedDay =
    typeof data?.day === "string" && data.day
      ? Number(data.day)
      : daysWithDay.length === 1
        ? (daysWithDay[0].day ?? undefined)
        : undefined;

  // A README that is only an outside link (e.g. notes kept in another repo).
  const outside = /^\s*\[[^\]]*\]\((https?:\/\/[^)\s]+)\)\s*$/.exec(
    body.replace(/^#\s+.*$/m, ""),
  );

  return {
    slug: slugify(dir),
    dir,
    title,
    dates,
    attendedDay,
    externalUrl: outside?.[1],
    days: days.filter((d) => d.sessions.length > 0 || d.date),
    noteCount: days.flatMap((d) => d.sessions).filter((s) => s.notePath).length,
    hasFrontmatter,
  };
}

/** Folders with a README.md, not descending into an event or its day-N/static folders. */
function findEventDirs(root: string, rel = ""): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    // day-N/ folders are days of their parent event (read by loadEvent), never
    // events of their own, even when the parent README is missing.
    if (/^day-\d+$/i.test(entry.name)) continue;
    const child = rel ? `${rel}/${entry.name}` : entry.name;
    const readme = readInside(root, path.join(root, child, "README.md"));
    if (readme !== undefined) out.push(child);
    // A README with a frontmatter title is an event: its subfolders are days
    // or assets. Without one (fallback mode) it may also be a grouping
    // folder, so nested events are still looked for.
    if (readme === undefined || !splitFrontmatter(readme).data?.title) {
      out.push(...findEventDirs(root, child));
    }
  }
  return out;
}

let cache: ConferenceEvent[] | undefined;

/** All events, newest first. */
export function getConferenceEvents(): ConferenceEvent[] {
  if (cache) return cache;
  const root = sourceDir();
  if (!fs.existsSync(path.join(root, "README.md"))) {
    throw new Error(
      `Conferences checkout not found at ${root}. Run \`node scripts/fetch-conferences.mjs\` or set CONFERENCES_DIR.`,
    );
  }
  const rootIndex = parseRootIndex(fs.readFileSync(path.join(root, "README.md"), "utf8"));
  const events = findEventDirs(root)
    .map((dir) => loadEvent(root, dir, rootIndex))
    .filter((e): e is ConferenceEvent => Boolean(e));

  // Fallback only (spec §4.4): events listed in the root README with no
  // folder of their own become "노트 없음" entries. A link to a folder that
  // exists but is not an event (e.g. a parent like g-con/) is skipped.
  for (const entry of rootIndex) {
    if (entry.dir && events.some((e) => e.dir === entry.dir)) continue;
    if (entry.dir && fs.existsSync(path.join(root, entry.dir))) continue;
    if (events.some((e) => e.title === entry.title)) continue;
    events.push({
      slug: slugify(entry.dir ?? entry.title),
      title: entry.title,
      dates: [entry.date],
      externalUrl: entry.url,
      days: [],
      noteCount: 0,
      hasFrontmatter: false,
    });
  }

  const missing = events.filter((e) => e.dir && !e.hasFrontmatter).map((e) => e.dir);
  if (missing.length > 0) {
    console.warn(
      `[conferences] README frontmatter (title/date) missing, using fallbacks: ${missing.join(", ")}`,
    );
  }

  cache = events.sort(
    (a, b) =>
      (b.dates[0] ?? "").localeCompare(a.dates[0] ?? "") || a.title.localeCompare(b.title),
  );
  return cache;
}

export function getConferenceEvent(slug: string): ConferenceEvent | undefined {
  return getConferenceEvents().find((e) => e.slug === slug);
}

export function getEventYear(event: ConferenceEvent): string {
  return event.dates[0]?.slice(0, 4) ?? "";
}

export function getNotedSessions(event: ConferenceEvent): ConferenceSession[] {
  return event.days.flatMap((d) => d.sessions).filter((s) => s.notePath);
}

export function getConferenceNote(eventSlug: string, sessionSlug: string): ConferenceNote | undefined {
  const event = getConferenceEvent(eventSlug);
  if (!event) return undefined;
  const noted = getNotedSessions(event);
  const i = noted.findIndex((s) => s.slug === sessionSlug);
  if (i < 0) return undefined;
  const session = noted[i];
  const src = fs.readFileSync(path.join(sourceDir(), session.notePath!), "utf8");
  // parseNote drops the "#" title (for a README-as-note, the event title).
  const { body } = parseNote(src);
  return { event, session, body, prev: noted[i - 1], next: noted[i + 1] };
}

export function getConferenceDayDate(event: ConferenceEvent, day: number | undefined): string | undefined {
  return event.days.find((d) => d.day === (day ?? null))?.date;
}

/** github.com URL of a repo path (a folder or a note). */
export function getConferencesSourceUrl(repoPath?: string): string {
  const base = `https://github.com/${CONFERENCES_REPO}`;
  if (!repoPath) return base;
  const kind = repoPath.endsWith(".md") ? "blob" : "tree";
  return `${base}/${kind}/${CONFERENCES_BRANCH}/${repoPath.split("/").map(encodeURIComponent).join("/")}`;
}
