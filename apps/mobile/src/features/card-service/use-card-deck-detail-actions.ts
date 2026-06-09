import type { YeonCardItemRepository } from "@yeon/ui/runtime/ports/card-deck";
import {
  showYeonAlert,
  useYeonMutation as useMutation,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import { useCallback } from "react";

import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import { parseAiCardInput } from "./card-input-parser";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import {
  CARD_SERVICE_MODE,
  type CardServiceMode,
} from "./card-service-session";
import { getCardServiceErrorMessage } from "./error-message";
import type { SheetState } from "./use-card-deck-detail-sheet-state";

const CARD_DECK_DETAIL_OPERATION = {
  bulkCreate: "카드 일괄 추가",
  bulkReplace: "카드 일괄 덮어쓰기",
  create: "카드 추가",
  delete: "카드 삭제",
  update: "카드 수정",
} as const;

type CardDeckDetailOperation =
  (typeof CARD_DECK_DETAIL_OPERATION)[keyof typeof CARD_DECK_DETAIL_OPERATION];

interface ParsedCardInput {
  backText: string;
  frontText: string;
}

class CardDeckDetailInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CardDeckDetailInputError";
  }
}

function requireDeckId(
  deckId: string | undefined,
  operation: CardDeckDetailOperation
): string {
  const normalizedDeckId = deckId?.trim();
  if (!normalizedDeckId) {
    throw new CardDeckDetailInputError(
      `${operation}을 실행할 수 없습니다. 화면 경로에 덱 ID가 없습니다.`
    );
  }
  return normalizedDeckId;
}

function parseBulkCardsOrThrow(
  rawText: string,
  operation: CardDeckDetailOperation
): ParsedCardInput[] {
  const cards = parseAiCardInput(rawText);
  if (cards.length === 0) {
    throw new CardDeckDetailInputError(
      `${operation}을 실행할 수 없습니다. 인식된 카드가 0장입니다. [[Q]], [[A]], [[CARD]] 마커를 확인해 주세요.`
    );
  }
  return cards;
}

interface UseCardDeckDetailActionsParams {
  backText: string;
  bulkText: string;
  closeSheet: () => void;
  deckId?: string;
  frontText: string;
  itemRepository: YeonCardItemRepository;
  mode: CardServiceMode;
  setActiveMenuItemId: (itemId: string | null) => void;
  setBulkText: (value: string) => void;
  sheetState: SheetState;
}

export function useCardDeckDetailActions({
  backText,
  bulkText,
  closeSheet,
  deckId,
  frontText,
  itemRepository,
  mode,
  setActiveMenuItemId,
  setBulkText,
  sheetState,
}: UseCardDeckDetailActionsParams) {
  const queryClient = useQueryClient();

  async function invalidateDeck() {
    if (!deckId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: cardServiceQueryKeys.deckDetail(
        mode === CARD_SERVICE_MODE.server,
        deckId
      ),
    });
    await queryClient.invalidateQueries({
      queryKey: cardServiceQueryKeys.decks(mode === CARD_SERVICE_MODE.server),
    });
  }

  const createMutation = useMutation({
    mutationFn: async (params: ParsedCardInput) => {
      return itemRepository.addCard(
        requireDeckId(deckId, CARD_DECK_DETAIL_OPERATION.create),
        params
      );
    },
    onSuccess: async () => {
      await invalidateDeck();
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async () => {
      const targetDeckId = requireDeckId(
        deckId,
        CARD_DECK_DETAIL_OPERATION.bulkCreate
      );
      const cards = parseBulkCardsOrThrow(
        bulkText,
        CARD_DECK_DETAIL_OPERATION.bulkCreate
      );
      await itemRepository.addCards(targetDeckId, { items: cards });
      return cards.length;
    },
    onSuccess: async (createdCount) => {
      setBulkText("");
      closeSheet();
      await invalidateDeck();
      showYeonAlert(
        CARD_SERVICE_TEXT.detail.addCompleteTitle,
        `${createdCount}${CARD_SERVICE_TEXT.detail.addCompleteMessageSuffix}`
      );
    },
  });

  const bulkReplaceMutation = useMutation({
    mutationFn: async () => {
      const targetDeckId = requireDeckId(
        deckId,
        CARD_DECK_DETAIL_OPERATION.bulkReplace
      );
      const cards = parseBulkCardsOrThrow(
        bulkText,
        CARD_DECK_DETAIL_OPERATION.bulkReplace
      );
      await itemRepository.replaceCards(targetDeckId, { items: cards });
      return cards.length;
    },
    onSuccess: async (createdCount) => {
      setBulkText("");
      closeSheet();
      await invalidateDeck();
      showYeonAlert(
        CARD_SERVICE_TEXT.detail.addCompleteTitle,
        `${createdCount}${CARD_SERVICE_TEXT.detail.bulkOverwriteCompleteMessageSuffix}`
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: ParsedCardInput & { itemId: string }) => {
      return itemRepository.updateCard(
        requireDeckId(deckId, CARD_DECK_DETAIL_OPERATION.update),
        params.itemId,
        {
          backText: params.backText,
          frontText: params.frontText,
        }
      );
    },
    onSuccess: async () => {
      closeSheet();
      await invalidateDeck();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await itemRepository.deleteCard(
        requireDeckId(deckId, CARD_DECK_DETAIL_OPERATION.delete),
        itemId
      );
    },
    onSuccess: async () => {
      setActiveMenuItemId(null);
      await invalidateDeck();
    },
  });

  async function handleCreateCard() {
    if (!frontText.trim() || !backText.trim()) {
      showYeonAlert(
        CARD_SERVICE_TEXT.shared.inputRequiredTitle,
        CARD_SERVICE_TEXT.detail.updateRequiredHint
      );
      return;
    }
    try {
      await createMutation.mutateAsync({
        backText: backText.trim(),
        frontText: frontText.trim(),
      });
      closeSheet();
    } catch (error) {
      showYeonAlert(
        CARD_SERVICE_TEXT.state.errorTitle,
        getCardServiceErrorMessage(
          error,
          CARD_SERVICE_TEXT.detail.createErrorMessage
        )
      );
    }
  }

  async function handleBulkCreateCards() {
    try {
      await bulkCreateMutation.mutateAsync();
    } catch (error) {
      showYeonAlert(
        CARD_SERVICE_TEXT.state.errorTitle,
        getCardServiceErrorMessage(
          error,
          CARD_SERVICE_TEXT.detail.createErrorMessage
        )
      );
    }
  }

  async function handleBulkReplaceCards() {
    const cards = parseAiCardInput(bulkText);
    if (cards.length === 0) {
      showYeonAlert(
        CARD_SERVICE_TEXT.state.errorTitle,
        CARD_SERVICE_TEXT.detail.noParseResultMessage
      );
      return;
    }

    showYeonAlert(
      CARD_SERVICE_TEXT.detail.bulkOverwriteConfirmTitle,
      CARD_SERVICE_TEXT.detail.bulkOverwriteConfirmMessage(cards.length),
      [
        { text: "취소", style: "cancel" },
        {
          text: CARD_SERVICE_TEXT.detail.bulkOverwriteLabel,
          style: "destructive",
          onPress: async () => {
            try {
              await bulkReplaceMutation.mutateAsync();
            } catch (error) {
              showYeonAlert(
                CARD_SERVICE_TEXT.state.errorTitle,
                getCardServiceErrorMessage(
                  error,
                  CARD_SERVICE_TEXT.detail.createErrorMessage
                )
              );
            }
          },
        },
      ]
    );
  }

  async function handleUpdateCard() {
    if (sheetState.kind !== "edit") {
      return;
    }
    if (!frontText.trim() || !backText.trim()) {
      showYeonAlert(
        CARD_SERVICE_TEXT.shared.inputRequiredTitle,
        CARD_SERVICE_TEXT.detail.updateRequiredHint
      );
      return;
    }
    try {
      await updateMutation.mutateAsync({
        backText: backText.trim(),
        frontText: frontText.trim(),
        itemId: sheetState.item.id,
      });
    } catch (error) {
      showYeonAlert(
        CARD_SERVICE_TEXT.state.errorTitle,
        getCardServiceErrorMessage(
          error,
          CARD_SERVICE_TEXT.detail.updateErrorMessage
        )
      );
    }
  }

  const handleDeleteCard = useCallback(
    (itemId: string) => {
      showYeonAlert(
        CARD_SERVICE_TEXT.detail.deleteConfirmTitle,
        CARD_SERVICE_TEXT.detail.deleteConfirmMessage,
        [
          { style: "cancel", text: CARD_SERVICE_TEXT.shared.closeLabel },
          {
            onPress: async () => {
              try {
                await deleteMutation.mutateAsync(itemId);
              } catch (error) {
                showYeonAlert(
                  CARD_SERVICE_TEXT.state.errorTitle,
                  getCardServiceErrorMessage(
                    error,
                    CARD_SERVICE_TEXT.detail.deleteErrorMessage
                  )
                );
              }
            },
            style: "destructive",
            text: CARD_SERVICE_TEXT.shared.deleteLabel,
          },
        ]
      );
    },
    [deleteMutation]
  );

  const canSubmitManual =
    frontText.trim().length > 0 &&
    backText.trim().length > 0 &&
    !createMutation.isPending &&
    !updateMutation.isPending;
  const canSubmitBulk =
    bulkText.trim().length > 0 &&
    !bulkCreateMutation.isPending &&
    !bulkReplaceMutation.isPending;

  return {
    bulkCreateButtonLabel: bulkCreateMutation.isPending
      ? CARD_SERVICE_TEXT.detail.submitBusyLabel
      : CARD_SERVICE_TEXT.detail.bulkSaveLabel,
    bulkReplaceButtonLabel: bulkReplaceMutation.isPending
      ? CARD_SERVICE_TEXT.detail.bulkOverwriteBusyLabel
      : CARD_SERVICE_TEXT.detail.bulkOverwriteLabel,
    canSubmitBulk,
    canSubmitManual,
    handleBulkCreateCards,
    handleBulkReplaceCards,
    handleCreateCard,
    handleDeleteCard,
    handleUpdateCard,
    manualSubmitButtonLabel:
      sheetState.kind === "edit"
        ? updateMutation.isPending
          ? CARD_SERVICE_TEXT.detail.submitEditBusyLabel
          : CARD_SERVICE_TEXT.detail.submitEditLabel
        : createMutation.isPending
          ? CARD_SERVICE_TEXT.detail.submitBusyLabel
          : CARD_SERVICE_TEXT.detail.submitCreateLabel,
    rowBusy: updateMutation.isPending || deleteMutation.isPending,
  };
}
