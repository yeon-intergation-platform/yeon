import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { LifeOsDayDto } from "@yeon/api-contract/life-os";
import { LIFE_OS_API_PATHS } from "@yeon/api-contract/life-os";
import type { LifeOsHourEntry } from "./types";

export type LifeOsDaySaveDraft = {
  localDate: string;
  timezone: string;
  mindset: string;
  backlogText: string;
  entries: LifeOsHourEntry[];
};

export async function fetchLifeOsDay(localDate: string) {
  const response = await fetchYeon(LIFE_OS_API_PATHS.dayByDate(localDate));
  if (!response.ok) {
    throw new Error("Life OS 기록을 불러오지 못했습니다.");
  }
  const data = (await response.json()) as { day: LifeOsDayDto };
  return data.day;
}

export async function saveLifeOsDay(draft: LifeOsDaySaveDraft) {
  const response = await fetchYeon(
    LIFE_OS_API_PATHS.dayByDate(draft.localDate),
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    }
  );
  if (!response.ok) {
    throw new Error("Life OS 기록을 저장하지 못했습니다.");
  }
  const data = (await response.json()) as { day: LifeOsDayDto };
  return data.day;
}
