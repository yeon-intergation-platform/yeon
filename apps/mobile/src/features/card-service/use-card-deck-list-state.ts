import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import {
  showYeonAlert,
  type YeonHref as Href,
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import {
  deriveCardDeckListViewState,
  formatCardDeckMeta,
} from "@yeon/ui/runtime/ports/card-deck";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";
import { useMemo, useState } from "react";

import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { useCardSession } from "./card-session-context";
import { getCardServiceErrorMessage } from "./error-message";
import { createMobileCardDeckRepository } from "./runtime-adapters/card-deck-repository";

function getCardServiceDeckDetailHref(deckId: string): Href {
  return {
    pathname: YEON_ROUTE_TEMPLATES.cardDeckDetail,
    params: { deckId },
  } as Href;
}

function getCardServiceDeckPlayHref(deckId: string): Href {
  return {
    pathname: YEON_ROUTE_TEMPLATES.cardDeckPlay,
    params: { deckId },
  } as Href;
}

export function useCardDeckListState() {
  const queryClient = useQueryClient();
  const router = useRouter();
  // 부트/인증/게이트는 CardSessionProvider가 소유. 홈은 상태만 소비한다.
  const { isSignedIn, sessionToken, openGate } = useCardSession();
  const [title, setTitle] = useState("");
  const [isCreateSheetOpen, setCreateSheetOpen] = useState(false);

  // 게스트/서버 분기는 repository 어댑터가 흡수한다(웹과 동일 포트 인터페이스).
  const repository = useMemo(
    () => createMobileCardDeckRepository({ isSignedIn, sessionToken }),
    [isSignedIn, sessionToken]
  );

  const decksQuery = useQuery({
    queryFn: () => repository.listDecks(),
    queryKey: cardServiceQueryKeys.decks(isSignedIn),
  });

  const createDeckMutation = useMutation({
    mutationFn: (nextTitle: string) =>
      repository.createDeck({ title: nextTitle }),
    onSuccess: async (deck) => {
      setTitle("");
      await queryClient.invalidateQueries({
        queryKey: cardServiceQueryKeys.decks(isSignedIn),
      });
      router.push(getCardServiceDeckDetailHref(deck.id));
    },
  });

  async function handleCreateDeck() {
    try {
      setCreateSheetOpen(false);
      await createDeckMutation.mutateAsync(title.trim());
    } catch (error) {
      showYeonAlert(
        CARD_SERVICE_TEXT.state.errorTitle,
        getCardServiceErrorMessage(
          error,
          CARD_SERVICE_TEXT.list.createDeckErrorMessage
        )
      );
    }
  }

  // 목록 상태 분기는 web/mobile 공용 SSOT에서 파생한다(복제 금지).
  const listState = deriveCardDeckListViewState(
    {
      isPending: decksQuery.isPending,
      isError: decksQuery.isError,
      data: decksQuery.data,
    },
    {
      errorMessage: getCardServiceErrorMessage(
        decksQuery.error,
        CARD_SERVICE_TEXT.list.errorMessage
      ),
    }
  );

  const decks = listState.kind === "ready" ? listState.decks : [];
  const resumeDeck = decks[0];

  function formatDeckMeta(deck: CardDeckDto): string {
    return formatCardDeckMeta(deck);
  }

  return {
    canCreateDeck: !createDeckMutation.isPending && title.trim().length > 0,
    createDeckButtonLabel: createDeckMutation.isPending
      ? CARD_SERVICE_TEXT.list.creatingDeckLabel
      : CARD_SERVICE_TEXT.list.createDeckButtonLabel,
    decks,
    formatDeckMeta,
    handleCreateDeck,
    isCreateSheetOpen,
    isGuestMode: !isSignedIn,
    listState,
    onCloseCreateSheet: () => setCreateSheetOpen(false),
    onOpenCreateSheet: () => setCreateSheetOpen(true),
    onOpenDeck: (deckId: string) =>
      router.push(getCardServiceDeckDetailHref(deckId)),
    onPlayDeck: (deckId: string) =>
      router.push(getCardServiceDeckPlayHref(deckId)),
    openGate,
    resumeDeck,
    setTitle,
    title,
  };
}

export type CardDeckListState = ReturnType<typeof useCardDeckListState>;
