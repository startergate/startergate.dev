"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useConsoleCapabilities } from "@/lib/console/ConsoleCapabilities";
import { useLang } from "@/lib/i18n/LangProvider";
import { fillTemplate } from "@/lib/i18n/template";
import { useNavMenu } from "@/lib/layout/NavMenuContext";
import { SITE_EMAIL } from "@/lib/site-meta";
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
  const [log, setLog] = useState<string[]>([dict.console.intro1, dict.console.intro2]);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setStatus("closed"), 240);
  };

  const pushLog = (cmd: string, out: string[]) => {
    setLog((prev) => [...prev, `${dict.console.prompt} ${cmd}`, ...out].slice(-10));
    setInput("");
  };

  const scrollToId = (id: string): boolean => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  };

  const runCmd = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
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
        if (arg === "conferences") {
          pushLog(text, [dict.console.gotoConferencesLog]);
          return;
        }
        if (arg === "timeline") {
          router.push(`/${lang}/timeline/`);
          pushLog(text, [dict.console.gotoTimelineLog]);
          return;
        }
        const id = SECTION_IDS[arg];
        if (!id) {
          pushLog(text, [dict.console.gotoNeedsTarget]);
          return;
        }
        if (isHome && scrollToId(id)) {
          pushLog(text, [fillTemplate(dict.console.gotoToTemplate, { id })]);
        } else {
          pushLog(text, [dict.console.unavailable]);
        }
        return;
      }

      case "conferences":
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
    }
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
                ["about", dict.console.gotoAbout],
                ["projects", dict.console.gotoProjects],
                ["tech", dict.console.gotoTech],
                ["cv", dict.console.gotoCv],
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

        <div aria-live="polite" className={styles.eggLog}>
          {log.map((line, i) => (
            <div key={i} className={styles.eggLogLine}>
              {line}
            </div>
          ))}
        </div>

        <label className={styles.eggInputRow}>
          <span>{dict.console.prompt}</span>
          <input
            ref={inputRef}
            className={styles.eggInput}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onInputKeyDown}
            aria-label={dict.console.inputAria}
            autoComplete="off"
            spellCheck={false}
            placeholder={dict.console.placeholder}
          />
        </label>
      </div>
    </aside>
  );
}
