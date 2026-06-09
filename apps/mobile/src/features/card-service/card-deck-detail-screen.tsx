import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import {
  useYeonMutation as useMutation,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import {
  type YeonHref as Href,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";
import { useCallback, useEffect, useMemo, useState } from "react";
import { showYeonAlert } from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonBottomSheetForm as BottomSheetForm,
  YeonBottomSheetModal as BottomSheetModal,
  YeonFlatList as FlatList,
  YeonFloatingActionButton as FloatingActionButton,
  YeonFormIntro as FormIntro,
  YeonFormStack as FormStack,
  YeonMobileHeaderBar as MobileHeaderBar,
  YeonMobileScreen as MobileScreen,
  YeonSegmentedControl as SegmentedControl,
  YeonSectionSummaryHeader as SectionSummaryHeader,
  YeonStateBlock as StateBlock,
  YeonTextField as TextField,
} from "@yeon/ui/native";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import { parseAiCardInput } from "./card-input-parser";
import { createMobileCardItemRepository } from "./runtime-adapters/card-item-repository";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { getCardServiceErrorMessage } from "./error-message";
import { DeckCardRow } from "./card-deck-detail-card-row";
import { useCardDeckDetailQuery } from "./use-card-deck-detail-query";
import {
  SHEET_MODES,
  useCardDeckDetailSheetState,
} from "./use-card-deck-detail-sheet-state";
import { MarkdownTextField } from "./markdown-text-field";
import {
  CARD_SERVICE_MODE,
  type CardServiceMode,
  resolveCardServiceSession,
} from "./card-service-session";

const CARD_SERVICE_DECK_PLAY_ROUTE = YEON_ROUTE_TEMPLATES.cardDeckPlay as Href;

const CARD_DECK_DETAIL_OPERATION = {
  bulkCreate: "카드 일괄 추가",
  bulkReplace: "카드 일괄 덮어쓰기",
  create: "카드 추가",
  delete: "카드 삭제",
  detail: "카드 상세 조회",
  update: "카드 수정",
} as const;

type CardDeckDetailOperation =
  (typeof CARD_DECK_DETAIL_OPERATION)[keyof typeof CARD_DECK_DETAIL_OPERATION];

interface ParsedCardInput {
  backText: string;
  frontText: string;
}

interface CardDeckDetailScreenProps {
  deckId?: string;
}

class CardDeckDetailInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CardDeckDetailInputError";
  }
}

function getCardServiceDeckPlayHref(deckId: string): Href {
  return {
    pathname: CARD_SERVICE_DECK_PLAY_ROUTE,
    params: { deckId },
  } as Href;
}

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replace(/\. /g, ". ")
    .replace(/\.$/, ".");
}

function getModeBadge(mode: CardServiceMode): string {
  return mode === CARD_SERVICE_MODE.server
    ? CARD_SERVICE_TEXT.detail.modeAuthenticatedLabel
    : CARD_SERVICE_TEXT.detail.modeGuestLabel;
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

export function CardDeckDetailScreen({ deckId }: CardDeckDetailScreenProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mode, setMode] = useState<CardServiceMode>(CARD_SERVICE_MODE.guest);
  const [isBooting, setBooting] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const {
    activeMenuItemId,
    backText,
    bulkText,
    closeSheet,
    frontText,
    openCreateSheet,
    openEditSheet,
    setActiveMenuItemId,
    setBackText,
    setBulkText,
    setFrontText,
    setSheetMode,
    sheetMode,
    sheetState,
    toggleMenu,
  } = useCardDeckDetailSheetState();

  // 게스트/서버 분기는 repository 어댑터가 흡수한다(웹과 동일 포트 인터페이스).
  const itemRepository = useMemo(
    () =>
      createMobileCardItemRepository({
        isSignedIn: mode === CARD_SERVICE_MODE.server,
        sessionToken,
      }),
    [mode, sessionToken]
  );

  // useCardDeckDetailQuery 내부에서 deriveCardDeckDetailViewState로 web/mobile 공용 상태를 파생한다.
  const { cardCount, detail, detailState, isReady, listItems } =
    useCardDeckDetailQuery({
      deckId,
      isBooting,
      isServerMode: mode === CARD_SERVICE_MODE.server,
      itemRepository,
    });

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

  useEffect(() => {
    void bootstrapSession();
  }, []);

  async function bootstrapSession() {
    setBooting(true);
    const resolved = await resolveCardServiceSession();
    setMode(resolved.mode);
    setSessionToken(resolved.sessionToken);
    setBooting(false);
  }

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

  if (isBooting) {
    return (
      <MobileScreen contentVariant="centered" scroll={false}>
        <StateBlock
          loading
          message={CARD_SERVICE_TEXT.state.bootLoadingMessage}
          title={CARD_SERVICE_TEXT.state.loadingTitle}
        />
      </MobileScreen>
    );
  }

  const canSubmitManual =
    frontText.trim().length > 0 &&
    backText.trim().length > 0 &&
    !createMutation.isPending &&
    !updateMutation.isPending;
  const canSubmitBulk =
    bulkText.trim().length > 0 &&
    !bulkCreateMutation.isPending &&
    !bulkReplaceMutation.isPending;

  const rowBusy = updateMutation.isPending || deleteMutation.isPending;
  const cardKeyExtractor = useCallback((item: CardDeckItemDto) => item.id, []);
  const listHeader = (
    <FormStack gap="roomy">
      <MobileHeaderBar
        leftLabel={CARD_SERVICE_TEXT.play.headerBackLabel}
        onLeftPress={() => router.back()}
        rightAccessibilityLabel={
          CARD_SERVICE_TEXT.detail.cardSettingsAccessibilityLabel
        }
        rightLabel="⋮"
        onRightPress={() =>
          showYeonAlert(
            CARD_SERVICE_TEXT.detail.cardSettingsTitle,
            CARD_SERVICE_TEXT.detail.cardSettingsPreparingMessage
          )
        }
        subtitle={`${getModeBadge(mode)} · ${CARD_SERVICE_TEXT.detail.metaCountLabel} ${cardCount}${CARD_SERVICE_TEXT.detail.metaSuffixCreatedAtLabel}${formatDate(detail?.deck.createdAt)}`}
        title={detail?.deck.title ?? CARD_SERVICE_TEXT.detail.deckTitleFallback}
      />

      <ActionButton
        disabled={!detail || cardCount === 0}
        label={CARD_SERVICE_TEXT.detail.playButtonLabel}
        onPress={() => {
          if (!deckId) {
            return;
          }
          router.push(getCardServiceDeckPlayHref(deckId));
        }}
        variant="dark"
      />

      {detailState.kind === "loading" ? (
        <StateBlock
          loading
          message={CARD_SERVICE_TEXT.state.loading}
          title={CARD_SERVICE_TEXT.state.loadingTitle}
        />
      ) : detailState.kind === "error" ? (
        <StateBlock
          message={detailState.message}
          title={CARD_SERVICE_TEXT.state.errorTitle}
        />
      ) : detailState.kind === "ready" && detailState.isEmpty ? (
        <StateBlock
          message={CARD_SERVICE_TEXT.detail.emptyMessage}
          title={CARD_SERVICE_TEXT.detail.emptyTitle}
        />
      ) : isReady && detail ? (
        <SectionSummaryHeader
          meta={`${CARD_SERVICE_TEXT.detail.allCardsLabel} ${detail.items.length}`}
          title={CARD_SERVICE_TEXT.detail.itemLabel}
        />
      ) : null}
    </FormStack>
  );

  return (
    <MobileScreen
      contentVariant="full"
      floatingSlot={
        <FloatingActionButton
          accessibilityLabel={
            CARD_SERVICE_TEXT.detail.addCardAccessibilityLabel
          }
          onPress={openCreateSheet}
        />
      }
      safeAreaEdges={["top"]}
      scroll={false}
    >
      <FlatList
        contentContainerStyle={{ gap: 12, padding: 24, paddingBottom: 110 }}
        data={listItems}
        keyExtractor={cardKeyExtractor}
        ListHeaderComponent={listHeader}
        renderItem={({ item, index }) => (
          <DeckCardRow
            index={index + 1}
            isBusy={rowBusy}
            isMenuOpen={activeMenuItemId === item.id}
            item={item}
            onDelete={handleDeleteCard}
            onEdit={openEditSheet}
            onToggleMenu={toggleMenu}
          />
        )}
        style={{ flex: 1 }}
      />

      <BottomSheetModal
        closeAccessibilityLabel={CARD_SERVICE_TEXT.shared.closeModalLabel}
        onClose={closeSheet}
        visible={sheetState.kind !== "closed"}
      >
        <BottomSheetForm>
          <SegmentedControl
            onValueChange={setSheetMode}
            options={[
              {
                disabled: sheetState.kind === "edit",
                label: CARD_SERVICE_TEXT.detail.sheetManualLabel,
                value: SHEET_MODES.manual,
              },
              {
                disabled: sheetState.kind === "edit",
                label: CARD_SERVICE_TEXT.detail.sheetBulkLabel,
                value: SHEET_MODES.bulk,
              },
            ]}
            value={sheetMode}
          />

          {sheetState.kind === "edit" || sheetMode === SHEET_MODES.manual ? (
            <>
              <FormIntro
                title={
                  sheetState.kind === "edit"
                    ? CARD_SERVICE_TEXT.detail.sheetEditTitle
                    : CARD_SERVICE_TEXT.detail.sheetCreateLabel
                }
              />
              <MarkdownTextField
                label={CARD_SERVICE_TEXT.detail.questionLabel}
                maxLength={2000}
                onChangeText={setFrontText}
                placeholder={CARD_SERVICE_TEXT.detail.questionHint}
                value={frontText}
              />
              <MarkdownTextField
                label={CARD_SERVICE_TEXT.detail.answerLabel}
                maxLength={2000}
                onChangeText={setBackText}
                placeholder={CARD_SERVICE_TEXT.detail.answerHint}
                value={backText}
              />
              <ActionButton
                disabled={!canSubmitManual}
                label={
                  sheetState.kind === "edit"
                    ? updateMutation.isPending
                      ? CARD_SERVICE_TEXT.detail.submitEditBusyLabel
                      : CARD_SERVICE_TEXT.detail.submitEditLabel
                    : createMutation.isPending
                      ? CARD_SERVICE_TEXT.detail.submitBusyLabel
                      : CARD_SERVICE_TEXT.detail.submitCreateLabel
                }
                onPress={
                  sheetState.kind === "edit"
                    ? handleUpdateCard
                    : handleCreateCard
                }
                variant="dark"
              />
            </>
          ) : (
            <>
              <FormIntro
                hint={CARD_SERVICE_TEXT.detail.bulkHelp}
                title={CARD_SERVICE_TEXT.detail.sheetBulkLabel}
              />
              <TextField
                label={CARD_SERVICE_TEXT.detail.bulkInputLabel}
                multiline
                multilineMinHeight={210}
                onChangeText={setBulkText}
                placeholder={CARD_SERVICE_TEXT.detail.bulkPlaceholder}
                value={bulkText}
              />
              <FormStack gap="compact">
                <ActionButton
                  disabled={!canSubmitBulk}
                  label={
                    bulkCreateMutation.isPending
                      ? CARD_SERVICE_TEXT.detail.submitBusyLabel
                      : CARD_SERVICE_TEXT.detail.bulkSaveLabel
                  }
                  onPress={handleBulkCreateCards}
                  variant="dark"
                />
                <ActionButton
                  disabled={!canSubmitBulk}
                  label={
                    bulkReplaceMutation.isPending
                      ? CARD_SERVICE_TEXT.detail.bulkOverwriteBusyLabel
                      : CARD_SERVICE_TEXT.detail.bulkOverwriteLabel
                  }
                  onPress={handleBulkReplaceCards}
                  variant="danger"
                />
              </FormStack>
            </>
          )}
        </BottomSheetForm>
      </BottomSheetModal>
    </MobileScreen>
  );
}
