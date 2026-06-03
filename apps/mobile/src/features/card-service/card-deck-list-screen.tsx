import type { CardDeckDto } from "@yeon/api-contract/card-decks";
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
  YeonBottomSheetForm as BottomSheetForm,
  YeonBottomSheetModal as BottomSheetModal,
  YeonButton,
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
  createYeonStyleSheet,
  showYeonAlert,
  yeonMobileAppColors,
} from "@yeon/ui/native";
import { cardServiceQueryKeys } from "../../services/card-service/query-keys";
import { createMobileCardDeckRepository } from "./runtime-adapters/card-deck-repository";
import { CARD_SERVICE_TEXT } from "./card-service-copy";
import { useCardSession } from "./card-session-context";

// 홈 화면 이미지 에셋(사용자 제공 디자인 팩).
import mascotImage from "../../../assets/images/card-home/mascot-home.png";
import mascotEmptyImage from "../../../assets/images/card-home/mascot-empty.png";
import iconReviewImage from "../../../assets/images/card-home/icon-review.png";
import iconSyncImage from "../../../assets/images/card-home/icon-sync.png";
import deckThumb1 from "../../../assets/images/card-home/deck-thumb-1.png";
import deckThumb2 from "../../../assets/images/card-home/deck-thumb-2.png";
import deckThumb3 from "../../../assets/images/card-home/deck-thumb-3.png";

const DECK_THUMBS = [deckThumb1, deckThumb2, deckThumb3];

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

type DeckCardProps = {
  deck: CardDeckDto;
  index: number;
  onOpen: () => void;
};

function DeckCard({ deck, index, onOpen }: DeckCardProps) {
  return (
    <YeonButton
      accessibilityRole="button"
      aria-label={`${CARD_SERVICE_TEXT.shared.openDeckLabel}: ${deck.title}`}
      onPress={onOpen}
      style={styles.deckCard}
    >
      <YeonImage
        resizeMode="contain"
        source={DECK_THUMBS[index % DECK_THUMBS.length]}
        style={styles.deckThumb}
      />
      <YeonView style={styles.deckBody}>
        <YeonText numberOfLines={1} style={styles.deckTitle}>
          {deck.title}
        </YeonText>
        <YeonText numberOfLines={1} style={styles.deckMeta}>
          {formatCardDeckMeta(deck)}
        </YeonText>
      </YeonView>
      <YeonView style={styles.deckAction}>
        <YeonText style={styles.deckActionText}>
          {CARD_SERVICE_TEXT.shared.openDeckLabel}
        </YeonText>
      </YeonView>
    </YeonButton>
  );
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
      const message =
        error instanceof Error
          ? error.message
          : CARD_SERVICE_TEXT.list.createDeckErrorMessage;
      showYeonAlert(CARD_SERVICE_TEXT.state.errorTitle, message);
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
      errorMessage:
        decksQuery.error instanceof Error
          ? decksQuery.error.message
          : CARD_SERVICE_TEXT.list.errorMessage,
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

const styles = createYeonStyleSheet({
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
    minHeight: 96,
    paddingTop: 4,
  },
  headerTextBlock: {
    flex: 1,
    gap: 8,
    paddingRight: 12,
    paddingTop: 6,
  },
  brand: {
    color: yeonMobileAppColors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  welcome: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  headerMascot: {
    height: 84,
    marginTop: 2,
    width: 84,
  },
  resumeCard: {
    padding: 16,
  },
  resumeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  resumeIcon: {
    height: 30,
    width: 30,
  },
  resumeBody: {
    flex: 1,
    gap: 3,
  },
  resumeLabel: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  resumeTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  resumeMeta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
  },
  resumeButton: {
    paddingHorizontal: 18,
  },
  syncBanner: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surface,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  syncIcon: {
    height: 22,
    width: 24,
  },
  syncText: {
    color: yeonMobileAppColors.textMuted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  syncLink: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionHeader: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionCount: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  emptyMascot: {
    height: 160,
    marginBottom: 8,
    width: 160,
  },
  emptyTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyMessage: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 12,
    paddingHorizontal: 22,
  },
  deckCard: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.surfaceStrong,
    borderColor: yeonMobileAppColors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16,
  },
  deckThumb: {
    height: 46,
    width: 46,
  },
  deckBody: {
    flex: 1,
    gap: 4,
  },
  deckTitle: {
    color: yeonMobileAppColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  deckMeta: {
    color: yeonMobileAppColors.textMuted,
    fontSize: 12,
  },
  deckAction: {
    alignItems: "center",
    borderColor: yeonMobileAppColors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deckActionText: {
    color: yeonMobileAppColors.text,
    fontSize: 13,
    fontWeight: "700",
  },
});
