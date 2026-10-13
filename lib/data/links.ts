import linksData from "@/data/links.json";

import type { LinkItem } from "./types";

export function getLinks(): LinkItem[] {
  return linksData as LinkItem[];
}
