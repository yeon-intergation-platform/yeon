import {
  useYeonQuery as useQuery,
  type YeonUseQueryResult,
} from "@yeon/ui/native";
import {
  deriveCardDeckDetailViewState,
  type YeonCardItemRepository,
} from "@yeon/ui/runtime/ports/card-deck";
import type { CardDeckDetailResponse } from "@yeon/api-contract/card-decks";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { getCardServiceErrorMessage } from "./error-message";

type UseCardDeckDetailQueryParams = {
  deckId?: string;
  isBooting: boolean;
  isServerMode: boolean;
  itemRepository: YeonCardItemRepository;
};

export function useCardDeckDetailQuery({
  deckId,
  isBooting,
  isServerMode,
  itemRepository,
}: UseCardDeckDetailQueryParams) {
  const detailQuery = useQuery({
    enabled: !isBooting && Boolean(deckId),
    queryFn: async () => {
      const normalizedDeckId = deckId?.trim();
      if (!normalizedDeckId) {
        throw new Error(
          "카드 상세 조회를 실행할 수 없습니다. 화면 경로에 덱 ID가 없습니다."
        );
      }
      return itemRepository.getDeckDetail(normalizedDeckId);
    },
    queryKey: deckId
      ? cardServiceQueryKeys.deckDetail(isServerMode, deckId)
      : cardServiceQueryKeys.deckDetail(isServerMode, "__missing__"),
  }) as YeonUseQueryResult<CardDeckDetailResponse, Error>;

  const detail = detailQuery.data;
  const detailState = deriveCardDeckDetailViewState(
    {
      isPending: detailQuery.isPending,
      isError: detailQuery.isError,
      data: detail,
    },
    {
      errorMessage: getCardServiceErrorMessage(
        detailQuery.error,
        CARD_SERVICE_TEXT.detail.errorMessage
      ),
    }
  );
  const cardCount = detail?.items.length ?? detail?.deck.itemCount ?? 0;
  const isReady = detailState.kind === "ready" && !detailState.isEmpty;
  const listItems = isReady && detail ? detail.items : [];

  return {
    cardCount,
    detail,
    detailQuery,
    detailState,
    isReady,
    listItems,
  };
}
