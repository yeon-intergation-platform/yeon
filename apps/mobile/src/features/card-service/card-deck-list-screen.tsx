import {
  useYeonMutation as useMutation,
  useYeonQuery as useQuery,
  useYeonQueryClient as useQueryClient,
} from "@yeon/ui/native";
import {
  deriveCardDeckListViewState,
  formatCardDeckMeta,
} from "@yeon/ui/runtime/ports/card-deck";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";
import {
  type YeonHref as Href,
  useYeonRouter as useRouter,
} from "@yeon/ui/native";
import { useMemo, useState } from "react";
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
  showYeonAlert,
} from "@yeon/ui/native";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import { HeaderExperienceBadge } from "../user-experience/header-experience-badge";
import { createMobileCardDeckRepository } from "./runtime-adapters/card-deck-repository";
import { DeckCard } from "./card-deck-list-deck-card";
import { styles } from "./card-deck-list-screen.styles";
import {
  iconReviewImage,
  iconSyncImage,
  mascotEmptyImage,
  mascotImage,
} from "./card-deck-list-assets";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { getCardServiceErrorMessage } from "./error-message";
import { useCardSession } from "./card-session-context";

// 경로 템플릿은 route 정체성 SSOT에서 가져온다(웹과 동일 템플릿 파생, 하드코딩 금지).
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

export function CardDeckListScreen() {
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

  const isGuestMode = !isSignedIn;
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

  return (
    <MobileScreen
      contentVariant="card"
      safeAreaEdges={["top"]}
      floatingSlot={
        <FloatingActionButton
          accessibilityLabel={CARD_SERVICE_TEXT.list.deckSectionTitle}
          label="+"
          onPress={() => setCreateSheetOpen(true)}
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
                  {formatCardDeckMeta(resumeDeck)}
                </YeonText>
              </YeonView>
              <ActionButton
                label="학습 시작"
                onPress={() =>
                  router.push(getCardServiceDeckPlayHref(resumeDeck.id))
                }
                style={styles.resumeButton}
                variant="dark"
              />
            </YeonView>
          </SectionCard>
        ) : null}

        {/* 주 CTA */}
        <ActionButton
          label="+ 새 덱 만들기"
          onPress={() => setCreateSheetOpen(true)}
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
              onPress={() => setCreateSheetOpen(true)}
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
                onOpen={() =>
                  router.push(getCardServiceDeckDetailHref(deck.id))
                }
              />
            ))}
          </FormStack>
        )}
      </FormStack>

      {/* 새 덱 만들기 바텀시트 */}
      <BottomSheetModal
        closeAccessibilityLabel="닫기"
        onClose={() => setCreateSheetOpen(false)}
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
            disabled={createDeckMutation.isPending || title.trim().length === 0}
            label={
              createDeckMutation.isPending
                ? CARD_SERVICE_TEXT.list.creatingDeckLabel
                : CARD_SERVICE_TEXT.list.createDeckButtonLabel
            }
            onPress={handleCreateDeck}
            variant="dark"
          />
        </BottomSheetForm>
      </BottomSheetModal>
    </MobileScreen>
  );
}
