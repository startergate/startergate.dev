"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { sendEvent } from "@/lib/analytics";
import { useConsoleCapabilities } from "@/lib/console/ConsoleCapabilities";
import { useLang } from "@/lib/i18n/LangProvider";
import { fillTemplate } from "@/lib/i18n/template";
import { useNavMenu } from "@/lib/layout/NavMenuContext";
import { SITE_CONFERENCES_URL, SITE_EMAIL } from "@/lib/site-meta";
import { useTheme } from "@/lib/theme/ThemeProvider";

import styles from "./GroundStationConsole.module.css";

type Status = "closed" | "open" | "closing";

const SECTION_IDS: Record<string, string> = {
  about: "about",
  projects: "projects",
  project: "projects",
  tech: "tech",
  technologies: "tech",
  cv: "resume",
  resume: "resume",
  links: "links",
};

// ↑/↓로 되짚을 수 있는 명령 기록의 최대 개수.
const HISTORY_LIMIT = 50;

/**
 * 좌측 하단 `>_` 지상국 콘솔 (spec §8). 사이트의 모든 기능을 명령으로
 * 조작할 수 있어야 하고, 이 페이지에 없는 기능은 안내만 한다. 열기/
 * 닫기 단축키는 없고, 열려 있을 때 Esc만 닫는다.
 */
export function GroundStationConsole() {
  const { lang, dict } = useLang();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { open: navOpen, setOpen: setNavOpen } = useNavMenu();
  const capabilities = useConsoleCapabilities();

  const [status, setStatus] = useState<Status>("closed");
  const [input, setInput] = useState("");
  const [caret, setCaret] = useState(0);
  const [log, setLog] = useState<string[]>([dict.console.intro1, dict.console.intro2]);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLSpanElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // 실행한 명령 기록(오래된 것 → 최근 것). ↑/↓로 셸처럼 되짚는다.
  // historyIndex가 null이면 기록을 보고 있지 않은 새 입력 상태이고,
  // 탐색을 시작할 때 치던 입력은 draft에 맡겨 두었다가 ↓로 끝까지 오면 돌려준다.
  const history = useRef<string[]>([]);
  const historyIndex = useRef<number | null>(null);
  const draft = useRef("");

  // 입력이 길어져 넘치면 실제 터미널처럼 뒤쪽(커서 쪽)이 보이게 스크롤한다.
  useEffect(() => {
    const el = displayRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [input, caret]);

  // 로그가 스크롤 영역보다 길어지면(예: help) 가장 최근 줄이 가려지지
  // 않도록 새 줄이 추가될 때마다 맨 아래로 따라간다.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  // 실제 <input>의 캐럿 위치(클릭, 화살표/Home/End 이동 포함)를 읽어와
  // 화면에 그리는 가짜 커서가 같은 자리를 따라가게 한다.
  const syncCaret = (el: HTMLInputElement | null) => {
    if (el) setCaret(el.selectionStart ?? el.value.length);
  };

  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;

  const openEgg = () => {
    clearTimeout(closeTimer.current);
    setStatus("open");
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
  };

  const closeEgg = () => {
    if (status !== "open") return;
    setStatus("closing");
    setInput("");
    setCaret(0);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setStatus("closed"), 240);
  };

  const pushLog = (cmd: string, out: string[]) => {
    setLog((prev) => [...prev, `${dict.console.prompt} ${cmd}`, ...out].slice(-10));
    setInput("");
    setCaret(0);
  };

  const scrollToId = (id: string): boolean => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  };

  // 네비 pill의 Conferences 링크와 동일하게 새 탭으로 연다 — 이 앱의 라우트가 아니다(spec §2.4).
  const openConferences = () => {
    window.open(SITE_CONFERENCES_URL, "_blank", "noreferrer");
  };

  const recordHistory = (text: string) => {
    const entries = history.current;
    // 셸처럼 바로 앞과 같은 명령은 한 번만 남긴다.
    if (entries[entries.length - 1] !== text) {
      entries.push(text);
      if (entries.length > HISTORY_LIMIT) entries.shift();
    }
    historyIndex.current = null;
    draft.current = "";
  };

  // 기록에서 꺼낸 값을 입력에 채우고 캐럿을 끝으로 보낸다.
  const recallInput = (value: string) => {
    setInput(value);
    setCaret(value.length);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(value.length, value.length));
  };

  const browseHistory = (direction: "older" | "newer"): boolean => {
    const entries = history.current;
    const index = historyIndex.current;
    if (direction === "older") {
      if (entries.length === 0) return false;
      if (index === null) {
        draft.current = input;
        historyIndex.current = entries.length - 1;
      } else {
        historyIndex.current = Math.max(0, index - 1);
      }
      recallInput(entries[historyIndex.current]);
      return true;
    }
    if (index === null) return false;
    if (index + 1 >= entries.length) {
      historyIndex.current = null;
      recallInput(draft.current);
    } else {
      historyIndex.current = index + 1;
      recallInput(entries[index + 1]);
    }
    return true;
  };

  const runCmd = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    recordHistory(text);
    const parts = text.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts[1]?.toLowerCase();

    switch (cmd) {
      case "help":
      case "?":
        pushLog(text, dict.console.help);
        return;

      case "theme": {
        const next = arg === "dark" || arg === "light" ? arg : theme === "dark" ? "light" : "dark";
        setTheme(next);
        pushLog(text, [fillTemplate(dict.console.themeChangedTemplate, { value: next })]);
        return;
      }

      case "mode": {
        if (!capabilities.mode) {
          pushLog(text, [dict.console.modeOnlyMain]);
          return;
        }
        const current = capabilities.mode.current();
        const next = arg === "backend" || arg === "game" ? arg : current === "backend" ? "game" : "backend";
        capabilities.mode.set(next);
        const label = next === "game" ? dict.console.modeGameLabel : dict.console.modeBackendLabel;
        pushLog(text, [fillTemplate(dict.console.modeChangedTemplate, { value: label })]);
        return;
      }

      case "lang": {
        const next = arg === "ko" || arg === "en" ? arg : lang === "ko" ? "en" : "ko";
        if (next !== lang) sendEvent("lang_change", { from: lang, to: next });
        try {
          window.localStorage.setItem("lang", next);
        } catch {
          // 저장 실패해도 이번 전환은 진행한다.
        }
        const segments = pathname.split("/");
        segments[1] = next;
        router.push(segments.join("/") || "/");
        pushLog(text, [
          fillTemplate(dict.console.langChangedTemplate, {
            value: next === "en" ? dict.nav.langEn : dict.nav.langKo,
          }),
        ]);
        return;
      }

      case "goto":
      case "g":
      case "cd": {
        if (!arg) {
          pushLog(text, [dict.console.gotoNeedsTarget]);
          return;
        }
        if (arg.includes(".")) {
          const [scope, target] = arg.split(".");
          // main.<섹션>: 메인 페이지의 섹션으로, 다른 페이지에 있어도 이동한다.
          if (scope === "main" && target) {
            const id = SECTION_IDS[target] ?? target;
            if (isHome) {
              if (scrollToId(id)) {
                pushLog(text, [fillTemplate(dict.console.gotoToTemplate, { id })]);
                return;
              }
            } else {
              router.push(`/${lang}/#${id}`);
              pushLog(text, [fillTemplate(dict.console.gotoToTemplate, { id })]);
              return;
            }
          }
          // projects.<id>: 프로젝트 상세 라우트로 바로 이동한다(다른 페이지에 있어도 동작).
          if (scope === "projects" && target) {
            router.push(`/${lang}/projects/${target}/`);
            pushLog(text, [fillTemplate(dict.console.gotoToTemplate, { id: target })]);
            return;
          }
          pushLog(text, [dict.console.gotoNeedsTarget]);
          return;
        }
        if (arg === "conferences") {
          openConferences();
          pushLog(text, [dict.console.gotoConferencesLog]);
          return;
        }
        if (arg === "timeline") {
          router.push(`/${lang}/timeline/`);
          pushLog(text, [dict.console.gotoTimelineLog]);
          return;
        }
        if (arg === "main") {
          router.push(`/${lang}/`);
          pushLog(text, [dict.console.gotoMainLog]);
          return;
        }
        if (arg === "projects") {
          router.push(`/${lang}/projects/`);
          pushLog(text, [dict.console.gotoProjectsLog]);
          return;
        }
        // 메인 페이지 안의 섹션은 goto main.<섹션>으로만 간다 — 섹션 이름만 단독으로 쓰는 건 지원하지 않는다.
        pushLog(text, [dict.console.gotoNeedsTarget]);
        return;
      }

      case "conferences":
        openConferences();
        pushLog(text, [dict.console.gotoConferencesLog]);
        return;

      case "timeline":
        router.push(`/${lang}/timeline/`);
        pushLog(text, [dict.console.gotoTimelineLog]);
        return;

      case "menu": {
        const next = !navOpen;
        setNavOpen(next);
        pushLog(text, [
          fillTemplate(dict.console.menuToggledTemplate, {
            state: next ? dict.console.menuOpenState : dict.console.menuClosedState,
          }),
        ]);
        return;
      }

      case "top":
        window.scrollTo({ top: 0, behavior: "smooth" });
        pushLog(text, [dict.console.topLog]);
        return;

      case "mail":
      case "c":
        pushLog(text, dict.console.mailLog);
        try {
          window.location.href = `mailto:${SITE_EMAIL}`;
        } catch {
          // mailto 처리 불가 — 로그만 남긴다.
        }
        return;

      case "ls": {
        if (!capabilities.projects) {
          pushLog(text, [dict.console.lsEmpty]);
          return;
        }
        const ids = capabilities.projects.list().map((p) => p.id);
        pushLog(text, [ids.length ? ids.join("  ") : dict.console.lsEmpty]);
        return;
      }

      case "open": {
        if (!capabilities.projects) {
          pushLog(text, [dict.console.unavailable]);
          return;
        }
        const q = parts.slice(1).join(" ");
        if (!q) {
          pushLog(text, [dict.console.openHelp]);
          return;
        }
        const name = capabilities.projects.open(q);
        pushLog(text, [
          name
            ? fillTemplate(dict.console.openOkTemplate, { name })
            : fillTemplate(dict.console.openNotFoundTemplate, { q }),
        ]);
        return;
      }

      case "close":
        if (!capabilities.projects) {
          pushLog(text, [dict.console.unavailable]);
          return;
        }
        capabilities.projects.close();
        pushLog(text, [dict.console.closeOk]);
        return;

      case "filter": {
        if (!capabilities.filter) {
          pushLog(text, [dict.console.filterNone]);
          return;
        }
        const rest = parts.slice(1);
        if (rest.length === 0) {
          pushLog(text, [capabilities.filter.help]);
          return;
        }
        const result = capabilities.filter.apply(rest);
        pushLog(
          text,
          result
            ? [
                fillTemplate(dict.console.filterToggledTemplate, {
                  group: result.group,
                  action: result.added ? dict.console.filterAdded : dict.console.filterRemoved,
                  label: result.label,
                }),
              ]
            : [capabilities.filter.help, dict.console.filterExample],
        );
        return;
      }

      case "reset":
        if (!capabilities.reset) {
          pushLog(text, [dict.console.filterNone]);
          return;
        }
        capabilities.reset();
        pushLog(text, [dict.console.resetOk]);
        return;

      case "whoami":
        pushLog(text, [dict.console.whoami]);
        return;

      case "clear":
        setLog([]);
        setInput("");
        setCaret(0);
        return;

      case "exit":
      case "q":
      case "quit":
        closeEgg();
        return;

      default:
        pushLog(text, [fillTemplate(dict.console.notFoundTemplate, { cmd })]);
    }
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCmd(input);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeEgg();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      // 한글 조합 중의 화살표는 IME에 맡긴다.
      if (e.nativeEvent.isComposing) return;
      // 기록을 넘겼을 때만 캐럿이 줄 처음/끝으로 튀는 기본 동작을 막는다.
      if (browseHistory(e.key === "ArrowUp" ? "older" : "newer")) e.preventDefault();
    }
  };

  // 화살표/Home/End 등으로 캐럿만 움직인 경우(값 변경 없음)는 keyup
  // 시점에야 브라우저가 selectionStart를 갱신해두므로 여기서 동기화한다.
  const onInputKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    syncCaret(e.currentTarget);
  };

  const onPanelKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      closeEgg();
    }
  };

  const themeValue = theme;
  const modeValue = capabilities.mode
    ? capabilities.mode.current() === "game"
      ? dict.console.modeGameLabel
      : dict.console.modeBackendLabel
    : "—";
  const langValue = `${lang} · ${lang === "ko" ? dict.nav.langKo : dict.nav.langEn}`;

  // 실제 터미널처럼 블록 커서가 캐럿 위치의 글자 위에 얹힌다. 입력이
  // 비어 있으면 플레이스홀더의 첫 글자를 커서 밑에 두고 나머지를
  // 이어 보여준다 — 커서가 있어야 할 자리에 안내 문구도 같이 보이도록.
  const caretPos = Math.max(0, Math.min(caret, input.length));
  const before = input.slice(0, caretPos);
  const charAtCaret = input.slice(caretPos, caretPos + 1);
  let cursorNode: ReactNode;
  let tailNode: ReactNode;
  if (!input) {
    const ph = dict.console.placeholder;
    cursorNode = ph ? (
      <span className={`${styles.eggCursor} ${styles.eggCursorGhost}`}>{ph[0]}</span>
    ) : (
      <span className={`${styles.eggCursor} ${styles.eggCursorEmpty}`} />
    );
    tailNode = ph ? <span className={styles.eggPlaceholder}>{ph.slice(1)}</span> : null;
  } else if (charAtCaret) {
    cursorNode = <span className={`${styles.eggCursor} ${styles.eggCursorChar}`}>{charAtCaret}</span>;
    tailNode = input.slice(caretPos + 1);
  } else {
    cursorNode = <span className={`${styles.eggCursor} ${styles.eggCursorEmpty}`} />;
    tailNode = null;
  }

  if (status === "closed") {
    return (
      <button
        type="button"
        className={`${styles.launcher} mono`}
        onClick={openEgg}
        aria-label={dict.console.openAria}
        aria-expanded="false"
      >
        <span className={styles.lxDot} aria-hidden="true" />
        <span className={styles.lxPrompt}>&gt;_</span>
        <span className={styles.lxLabel}>{dict.console.launcherLabel}</span>
      </button>
    );
  }

  return (
    <aside
      className={`${styles.egg} ${status === "closing" ? styles.eggShrink : styles.eggGrow}`}
      role="dialog"
      aria-label={dict.console.dialogAria}
      onKeyDown={onPanelKeyDown}
    >
      <div className={styles.eggBody}>
        <div className={styles.eggHead}>
          <p className={styles.eggIntro}>
            {dict.console.intro1}
            <br />
            <span className={styles.eggIntroSub}>{dict.console.intro2}</span>
          </p>
          <button
            type="button"
            className={styles.eggOpt}
            onClick={closeEgg}
            aria-label={dict.console.closeAria}
            style={{ alignSelf: "flex-start", padding: "0 4px" }}
          >
            [x]
          </button>
        </div>

        <div aria-hidden="true" className={styles.eggDivider}>
          {"=-".repeat(38)}
        </div>

        <div className={styles.eggCommands}>
          <button
            type="button"
            className={`${styles.eggOpt} ${styles.eggRow}`}
            onClick={() => runCmd("theme")}
          >
            <span>
              <span className={styles.eggCmd}>theme</span>
              {dict.console.rowTheme}
            </span>
            <span className={styles.eggVal}>{themeValue}</span>
          </button>
          <button
            type="button"
            className={`${styles.eggOpt} ${styles.eggRow}`}
            onClick={() => runCmd("mode")}
          >
            <span>
              <span className={styles.eggCmd}>mode</span>
              {dict.console.rowMode}
            </span>
            <span className={styles.eggVal}>{modeValue}</span>
          </button>
          <button
            type="button"
            className={`${styles.eggOpt} ${styles.eggRow}`}
            onClick={() => runCmd("lang")}
          >
            <span>
              <span className={styles.eggCmd}>lang</span>
              {dict.console.rowLang}
            </span>
            <span className={styles.eggVal}>{langValue}</span>
          </button>
          <div className={`${styles.eggRow} ${styles.gotoRow}`}>
            <span>
              <span className={styles.eggCmd}>goto</span>
              {dict.console.rowGoto}
            </span>
            {(
              [
                ["main", dict.console.gotoMain],
                ["projects", dict.console.gotoProjects],
                ["timeline", dict.console.gotoTimeline],
                ["conferences", dict.console.gotoConferences],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={styles.eggOpt}
                style={{ padding: "0 4px" }}
                onClick={() => runCmd(`goto ${key}`)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`${styles.eggOpt} ${styles.eggRow}`}
            onClick={() => runCmd("mail")}
          >
            <span>
              <span className={styles.eggCmd}>mail</span>
              {dict.console.rowMail}
            </span>
            <span className={styles.eggVal}>{SITE_EMAIL}</span>
          </button>
          <button
            type="button"
            className={`${styles.eggOpt} ${styles.eggRow}`}
            onClick={closeEgg}
          >
            <span>
              <span className={styles.eggCmd}>exit</span>
              {dict.console.rowExit}
            </span>
            <span className={styles.eggVal}>esc</span>
          </button>
        </div>

        <div aria-hidden="true" className={styles.eggDivider}>
          {"=-".repeat(38)}
        </div>

        <div ref={logRef} aria-live="polite" className={styles.eggLog}>
          {log.map((line, i) => (
            <div key={i} className={styles.eggLogLine}>
              {line}
            </div>
          ))}
        </div>

        <label className={styles.eggInputRow}>
          <span>{dict.console.prompt}</span>
          <span className={styles.eggInputWrap}>
            <span ref={displayRef} aria-hidden="true" className={styles.eggInputDisplay}>
              {before}
              {cursorNode}
              {tailNode}
            </span>
            <input
              ref={inputRef}
              className={styles.eggInput}
              type="text"
              value={input}
              onChange={(e) => {
                // 직접 고치기 시작하면 기록 탐색을 끝내고 새 입력으로 본다.
                historyIndex.current = null;
                setInput(e.target.value);
                syncCaret(e.target);
              }}
              onKeyDown={onInputKeyDown}
              onKeyUp={onInputKeyUp}
              onClick={(e) => syncCaret(e.currentTarget)}
              onSelect={(e) => syncCaret(e.currentTarget)}
              aria-label={dict.console.inputAria}
              autoComplete="off"
              spellCheck={false}
            />
          </span>
        </label>
      </div>
    </aside>
  );
}
