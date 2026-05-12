"use client";

import { useQuery } from "@tanstack/react-query";
import type { FrameSlot } from "./frame-slot";

type OverrideItem = { characterId: string; frameSlots: FrameSlot[] };

const typingCharacterFrameQueryKeys = {
  activeOverrides: () =>
    ["typing-service", "character-frames", "active-overrides"] as const,
};

async function fetchActiveFrames(): Promise<Record<string, number[]>> {
  const res = await fetch("/api/v1/typing-character-frames");
  if (!res.ok) return {};
  const data = (await res.json()) as { overrides: OverrideItem[] };
  const map: Record<string, number[]> = {};
  for (const { characterId, frameSlots } of data.overrides) {
    const active = frameSlots.filter((s) => s.enabled).map((s) => s.frameIdx);
    if (active.length > 0) map[characterId] = active;
  }
  return map;
}

// 전체 유저 대상: 활성 프레임만 추려서 characterId → number[] 맵으로 반환
export function useCharacterFrameOverrides(): Record<string, number[]> {
  const { data = {} } = useQuery({
    queryKey: typingCharacterFrameQueryKeys.activeOverrides(),
    queryFn: fetchActiveFrames,
  });
  return data;
}
