"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FrameSlot } from "./frame-slot";

export type { FrameSlot } from "./frame-slot";

type OverrideItem = { characterId: string; frameSlots: FrameSlot[] };
type SequenceStore = Record<string, FrameSlot[]>;

const QUERY_KEY = ["typing-character-frames"] as const;

async function fetchOverrides(): Promise<SequenceStore> {
  const res = await fetch("/api/v1/typing-character-frames");
  if (!res.ok) return {};
  const data = (await res.json()) as { overrides: OverrideItem[] };
  return Object.fromEntries(
    data.overrides.map((o) => [o.characterId, o.frameSlots])
  );
}

async function saveOverride(
  characterId: string,
  frameSlots: FrameSlot[] | null
): Promise<void> {
  await fetch(`/api/v1/typing-character-frames/${characterId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frameSlots }),
  });
}

export function useFrameSequenceStore() {
  const queryClient = useQueryClient();

  const { data: store = {}, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchOverrides,
  });

  const saveMutation = useMutation({
    mutationFn: ({
      characterId,
      seq,
    }: {
      characterId: string;
      seq: FrameSlot[] | null;
    }) => saveOverride(characterId, seq),
    onMutate: async ({ characterId, seq }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const prev = queryClient.getQueryData<SequenceStore>(QUERY_KEY);
      queryClient.setQueryData<SequenceStore>(QUERY_KEY, (old = {}) => {
        const next = { ...old };
        if (!seq || seq.length === 0) {
          delete next[characterId];
        } else {
          next[characterId] = seq;
        }
        return next;
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(QUERY_KEY, ctx.prev);
      }
    },
  });

  const setSequence = (characterId: string, seq: FrameSlot[] | null) => {
    saveMutation.mutate({ characterId, seq });
  };

  const resetAll = () => {
    const ids = Object.keys(store);
    queryClient.setQueryData<SequenceStore>(QUERY_KEY, {});
    Promise.all(ids.map((id) => saveOverride(id, null))).catch((err) =>
      console.error("전체 초기화 실패:", err)
    );
  };

  return { store, setSequence, resetAll, isLoading };
}
