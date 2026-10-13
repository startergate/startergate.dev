"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronLeftIcon } from "@/components/icons";
import { useLang } from "@/lib/i18n/LangProvider";
import { useNavMenu } from "@/lib/layout/NavMenuContext";

import { LangSwitcher } from "./LangSwitcher";
import { ThemeToggleButton } from "./ThemeToggleButton";
import styles from "./NavPill.module.css";

const GITHUB_URL = "https://github.com/startergate";
const CONFERENCES_URL = "https://startergate.dev/Conferences";

export function NavPill() {
  const { lang, dict } = useLang();
  const pathname = usePathname();
  const { open: menuOpen, setOpen: setMenuOpen } = useNavMenu();

  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const cvHref = isHome ? "#resume" : `/${lang}/#resume`;

  return (
    <nav aria-label="주 메뉴" className={styles.nav}>
      <div className={styles.row}>
        <div className={styles.pill}>
          <button
            type="button"
            className={`${styles.pillBtn} ${styles.navToggle}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? dict.nav.menuClose : dict.nav.menuOpen}
            aria-expanded={menuOpen}
            aria-controls="nav-links"
          >
            <ChevronLeftIcon
              className={menuOpen ? styles.menuChevOpen : undefined}
            />
          </button>

          <div
            id="nav-links"
            className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ""}`}
          >
            <a className={styles.navlink} href={GITHUB_URL}>
              {dict.nav.github}
            </a>
            <Link className={styles.navlink} href={`/${lang}/projects/`}>
              {dict.nav.projects}
            </Link>
            <Link className={styles.navlink} href={`/${lang}/timeline/`}>
              {dict.nav.timeline}
            </Link>
            <a className={styles.navlink} href={CONFERENCES_URL}>
              {dict.nav.conferences}
            </a>
            <span
              className={`${styles.navlink} ${styles.navSoon}`}
              tabIndex={0}
              aria-label={`${dict.nav.blog}, ${dict.nav.blogSoon}`}
            >
              {dict.nav.blog}
              <span className={styles.navSoonBubble} aria-hidden="true">
                {dict.nav.blogSoon}
              </span>
            </span>
            <a className={styles.navlink} href={cvHref}>
              {dict.nav.cv}
            </a>
          </div>

          <Suspense fallback={<div className={styles.langWrapFallback} />}>
            <LangSwitcher />
          </Suspense>

          <ThemeToggleButton />
        </div>

        <Link
          className={styles.logoTrigger}
          href={`/${lang}/`}
          aria-label={dict.nav.homeLink}
        >
          <span className={styles.logoBtn}>
            <Image
              src="/images/startergate.png"
              alt=""
              width={64}
              height={64}
              className={styles.logoImg}
            />
          </span>
        </Link>
      </div>
    </nav>
  );
}
