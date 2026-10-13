import type { ProjectStatus } from "./types";

export const STATUS_COLOR_VAR: Record<ProjectStatus, string> = {
  planning: "var(--st-plan)",
  active: "var(--st-act)",
  canceled: "var(--st-cancel)",
  done: "var(--st-done)",
};
