import timelineData from "@/data/timeline.json";

import type { TimelineItem } from "./types";

export function getTimelineItems(): TimelineItem[] {
  return timelineData as TimelineItem[];
}
