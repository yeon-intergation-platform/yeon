import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import {
  type YeonHref as Href,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";
import { deriveCardDeckDetailViewState } from "@yeon/ui/runtime/ports/card-deck";
import { useEffect, useMemo, useState } from "react";
import { showYeonAlert } from "@yeon/ui/native";
import {
  YeonActionButton as ActionButton,
  YeonBottomSheetForm as BottomSheetForm,
  YeonBottomSheetModal as BottomSheetModal,
  YeonEditableCardRow as EditableCardRow,
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
import { CardMarkdown } from "./card-markdown";
import { MarkdownTextField } from "./markdown-text-field";
import {
  CARD_SERVICE_MODE,
  type CardServiceMode,
  resolveCardServiceSession,
} from "./card-service-session";

const CARD_SERVICE_DECK_PLAY_ROUTE = YEON_ROUTE_TEMPLATES.cardDeckPlay as Href;

const SHEET_MODES = {
  bulk: "bulk",
  manual: "manual",
} as const;

type SheetMode = (typeof SHEET_MODES)[keyof typeof SHEET_MODES];
type SheetState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; item: CardDeckItemDto };

interface ParsedCardInput {
  backText: string;
  frontText: string;
}

interface CardDeckDetailScreenProps {
  deckId?: string;
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

export function CardDeckDetailScreen({ deckId }: CardDeckDetailScreenProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mode, setMode] = useState<CardServiceMode>(CARD_SERVICE_MODE.guest);
  const [isBooting, setBooting] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [sheetMode, setSheetMode] = useState<SheetMode>(SHEET_MODES.manual);
  const [sheetState, setSheetState] = useState<SheetState>({ kind: "closed" });
  const [activeMenuItemId, setActiveMenuItemId] = useState<string | null>(null);

  // 게스트/서버 분기는 repository 어댑터가 흡수한다(웹과 동일 포트 인터페이스).
  const itemRepository = useMemo(
    () =>
      createMobileCardItemRepository({
        isSignedIn: mode === CARD_SERVICE_MODE.server,
        sessionToken,
      }),
    [mode, sessionToken]
  );

  const detailQuery = useQuery({
    // deckId 없는 케이스는 enabled:false로 쿼리 자체를 비활성화한다(raw 배열 대신 SSOT 사용).
    enabled: !isBooting && Boolean(deckId),
    queryFn: async () => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }
      return itemRepository.getDeckDetail(deckId);
    },
    queryKey: deckId
      ? cardServiceQueryKeys.deckDetail(
          mode === CARD_SERVICE_MODE.server,
          deckId
        )
      : cardServiceQueryKeys.deckDetail(
          mode === CARD_SERVICE_MODE.server,
          "__missing__"
        ),
  });

  const createMutation = useMutation({
    mutationFn: async (params: ParsedCardInput) => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }
      return itemRepository.addCard(deckId, params);
    },
    onSuccess: async () => {
      await invalidateDeck();
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async () => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }
      const cards = parseAiCardInput(bulkText);
      if (cards.length === 0) {
        throw new Error(CARD_SERVICE_TEXT.detail.noParseResultMessage);
      }
      await itemRepository.addCards(deckId, { items: cards });
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

  const updateMutation = useMutation({
    mutationFn: async (params: ParsedCardInput & { itemId: string }) => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }
      return itemRepository.updateCard(deckId, params.itemId, {
        backText: params.backText,
        frontText: params.frontText,
      });
    },
    onSuccess: async () => {
      closeSheet();
      await invalidateDeck();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!deckId) {
        throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);
      }
      await itemRepository.deleteCard(deckId, itemId);
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

  function openCreateSheet() {
    setFrontText("");
    setBackText("");
    setSheetMode(SHEET_MODES.manual);
    setSheetState({ kind: "create" });
  }

  function openEditSheet(item: CardDeckItemDto) {
    setFrontText(item.frontText);
    setBackText(item.backText);
    setSheetMode(SHEET_MODES.manual);
    setActiveMenuItemId(null);
    setSheetState({ item, kind: "edit" });
  }

  function closeSheet() {
    setSheetState({ kind: "closed" });
    setFrontText("");
    setBackText("");
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
      const message =
        error instanceof Error
          ? error.message
          : CARD_SERVICE_TEXT.detail.createErrorMessage;
      showYeonAlert(CARD_SERVICE_TEXT.state.errorTitle, message);
    }
  }

  async function handleBulkCreateCards() {
    try {
      await bulkCreateMutation.mutateAsync();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : CARD_SERVICE_TEXT.detail.createErrorMessage;
      showYeonAlert(CARD_SERVICE_TEXT.state.errorTitle, message);
    }
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
      const message =
        error instanceof Error
          ? error.message
          : CARD_SERVICE_TEXT.detail.updateErrorMessage;
      showYeonAlert(CARD_SERVICE_TEXT.state.errorTitle, message);
    }
  }

  function handleDeleteCard(itemId: string) {
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
              const message =
                error instanceof Error
                  ? error.message
                  : CARD_SERVICE_TEXT.detail.deleteErrorMessage;
              showYeonAlert(CARD_SERVICE_TEXT.state.errorTitle, message);
            }
          },
          style: "destructive",
          text: CARD_SERVICE_TEXT.shared.deleteLabel,
        },
      ]
    );
  }

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

  const detail = detailQuery.data;
  // 상태 분기는 web/mobile 공용 SSOT에서 파생한다(복제 금지).
  const detailState = deriveCardDeckDetailViewState(
    {
      isPending: detailQuery.isPending,
      isError: detailQuery.isError,
      data: detailQuery.data,
    },
    {
      errorMessage:
        detailQuery.error instanceof Error
          ? detailQuery.error.message
          : CARD_SERVICE_TEXT.detail.errorMessage,
    }
  );
  const cardCount = detail?.items.length ?? detail?.deck.itemCount ?? 0;
  const canSubmitManual =
    frontText.trim().length > 0 &&
    backText.trim().length > 0 &&
    !createMutation.isPending &&
    !updateMutation.isPending;
  const canSubmitBulk =
    bulkText.trim().length > 0 && !bulkCreateMutation.isPending;

  return (
    <MobileScreen
      contentVariant="detail"
      floatingSlot={
        <FloatingActionButton
          accessibilityLabel={
            CARD_SERVICE_TEXT.detail.addCardAccessibilityLabel
          }
          onPress={openCreateSheet}
        />
      }
      safeAreaEdges={["top"]}
    >
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
          title={
            detail?.deck.title ?? CARD_SERVICE_TEXT.detail.deckTitleFallback
          }
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
        ) : detail ? (
          <FormStack>
            <SectionSummaryHeader
              meta={`${CARD_SERVICE_TEXT.detail.allCardsLabel} ${detail.items.length}`}
              title={CARD_SERVICE_TEXT.detail.itemLabel}
            />
            {detail.items.map((item, index) => (
              <EditableCardRow
                answerLabel={CARD_SERVICE_TEXT.detail.answerLabel}
                answerText={item.backText}
                answerContent={<CardMarkdown source={item.backText} />}
                questionContent={<CardMarkdown source={item.frontText} />}
                deleteLabel={CARD_SERVICE_TEXT.shared.deleteLabel}
                editLabel={CARD_SERVICE_TEXT.shared.editLabel}
                index={index + 1}
                isBusy={updateMutation.isPending || deleteMutation.isPending}
                isMenuOpen={activeMenuItemId === item.id}
                key={item.id}
                menuAccessibilityLabel={
                  CARD_SERVICE_TEXT.shared.openCardMenuLabel
                }
                onDelete={() => handleDeleteCard(item.id)}
                onEdit={() => openEditSheet(item)}
                onToggleMenu={() =>
                  setActiveMenuItemId((current) =>
                    current === item.id ? null : item.id
                  )
                }
                openAccessibilityLabel={`${CARD_SERVICE_TEXT.shared.openCardLabel}: ${item.frontText}`}
                questionLabel={CARD_SERVICE_TEXT.detail.questionLabel}
                questionText={item.frontText}
              />
            ))}
          </FormStack>
        ) : null}
      </FormStack>

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
            </>
          )}
        </BottomSheetForm>
      </BottomSheetModal>
    </MobileScreen>
  );
}
