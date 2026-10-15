import timelineData from "@/data/timeline.json";

import { getExperiences } from "./experiences";
import type { Experience, TimelineItem } from "./types";

function experienceToTimelineItem(exp: Experience): TimelineItem {
  return {
    type: "career",
    startedAt: exp.startedAt,
    finishedAt: exp.finishedAt,
    title: exp.title,
    org: exp.company,
    description: exp.summary,
    link: exp.link,
  };
}

/**
 * career 항목은 더 이상 data/timeline.json에 따로 두지 않는다 —
 * data/experiences.json과 제목·소속·설명·링크가 그대로 겹쳤다(피드백).
 * 대신 getExperiences()에서 그때그때 만들어 나머지 항목(수상·자격증·
 * 동아리·학력)과 합친다. 최신순으로 정렬한다.
 */
export function getTimelineItems(): TimelineItem[] {
  const stored = timelineData as TimelineItem[];
  const fromExperiences = getExperiences().map(experienceToTimelineItem);
  return [...fromExperiences, ...stored].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );
}
