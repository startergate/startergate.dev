import type { L10n } from "@/lib/i18n/l10n";

export type ProjectCategory = "work" | "team" | "personal";
export type ProjectStatus = "planning" | "active" | "canceled" | "done";
export type ProfileMode = "backend" | "game";

export type Person = { link: string; avatar?: string };

export type Tech = {
  name: string;
  mode: ProfileMode | "all";
  level: "using" | "learned" | "learning";
  logo?: { src: string; background?: string; cover?: boolean };
  abbr?: string;
};

export type Experience = {
  company: L10n;
  companyLogo?: { src: string; srcOnLight?: string };
  title: L10n;
  period: L10n;
  location?: L10n;
  link?: string;
  summary: L10n;
  detail?: L10n;
  techs: string[];
};

export type LinkItem = { type: string; link: string; external_id: string };

export type Project = {
  id: string;
  name: string;
  description: L10n;
  category: ProjectCategory;
  team?: { name: string; link?: string };
  status: ProjectStatus;
  startedAt: string;
  finishedAt?: string;
  types: string[];
  techs: string[];
  part?: string;
  collaborators: { name: string; roles: L10n[] | string[] }[];
  logo?: { src: string; srcOnLight?: string; isTitle?: boolean };
  images?: { src: string; description?: L10n }[];
  links?: { type: string; link: string; label: string }[];
  contents?: { title: L10n; text?: L10n; ref?: string; image?: string }[];
  highlight?: { backend?: number; game?: number };
};
