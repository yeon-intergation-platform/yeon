"use client";

import { useQuery } from "@tanstack/react-query";
import { loadTypingCharacterFrameOverrides } from "./typing-service-fetch";
import { typingServiceQueryKeys } from "./typing-service-query-keys";

async function fetchActiveFrames(): Promise<Record<string, number[]>> {
  const overrides = await loadTypingCharacterFrameOverrides();
  const map: Record<string, number[]> = {};
  for (const { characterId, frameSlots } of overrides) {
    const active = frameSlots.filter((s) => s.enabled).map((s) => s.frameIdx);
    if (active.length > 0) map[characterId] = active;
  }
  return map;
}

// 전체 유저 대상: 활성 프레임만 추려서 characterId → number[] 맵으로 반환
export function useCharacterFrameOverrides(): Record<string, number[]> {
  const { data = {} } = useQuery({
    queryKey: typingServiceQueryKeys.activeCharacterFrameOverrides(),
    queryFn: fetchActiveFrames,
  });
  return data;
}
