import peopleData from "@/data/people.json";
import organizationsData from "@/data/organizations.json";

import type { Person } from "./types";

const people = peopleData as Record<string, Person>;
const organizations = organizationsData as Record<string, Person>;

/** 사람 또는 단체(organizations.json) 이름으로 GitHub 링크·아바타를 찾는다. */
export function getPerson(name: string): Person | undefined {
  return people[name] ?? organizations[name];
}
