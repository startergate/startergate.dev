import experiencesData from "@/data/experiences.json";

import type { Experience } from "./types";

export function getExperiences(): Experience[] {
  return experiencesData as Experience[];
}
