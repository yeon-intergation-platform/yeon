import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";
import {
  type YeonHref as Href,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { formatYeonCardDeckCreatedDate } from "@yeon/ui/runtime/ports/card-deck";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";
import { useCallback, useMemo } from "react";
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
import { createMobileCardItemRepository } from "./runtime-adapters/card-item-repository";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { DeckCardRow } from "./card-deck-detail-card-row";
import { useCardDeckDetailActions } from "./use-card-deck-detail-actions";
import { useCardDeckDetailQuery } from "./use-card-deck-detail-query";
import { useCardServiceResolvedSession } from "./use-card-service-resolved-session";
import {
  SHEET_MODES,
  type SheetState,
  useCardDeckDetailSheetState,
} from "./use-card-deck-detail-sheet-state";
import { MarkdownTextField } from "./markdown-text-field";
import {
  CARD_SERVICE_MODE,
  type CardServiceMode,
} from "./card-service-session";

const CARD_SERVICE_DECK_PLAY_ROUTE = YEON_ROUTE_TEMPLATES.cardDeckPlay as Href;

const SHEET_MODE_LOCKED_KINDS = new Set<SheetState["kind"]>(["edit"]);

function deriveSheetModeSwitchPolicy(sheetState: SheetState): {
  isDisabled: boolean;
} {
  return {
    isDisabled: SHEET_MODE_LOCKED_KINDS.has(sheetState.kind),
  };
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

function getModeBadge(mode: CardServiceMode): string {
  return mode === CARD_SERVICE_MODE.server
    ? CARD_SERVICE_TEXT.detail.modeAuthenticatedLabel
    : CARD_SERVICE_TEXT.detail.modeGuestLabel;
}

export function CardDeckDetailScreen({ deckId }: CardDeckDetailScreenProps) {
  const router = useRouter();
  const { isBooting, mode, sessionToken } = useCardServiceResolvedSession();
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

  const {
    bulkCreateButtonLabel,
    bulkReplaceButtonLabel,
    canSubmitBulk,
    canSubmitManual,
    handleBulkCreateCards,
    handleBulkReplaceCards,
    handleCreateCard,
    handleDeleteCard,
    handleUpdateCard,
    manualSubmitButtonLabel,
    rowBusy,
  } = useCardDeckDetailActions({
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
  });

  const cardKeyExtractor = useCallback((item: CardDeckItemDto) => item.id, []);
  const sheetModeSwitchPolicy = deriveSheetModeSwitchPolicy(sheetState);

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
        subtitle={`${getModeBadge(mode)} · ${CARD_SERVICE_TEXT.detail.metaCountLabel} ${cardCount}${CARD_SERVICE_TEXT.detail.metaSuffixCreatedAtLabel}${formatYeonCardDeckCreatedDate(detail?.deck.createdAt)}`}
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
                disabled: sheetModeSwitchPolicy.isDisabled,
                label: CARD_SERVICE_TEXT.detail.sheetManualLabel,
                value: SHEET_MODES.manual,
              },
              {
                disabled: sheetModeSwitchPolicy.isDisabled,
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
                label={manualSubmitButtonLabel}
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
                  label={bulkCreateButtonLabel}
                  onPress={handleBulkCreateCards}
                  variant="dark"
                />
                <ActionButton
                  disabled={!canSubmitBulk}
                  label={bulkReplaceButtonLabel}
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
