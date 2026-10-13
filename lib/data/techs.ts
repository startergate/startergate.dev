import techsData from "@/data/techs.json";

import type { Tech } from "./types";

const techs = techsData as Tech[];

export function getAllTechs(): Tech[] {
  return techs;
}

export function getTechByName(name: string): Tech | undefined {
  return techs.find((t) => t.name === name);
}
