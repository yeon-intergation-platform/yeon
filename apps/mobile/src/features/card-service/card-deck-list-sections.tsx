import {
  YeonActionButton as ActionButton,
  YeonButton,
  YeonBottomSheetForm as BottomSheetForm,
  YeonBottomSheetModal as BottomSheetModal,
  YeonFormIntro as FormIntro,
  YeonFormStack as FormStack,
  YeonImage,
  YeonSectionCard as SectionCard,
  YeonSegmentedControl as SegmentedControl,
  YeonStateBlock as StateBlock,
  YeonText,
  YeonTextField as TextField,
  YeonView,
} from "@yeon/ui/native";
import { useState } from "react";

import { HeaderExperienceBadge } from "../user-experience/header-experience-badge";
import {
  iconReviewImage,
  iconSyncImage,
  mascotEmptyImage,
  mascotImage,
} from "./card-deck-list-assets";
import { DeckCard } from "./card-deck-list-deck-card";
import { styles } from "./card-deck-list-screen.styles";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import type { CardDeckListState } from "./use-card-deck-list-state";
import { MobileCreateDeckAiForm } from "./mobile-create-deck-ai-form";

const CREATE_DECK_MODES = {
  manual: "manual",
  ai: "ai",
} as const;

type CardDeckListHeaderProps = Pick<CardDeckListState, never>;

export function CardDeckListHeader(_props: CardDeckListHeaderProps) {
  return (
    <YeonView style={styles.header}>
      <YeonView style={styles.headerTextBlock}>
        <YeonText style={styles.brand}>
          {CARD_SERVICE_TEXT.list.topBarTitle}
        </YeonText>
        <YeonText style={styles.welcome}>
          안녕하세요 👋 오늘도 함께 성장해요.
        </YeonText>
      </YeonView>
      <YeonView style={styles.headerRight}>
        <HeaderExperienceBadge />
        <YeonImage
          resizeMode="contain"
          source={mascotImage}
          style={styles.headerMascot}
        />
      </YeonView>
    </YeonView>
  );
}

type ResumeDeckCardProps = Pick<
  CardDeckListState,
  "formatDeckMeta" | "onPlayDeck" | "resumeDeck"
>;

export function ResumeDeckCard({
  formatDeckMeta,
  onPlayDeck,
  resumeDeck,
}: ResumeDeckCardProps) {
  if (!resumeDeck) {
    return null;
  }

  return (
    <SectionCard style={styles.resumeCard}>
      <YeonView style={styles.resumeRow}>
        <YeonImage
          resizeMode="contain"
          source={iconReviewImage}
          style={styles.resumeIcon}
        />
        <YeonView style={styles.resumeBody}>
          <YeonText style={styles.resumeLabel}>이어서 학습</YeonText>
          <YeonText numberOfLines={1} style={styles.resumeTitle}>
            {resumeDeck.title}
          </YeonText>
          <YeonText numberOfLines={1} style={styles.resumeMeta}>
            {formatDeckMeta(resumeDeck)}
          </YeonText>
        </YeonView>
        <ActionButton
          label="학습 시작"
          onPress={() => onPlayDeck(resumeDeck.id)}
          style={styles.resumeButton}
          variant="dark"
        />
      </YeonView>
    </SectionCard>
  );
}

type GuestSyncBannerProps = Pick<
  CardDeckListState,
  "decks" | "isGuestMode" | "openGate"
>;

export function GuestSyncBanner({
  decks,
  isGuestMode,
  openGate,
}: GuestSyncBannerProps) {
  if (!isGuestMode || decks.length === 0) {
    return null;
  }

  return (
    <YeonView style={styles.syncBanner}>
      <YeonImage
        resizeMode="contain"
        source={iconSyncImage}
        style={styles.syncIcon}
      />
      <YeonText style={styles.syncText}>
        로그인하면 덱을 계정에 안전하게 저장할 수 있어요.
      </YeonText>
      <YeonButton
        accessibilityRole="button"
        aria-label="로그인하기"
        onPress={openGate}
      >
        <YeonText style={styles.syncLink}>로그인하기</YeonText>
      </YeonButton>
    </YeonView>
  );
}

type DeckListContentProps = Pick<
  CardDeckListState,
  "decks" | "listState" | "onOpenCreateSheet" | "onOpenDeck"
>;

export function DeckListContent({
  decks,
  listState,
  onOpenCreateSheet,
  onOpenDeck,
}: DeckListContentProps) {
  return (
    <>
      <YeonView style={styles.sectionHeader}>
        <YeonText style={styles.sectionTitle}>내 덱</YeonText>
        {listState.kind === "ready" ? (
          <YeonText style={styles.sectionCount}>{decks.length}개</YeonText>
        ) : null}
      </YeonView>

      {listState.kind === "loading" ? (
        <StateBlock
          loading
          message={CARD_SERVICE_TEXT.state.loading}
          title={CARD_SERVICE_TEXT.state.loadingTitle}
        />
      ) : listState.kind === "error" ? (
        <StateBlock
          message={listState.message}
          title={CARD_SERVICE_TEXT.state.errorTitle}
        />
      ) : listState.kind === "empty" ? (
        <YeonView style={styles.emptyCard}>
          <YeonImage
            resizeMode="contain"
            source={mascotEmptyImage}
            style={styles.emptyMascot}
          />
          <YeonText style={styles.emptyTitle}>
            {CARD_SERVICE_TEXT.list.emptyTitle}
          </YeonText>
          <YeonText style={styles.emptyMessage}>
            {CARD_SERVICE_TEXT.list.emptyMessage}
          </YeonText>
          <ActionButton
            label="+ 새 덱 만들기"
            onPress={onOpenCreateSheet}
            style={styles.emptyButton}
            variant="dark"
          />
        </YeonView>
      ) : (
        <FormStack>
          {decks.map((deck, index) => (
            <DeckCard
              deck={deck}
              index={index}
              key={deck.id}
              onOpen={() => onOpenDeck(deck.id)}
            />
          ))}
        </FormStack>
      )}
    </>
  );
}

type CreateDeckSheetProps = Pick<
  CardDeckListState,
  | "canCreateDeck"
  | "createDeckButtonLabel"
  | "handleCreateDeck"
  | "isCreateSheetOpen"
  | "onCloseCreateSheet"
  | "setTitle"
  | "title"
>;

export function CreateDeckSheet({
  canCreateDeck,
  createDeckButtonLabel,
  handleCreateDeck,
  isCreateSheetOpen,
  onCloseCreateSheet,
  setTitle,
  title,
}: CreateDeckSheetProps) {
  const [mode, setMode] = useState<
    (typeof CREATE_DECK_MODES)[keyof typeof CREATE_DECK_MODES]
  >(CREATE_DECK_MODES.manual);
  const [aiOperationLocked, setAiOperationLocked] = useState(false);
  const isSheetLocked = mode === CREATE_DECK_MODES.ai && aiOperationLocked;
  const requestClose = () => {
    if (!isSheetLocked) onCloseCreateSheet();
  };
  return (
    <BottomSheetModal
      closeAccessibilityLabel="닫기"
      onClose={requestClose}
      visible={isCreateSheetOpen}
    >
      <BottomSheetForm>
        <FormIntro title={CARD_SERVICE_TEXT.list.deckSectionTitle} />
        <SegmentedControl
          value={mode}
          onValueChange={(nextMode) => {
            if (!isSheetLocked) setMode(nextMode);
          }}
          options={[
            {
              disabled: isSheetLocked,
              label: "직접 입력",
              value: CREATE_DECK_MODES.manual,
            },
            {
              disabled: isSheetLocked,
              label: "AI로 만들기",
              value: CREATE_DECK_MODES.ai,
            },
          ]}
        />
        {mode === CREATE_DECK_MODES.ai ? (
          <MobileCreateDeckAiForm
            onCreated={() => {
              setAiOperationLocked(false);
              onCloseCreateSheet();
            }}
            onOperationLockChange={setAiOperationLocked}
          />
        ) : (
          <>
            <TextField
              label={CARD_SERVICE_TEXT.list.deckNameLabel}
              onChangeText={setTitle}
              placeholder={CARD_SERVICE_TEXT.list.deckNamePlaceholder}
              value={title}
            />
            <ActionButton
              disabled={!canCreateDeck}
              label={createDeckButtonLabel}
              onPress={handleCreateDeck}
              variant="dark"
            />
          </>
        )}
      </BottomSheetForm>
    </BottomSheetModal>
  );
}
