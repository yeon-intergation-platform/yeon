"use client";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/runtime/YeonQuery";
import type { FrameSlot } from "./frame-slot";
import {
  loadTypingCharacterFrameOverrides,
  saveTypingCharacterFrameOverride,
} from "./typing-service-fetch";
import { typingServiceQueryKeys } from "./typing-service-query-keys";

export type { FrameSlot } from "./frame-slot";

type SequenceStore = Record<string, FrameSlot[]>;

async function fetchOverrides(): Promise<SequenceStore> {
  const overrides = await loadTypingCharacterFrameOverrides();
  return Object.fromEntries(
    overrides.map((override) => [override.characterId, override.frameSlots])
  );
}

export function useFrameSequenceStore() {
  const queryClient = useQueryClient();

  const { data: store = {}, isLoading } = useQuery({
    queryKey: typingServiceQueryKeys.characterFrames(),
    queryFn: fetchOverrides,
  });

  const saveMutation = useMutation({
    mutationFn: ({
      characterId,
      seq,
    }: {
      characterId: string;
      seq: FrameSlot[] | null;
    }) => saveTypingCharacterFrameOverride(characterId, seq),
    onMutate: async ({ characterId, seq }) => {
      await queryClient.cancelQueries({
        queryKey: typingServiceQueryKeys.characterFrames(),
      });
      const prev = queryClient.getQueryData<SequenceStore>(
        typingServiceQueryKeys.characterFrames()
      );
      queryClient.setQueryData<SequenceStore>(
        typingServiceQueryKeys.characterFrames(),
        (old = {}) => {
          const next = { ...old };
          if (!seq || seq.length === 0) {
            delete next[characterId];
          } else {
            next[characterId] = seq;
          }
          return next;
        }
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(
          typingServiceQueryKeys.characterFrames(),
          ctx.prev
        );
      }
    },
  });

  const setSequence = (characterId: string, seq: FrameSlot[] | null) => {
    saveMutation.mutate({ characterId, seq });
  };

  const resetAll = () => {
    const ids = Object.keys(store);
    queryClient.setQueryData<SequenceStore>(
      typingServiceQueryKeys.characterFrames(),
      {}
    );
    Promise.all(
      ids.map((id) => saveTypingCharacterFrameOverride(id, null))
    ).catch((err) => console.error("전체 초기화 실패:", err));
  };

  return { store, setSequence, resetAll, isLoading };
}
