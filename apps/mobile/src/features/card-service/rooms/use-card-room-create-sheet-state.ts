import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import type {
  CardRoomProfile,
  CardRoomVisibility,
  CreateCardRoomBody,
} from "@yeon/api-contract/card-rooms";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  showYeonAlert,
} from "@yeon/ui/native";
import type { YeonCardItemRepository } from "@yeon/ui/runtime/ports/card-deck";
import { useMemo, useState } from "react";

import { cardServiceQueryKeys } from "../../../services/card-service/query-keys";
import { cardRoomApi } from "../../../services/card-rooms/client";
import {
  writeCardRoomParticipantId,
  writeCardRoomParticipantToken,
} from "../../../services/card-rooms/profile-storage";
import { CARD_SERVICE_TEXT } from "../card-service-copy";
import { useCardSession } from "../card-session-context";
import { getCardServiceErrorMessage } from "../error-message";
import { createMobileCardDeckRepository } from "../runtime-adapters/card-deck-repository";
import { createMobileCardItemRepository } from "../runtime-adapters/card-item-repository";
import { useCardRoomIdentity } from "./use-card-room-identity";

class CardRoomCreateInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CardRoomCreateInputError";
  }
}

type UseCardRoomCreateSheetStateParams = {
  onCreated: (roomId: string) => void;
  visible: boolean;
};

function requireParticipantContext(
  profile: CardRoomProfile | null,
  guestId: string | null
): { profile: CardRoomProfile; guestId: string } {
  if (!profile || !guestId) {
    throw new CardRoomCreateInputError(
      "카드방 생성에 필요한 참가자 프로필 또는 게스트 식별자를 아직 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
    );
  }
  return { profile, guestId };
}

function findSelectedDeckOrThrow(
  decks: CardDeckDto[],
  selectedDeckId: string | null
) {
  const deck = decks.find((entry) => entry.id === selectedDeckId);
  if (!deck) {
    throw new CardRoomCreateInputError(
      "카드방을 만들 덱을 선택하지 않았습니다. 카드가 1장 이상 있는 덱을 선택해 주세요."
    );
  }
  return deck;
}

async function buildGuestRoomBody({
  deck,
  itemRepository,
  profile,
  roomTitle,
  visibility,
}: {
  deck: CardDeckDto;
  itemRepository: YeonCardItemRepository;
  profile: CardRoomProfile;
  roomTitle: string;
  visibility: CardRoomVisibility;
}): Promise<CreateCardRoomBody> {
  // 게스트는 덱 스냅샷을 그대로 올린다(서버에 게스트 덱 식별자가 없음).
  const detail = await itemRepository.getDeckDetail(deck.id);
  return {
    title: roomTitle,
    visibility,
    guestDeck: {
      title: deck.title,
      items: detail.items.map((item) => ({
        frontText: item.frontText,
        backText: item.backText,
      })),
    },
    profile,
  };
}

async function persistRoomParticipant(
  response: Awaited<ReturnType<typeof cardRoomApi.createRoom>>
) {
  // participant.id가 있을 때만 저장(빈 문자열 영구 저장 방지).
  if (!response.participant?.id) return;

  await writeCardRoomParticipantId(response.room.id, response.participant.id);
  // 방장도 생성 응답의 토큰을 저장해 방 화면이 재입장 없이 실시간에 연결하게 한다.
  if (response.participantToken) {
    await writeCardRoomParticipantToken(
      response.room.id,
      response.participantToken
    );
  }
}

export function useCardRoomCreateSheetState({
  onCreated,
  visible,
}: UseCardRoomCreateSheetStateParams) {
  const { isSignedIn, sessionToken } = useCardSession();
  const { profile, guestId } = useCardRoomIdentity();
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<CardRoomVisibility>("public");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const deckRepository = useMemo(
    () => createMobileCardDeckRepository({ isSignedIn, sessionToken }),
    [isSignedIn, sessionToken]
  );
  const itemRepository = useMemo(
    () =>
      createMobileCardItemRepository({
        mode: isSignedIn ? "server" : "guest",
        sessionToken,
      }),
    [isSignedIn, sessionToken]
  );

  const decksQuery = useQuery({
    enabled: visible,
    queryFn: () => deckRepository.listDecks(),
    queryKey: cardServiceQueryKeys.decks(isSignedIn),
  });
  const decks = decksQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const participant = requireParticipantContext(profile, guestId);
      const deck = findSelectedDeckOrThrow(decks, selectedDeckId);
      const roomTitle = title.trim() || deck.title;
      const body: CreateCardRoomBody = isSignedIn
        ? {
            title: roomTitle,
            visibility,
            deckId: deck.id,
            profile: participant.profile,
          }
        : await buildGuestRoomBody({
            deck,
            itemRepository,
            profile: participant.profile,
            roomTitle,
            visibility,
          });

      const response = await cardRoomApi.createRoom(body, participant.guestId);
      await persistRoomParticipant(response);
      return response.room.id;
    },
    onSuccess: (roomId) => {
      setTitle("");
      setSelectedDeckId(null);
      onCreated(roomId);
    },
  });

  async function handleCreate() {
    try {
      await createMutation.mutateAsync();
    } catch (error) {
      showYeonAlert(
        CARD_SERVICE_TEXT.rooms.createErrorTitle,
        getCardServiceErrorMessage(
          error,
          CARD_SERVICE_TEXT.rooms.createErrorTitle
        )
      );
    }
  }

  return {
    canSubmit:
      selectedDeckId !== null && !createMutation.isPending && guestId !== null,
    decks,
    handleCreate,
    isPending: createMutation.isPending,
    selectedDeckId,
    setSelectedDeckId,
    setTitle,
    setVisibility,
    title,
    visibility,
  };
}
