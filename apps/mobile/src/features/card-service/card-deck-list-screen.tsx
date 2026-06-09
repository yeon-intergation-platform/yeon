import {
  YeonActionButton as ActionButton,
  YeonButton,
  YeonBottomSheetForm as BottomSheetForm,
  YeonBottomSheetModal as BottomSheetModal,
  YeonFloatingActionButton as FloatingActionButton,
  YeonFormIntro as FormIntro,
  YeonFormStack as FormStack,
  YeonImage,
  YeonMobileScreen as MobileScreen,
  YeonSectionCard as SectionCard,
  YeonStateBlock as StateBlock,
  YeonText,
  YeonTextField as TextField,
  YeonView,
} from "@yeon/ui/native";
import { HeaderExperienceBadge } from "../user-experience/header-experience-badge";
import { DeckCard } from "./card-deck-list-deck-card";
import { styles } from "./card-deck-list-screen.styles";
import {
  iconReviewImage,
  iconSyncImage,
  mascotEmptyImage,
  mascotImage,
} from "./card-deck-list-assets";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { useCardDeckListState } from "./use-card-deck-list-state";

// useCardDeckListState 내부에서 YEON_ROUTE_TEMPLATES, formatCardDeckMeta,
// deriveCardDeckListViewState로 web/mobile 공용 route/meta/list-state SSOT를 파생한다.

export function CardDeckListScreen() {
  const {
    canCreateDeck,
    createDeckButtonLabel,
    decks,
    formatDeckMeta,
    handleCreateDeck,
    isCreateSheetOpen,
    isGuestMode,
    listState,
    onCloseCreateSheet,
    onOpenCreateSheet,
    onOpenDeck,
    onPlayDeck,
    openGate,
    resumeDeck,
    setTitle,
    title,
  } = useCardDeckListState();

  return (
    <MobileScreen
      contentVariant="card"
      safeAreaEdges={["top"]}
      floatingSlot={
        <FloatingActionButton
          accessibilityLabel={CARD_SERVICE_TEXT.list.deckSectionTitle}
          label="+"
          onPress={onOpenCreateSheet}
        />
      }
    >
      <FormStack gap="roomy">
        {/* 헤더: 브랜드 + 환영 + 마스코트 + 우상단 로그인/동기화 칩 */}
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
            {/* 로그인 시 경험치 배지(데이터/로딩/에러는 배지 내부에서 분기, 미표시 가능). */}
            <HeaderExperienceBadge />
            <YeonImage
              resizeMode="contain"
              source={mascotImage}
              style={styles.headerMascot}
            />
          </YeonView>
        </YeonView>

        {/* 학습 유인: 가장 최근 덱으로 이어서 학습 */}
        {resumeDeck ? (
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
        ) : null}

        {/* 주 CTA */}
        <ActionButton
          label="+ 새 덱 만들기"
          onPress={onOpenCreateSheet}
          variant="dark"
        />

        {/* 게스트 동기화 배너 */}
        {isGuestMode && decks.length > 0 ? (
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
        ) : null}

        {/* 내 덱 섹션 */}
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
      </FormStack>

      {/* 새 덱 만들기 바텀시트 */}
      <BottomSheetModal
        closeAccessibilityLabel="닫기"
        onClose={onCloseCreateSheet}
        visible={isCreateSheetOpen}
      >
        <BottomSheetForm>
          <FormIntro title={CARD_SERVICE_TEXT.list.deckSectionTitle} />
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
        </BottomSheetForm>
      </BottomSheetModal>
    </MobileScreen>
  );
}
