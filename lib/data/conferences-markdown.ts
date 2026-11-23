import path from "node:path";

import { Marked, type Tokens } from "marked";

import { CONFERENCES_BRANCH, CONFERENCES_REPO } from "./conferences";

export type TocItem = { id: string; text: string };

const RAW_BASE = `https://raw.githubusercontent.com/${CONFERENCES_REPO}/${CONFERENCES_BRANCH}/`;
const BLOB_BASE = `https://github.com/${CONFERENCES_REPO}/blob/${CONFERENCES_BRANCH}/`;

const isAbsolute = (href: string) => /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//");

/** Only web and mail links survive; javascript:, data: and the like do not. */
const isSafeHref = (href: string, image = false) =>
  !isAbsolute(href) || href.startsWith("//") || (image ? /^https?:/i : /^(https?|mailto):/i).test(href);

/** decodeURIComponent that keeps a malformed escape (e.g. "%E0%A4%A") as is. */
function safeDecode(seg: string): string {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

/** Repo-relative path of a link/image target written relative to `baseDir`. */
function repoPath(baseDir: string, href: string): string {
  const joined = href.startsWith("/") ? href.slice(1) : path.posix.join(baseDir, href);
  return path.posix
    .normalize(joined)
    .split("/")
    .map((seg) => encodeURIComponent(safeDecode(seg)))
    .join("/");
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function decodeEntities(s: string): string {
  return s
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

function headingId(text: string, used: Map<string, number>): string {
  const base =
    text
      .toLowerCase()
      .replace(/<[^>]*>/g, "")
      .replace(/&[a-z#0-9]+;/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "section";
  const n = used.get(base) ?? 0;
  used.set(base, n + 1);
  return n === 0 ? base : `${base}-${n + 1}`;
}

/**
 * Renders a session note (spec §4.4). Images are not part of the build:
 * relative image paths point at raw.githubusercontent.com, other relative
 * links at the file on github.com. `##` headings get ids and form the TOC.
 * Raw HTML is escaped except `<br>` (the only tag the notes use) — the
 * notes come from another repository, so nothing else is passed through.
 */
export function renderConferenceNote(
  markdown: string,
  notePath: string,
): { html: string; toc: TocItem[] } {
  const baseDir = path.posix.dirname(notePath);
  const toc: TocItem[] = [];
  const used = new Map<string, number>();

  const marked = new Marked({
    gfm: true,
    walkTokens(token) {
      if (token.type !== "link" && token.type !== "image") return;
      const t = token as Tokens.Link | Tokens.Image;
      if (!t.href || isAbsolute(t.href) || t.href.startsWith("#")) return;
      t.href = (token.type === "image" ? RAW_BASE : BLOB_BASE) + repoPath(baseDir, t.href);
    },
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const level = Math.min(Math.max(depth, 2), 6);
        if (depth !== 2) return `<h${level}>${inner}</h${level}>\n`;
        const text = decodeEntities(inner.replace(/<[^>]*>/g, "")).trim();
        const id = headingId(text, used);
        toc.push({ id, text });
        return `<h2 id="${id}">${inner}</h2>\n`;
      },
      image({ href, text }) {
        // Placeholders like ![](image) or ![]() in the notes have no file.
        const file = href.split("/").pop() ?? "";
        if (!href || !file.includes(".") || !isSafeHref(href, true)) return "";
        return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}" loading="lazy" />`;
      },
      link({ href, tokens }) {
        const inner = this.parser.parseInline(tokens);
        if (!isSafeHref(href)) return inner;
        const external = isAbsolute(href);
        return `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${inner}</a>`;
      },
      html({ text }) {
        return /^\s*<br\s*\/?>\s*$/i.test(text) ? "<br />" : escapeHtml(text);
      },
    },
  });

  const html = marked.parse(markdown, { async: false });
  return { html, toc };
}
