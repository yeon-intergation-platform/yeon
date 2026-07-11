"use client";
import {
  YeonButton,
  YeonIcon,
  YeonLink,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import type {
  CardDeckDetailResponse,
  CardDeckDto,
} from "@yeon/api-contract/card-decks";
import { YEON_ROUTE_TEMPLATES } from "@yeon/ui/runtime/ports";
import {
  CARD_RECALL_EXCLUSION_REASONS,
  getCardRecallExclusionReason,
  partitionCardDeckItemsForRecall,
} from "@yeon/ui/runtime/ports/card-deck";
import { useEffect, useState } from "react";
import { useIsAuthenticated } from "../card-service/auth-context";
import { MarkdownContent } from "../card-service/components/markdown-content";
import { MergeGuestDialog } from "../card-service/components/merge-guest-dialog";
import { useDeckDetail } from "../card-service/hooks/use-deck-detail";
import { useDeckList } from "../card-service/hooks/use-deck-list";
import { countGuestCardDecks } from "@/lib/guest-card-service-store";
import { resolveBaekjiSelectedDeckId } from "./baekji-deck-selection";
import { GuestRecallDeckCreator } from "./guest-recall-deck-creator";
import { TypingServiceHeader } from "./typing-service-header";
import { TYPING_SERVICE_HOME_CLASS as C } from "./typing-service-home.const";
import { TYPING_SERVICE_COMMON_CLASS as CC } from "./typing-service-common.const";

// 백지 학습(recall) 홈. 카드 덱을 골라 "질문 보고 답 전부 쓰기" 세션으로 진입한다.
// 실제 카드 서비스 덱 목록(listServerCardDecksOrNull)을 재사용한다.

const BAEKJI_HOME_COPY = {
  headerTitle: "백지",
  introTitle: "안 보고 써서 외우는, 백지",
  introDescription: "질문을 보고 답을 전부 기억으로 써내세요.",
  deckSectionTitle: "백지로 외울 덱",
  previewTitle: "질문·답 미리보기",
  selectAction: "질문·답 확인",
  selectedAction: "선택됨",
  cardCountUnit: "장",
  startAction: "이 덱으로 백지",
  viewAction: "덱 보기/확인",
  loading: "덱 목록을 불러오는 중...",
  loadError: "덱 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
  loginTitle: "로그인하고 내 카드 덱으로 백지",
  loginDescription:
    "카드 서비스에 로그인하면 만들어 둔 덱을 백지로 외울 수 있어요.",
  loginAction: "카드 서비스로 이동",
  emptyTitle: "아직 백지로 외울 덱이 없어요",
  emptyDescription:
    "카드 서비스에서 질문(front)·답(back) 카드를 먼저 만들어 주세요.",
  emptyAction: "카드 서비스에서 덱 만들기",
  previewLoading: "선택한 덱의 카드를 불러오는 중...",
  previewError: "선택한 덱의 카드를 불러오지 못했습니다.",
  noEligibleCards:
    "질문과 답이 모두 있는 카드가 없어 백지를 시작할 수 없습니다.",
  excludedSummary: "질문이나 답이 비어 있는 카드는 백지 세션에서 제외됩니다.",
  selectPrompt: "먼저 백지로 외울 덱을 직접 선택해 주세요.",
  morePreview: "카드 더 보기",
  guestMigrationTitle: "이 브라우저에 만든 백지 덱이 있어요",
  guestMigrationDescription:
    "로그인 전 이 서비스에서 만든 덱을 계정으로 이관하면 카드 서비스와 다른 기기에서도 사용할 수 있어요.",
  guestMigrationAction: "계정으로 이관",
} as const;

const CARD_DECKS_HREF = "https://card.yeon.world/card-service/decks";
const EMPTY_DECKS: readonly CardDeckDto[] = [];
const PREVIEW_PAGE_SIZE = 20;

function sessionHref(deckId: string) {
  return `${YEON_ROUTE_TEMPLATES.recallSession}?deckId=${encodeURIComponent(deckId)}`;
}

function deckDetailHref(deckId: string) {
  return `https://card.yeon.world/card-service/decks/${encodeURIComponent(deckId)}`;
}

function DeckCard({
  deck,
  isSelected,
  canViewDetails,
  onSelect,
}: {
  deck: CardDeckDto;
  isSelected: boolean;
  canViewDetails: boolean;
  onSelect: () => void;
}) {
  return (
    <YeonView className="flex flex-col gap-4 rounded-2xl border border-[#e5e5e5] bg-white p-5 transition-colors hover:border-[#111]">
      <YeonView className="flex min-w-0 flex-col gap-1">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={C.featureTitle}
        >
          {deck.title}
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={C.featureDescription}
        >
          카드 {deck.itemCount}
          {BAEKJI_HOME_COPY.cardCountUnit}
        </YeonText>
      </YeonView>
      <YeonView className="flex flex-wrap gap-2">
        <YeonButton
          type="button"
          variant={isSelected ? "primary" : "secondary"}
          aria-pressed={isSelected}
          onClick={onSelect}
        >
          {isSelected
            ? BAEKJI_HOME_COPY.selectedAction
            : BAEKJI_HOME_COPY.selectAction}
        </YeonButton>
        {canViewDetails ? (
          <YeonLink
            href={deckDetailHref(deck.id)}
            className={CC.panelGhostButton}
          >
            {BAEKJI_HOME_COPY.viewAction}
          </YeonLink>
        ) : null}
      </YeonView>
    </YeonView>
  );
}

function exclusionReasonCopy(
  reason: ReturnType<typeof getCardRecallExclusionReason>
) {
  if (reason === CARD_RECALL_EXCLUSION_REASONS.missingQuestionAndAnswer) {
    return "질문과 답이 비어 있어 제외됩니다.";
  }
  if (reason === CARD_RECALL_EXCLUSION_REASONS.missingQuestion) {
    return "질문이 비어 있어 제외됩니다.";
  }
  return "답이 비어 있어 제외됩니다.";
}

function SelectedDeckPreview({ detail }: { detail: CardDeckDetailResponse }) {
  const [visibleCount, setVisibleCount] = useState(PREVIEW_PAGE_SIZE);
  const { eligibleItems, excludedItems } = partitionCardDeckItemsForRecall(
    detail.items
  );
  const visibleItems = detail.items.slice(0, visibleCount);
  return (
    <YeonView className="mt-7 border-t border-[#e5e5e5] pt-6">
      <YeonView className="flex flex-wrap items-start justify-between gap-4">
        <YeonView className="min-w-0">
          <YeonText
            as="h3"
            variant="unstyled"
            tone="inherit"
            className="text-[17px] font-extrabold text-[#111]"
          >
            {BAEKJI_HOME_COPY.previewTitle} · {detail.deck.title}
          </YeonText>
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-1 text-[13px] leading-5 text-[#666]"
          >
            학습 가능 {eligibleItems.length}장
            {excludedItems.length > 0
              ? ` · 제외 ${excludedItems.length}장. ${BAEKJI_HOME_COPY.excludedSummary}`
              : ""}
          </YeonText>
        </YeonView>
        {eligibleItems.length > 0 ? (
          <YeonLink
            href={sessionHref(detail.deck.id)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#111] px-4 py-2.5 text-[14px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
          >
            {BAEKJI_HOME_COPY.startAction}
            <YeonIcon name="chevron-right" size={16} aria-hidden="true" />
          </YeonLink>
        ) : (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={CC.textError}
          >
            {BAEKJI_HOME_COPY.noEligibleCards}
          </YeonText>
        )}
      </YeonView>

      <YeonView
        as="ol"
        className="mt-5 flex flex-col border-t border-[#e5e5e5]"
      >
        {visibleItems.map((item, index) => {
          const exclusionReason = getCardRecallExclusionReason(item);
          return (
            <YeonView
              as="li"
              key={item.id}
              className="grid gap-4 border-b border-[#e5e5e5] py-5 md:grid-cols-2"
            >
              <YeonView className="min-w-0">
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[11px] font-extrabold text-[#777]"
                >
                  카드 {index + 1} · 질문
                </YeonText>
                {exclusionReason ===
                  CARD_RECALL_EXCLUSION_REASONS.missingQuestion ||
                exclusionReason ===
                  CARD_RECALL_EXCLUSION_REASONS.missingQuestionAndAnswer ? (
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className="mt-2 text-[14px] text-[#999]"
                  >
                    질문 없음
                  </YeonText>
                ) : (
                  <MarkdownContent className="mt-2 text-[14px] leading-6">
                    {item.frontText}
                  </MarkdownContent>
                )}
              </YeonView>
              <YeonView className="min-w-0">
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[11px] font-extrabold text-[#777]"
                >
                  답
                </YeonText>
                {exclusionReason ===
                  CARD_RECALL_EXCLUSION_REASONS.missingAnswer ||
                exclusionReason ===
                  CARD_RECALL_EXCLUSION_REASONS.missingQuestionAndAnswer ? (
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className="mt-2 text-[14px] text-[#999]"
                  >
                    답 없음
                  </YeonText>
                ) : (
                  <MarkdownContent className="mt-2 text-[14px] leading-6">
                    {item.backText}
                  </MarkdownContent>
                )}
              </YeonView>
              {exclusionReason ? (
                <YeonText
                  as="p"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[13px] font-semibold text-red-600 md:col-span-2"
                >
                  {exclusionReasonCopy(exclusionReason)}
                </YeonText>
              ) : null}
            </YeonView>
          );
        })}
      </YeonView>
      {visibleCount < detail.items.length ? (
        <YeonView className="mt-4 flex justify-center">
          <YeonButton
            type="button"
            variant="secondary"
            onClick={() =>
              setVisibleCount((current) => current + PREVIEW_PAGE_SIZE)
            }
          >
            {BAEKJI_HOME_COPY.morePreview} ({visibleCount}/{detail.items.length}
            )
          </YeonButton>
        </YeonView>
      ) : null}
    </YeonView>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: string;
}) {
  return (
    <YeonView className="flex flex-col items-start gap-4 rounded-2xl border border-[#e5e5e5] bg-white p-6">
      <YeonView className="flex flex-col gap-1">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={CC.panelTextEmphasis15}
        >
          {title}
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={CC.textBody14Neutral}
        >
          {description}
        </YeonText>
      </YeonView>
      <YeonLink
        href={CARD_DECKS_HREF}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
      >
        {action}
        <YeonIcon name="chevron-right" size={16} aria-hidden="true" />
      </YeonLink>
    </YeonView>
  );
}

function GuestMigrationNotice({
  guestDeckCount,
  onOpen,
}: {
  guestDeckCount: number;
  onOpen: () => void;
}) {
  if (guestDeckCount === 0) return null;

  return (
    <YeonView className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
      <YeonView className="min-w-0">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="text-[14px] font-bold text-[#111]"
        >
          {BAEKJI_HOME_COPY.guestMigrationTitle} ({guestDeckCount}개)
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className="mt-1 text-[13px] leading-5 text-[#666]"
        >
          {BAEKJI_HOME_COPY.guestMigrationDescription}
        </YeonText>
      </YeonView>
      <YeonButton type="button" variant="secondary" onClick={onOpen}>
        {BAEKJI_HOME_COPY.guestMigrationAction}
      </YeonButton>
    </YeonView>
  );
}

export function BaekjiHome() {
  const isAuthenticated = useIsAuthenticated();
  const decksQuery = useDeckList();
  const [requestedDeckId, setRequestedDeckId] = useState<string | null>(null);
  const [guestDeckCount, setGuestDeckCount] = useState(0);
  const [isGuestMigrationOpen, setIsGuestMigrationOpen] = useState(false);
  const decks = decksQuery.data === undefined ? EMPTY_DECKS : decksQuery.data;
  const selectedDeckId = resolveBaekjiSelectedDeckId(requestedDeckId, decks);
  const detailQuery = useDeckDetail(selectedDeckId);
  const isDetailLoading = detailQuery.isLoading;
  const hasDetailError = detailQuery.isError;
  const selectedDetail = detailQuery.data;

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) {
      setGuestDeckCount(0);
      return () => {
        cancelled = true;
      };
    }
    void countGuestCardDecks()
      .then((count) => {
        if (!cancelled) setGuestDeckCount(count);
      })
      .catch(() => {
        if (!cancelled) setGuestDeckCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  async function closeGuestMigration() {
    setIsGuestMigrationOpen(false);
    if (!isAuthenticated) return;
    try {
      setGuestDeckCount(await countGuestCardDecks());
    } catch {
      setGuestDeckCount(0);
    }
  }

  const renderBody = () => {
    if (decksQuery.isLoading) {
      return (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CC.textBody14Neutral}
        >
          {BAEKJI_HOME_COPY.loading}
        </YeonText>
      );
    }

    if (decksQuery.isError) {
      return (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CC.textError}
        >
          {BAEKJI_HOME_COPY.loadError}
        </YeonText>
      );
    }

    const loadedDecks = decksQuery.data;
    // 로딩/에러/비로그인을 모두 지난 뒤에는 배열이 확정된다. undefined는 미확정 방어용.
    if (loadedDecks === undefined) {
      return (
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={CC.textBody14Neutral}
        >
          {BAEKJI_HOME_COPY.loading}
        </YeonText>
      );
    }
    if (loadedDecks.length === 0) {
      return isAuthenticated ? (
        <>
          <GuestMigrationNotice
            guestDeckCount={guestDeckCount}
            onOpen={() => setIsGuestMigrationOpen(true)}
          />
          <EmptyState
            title={BAEKJI_HOME_COPY.emptyTitle}
            description={BAEKJI_HOME_COPY.emptyDescription}
            action={BAEKJI_HOME_COPY.emptyAction}
          />
        </>
      ) : (
        <GuestRecallDeckCreator onCreated={setRequestedDeckId} />
      );
    }

    return (
      <>
        {isAuthenticated ? (
          <GuestMigrationNotice
            guestDeckCount={guestDeckCount}
            onOpen={() => setIsGuestMigrationOpen(true)}
          />
        ) : null}
        {!isAuthenticated ? (
          <YeonView className="mb-5">
            <GuestRecallDeckCreator onCreated={setRequestedDeckId} />
          </YeonView>
        ) : null}
        <YeonView className="grid gap-3 sm:grid-cols-2">
          {loadedDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              isSelected={deck.id === selectedDeckId}
              canViewDetails={isAuthenticated}
              onSelect={() => setRequestedDeckId(deck.id)}
            />
          ))}
        </YeonView>
        {!selectedDeckId ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-6 text-[14px] font-semibold text-[#555]"
          >
            {BAEKJI_HOME_COPY.selectPrompt}
          </YeonText>
        ) : isDetailLoading ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className="mt-6 text-[14px] text-[#666]"
          >
            {BAEKJI_HOME_COPY.previewLoading}
          </YeonText>
        ) : hasDetailError || !selectedDetail ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mt-6 ${CC.textError}`}
          >
            {BAEKJI_HOME_COPY.previewError}
          </YeonText>
        ) : (
          <SelectedDeckPreview
            key={selectedDetail.deck.id}
            detail={selectedDetail}
          />
        )}
      </>
    );
  };

  return (
    <YeonView className={C.root}>
      <TypingServiceHeader active="home" title={BAEKJI_HOME_COPY.headerTitle} />

      <YeonView as="main" className={C.main}>
        <YeonView as="section" className={C.introSection}>
          <YeonView className={C.introCopy}>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className={C.introTitle}
            >
              {BAEKJI_HOME_COPY.introTitle}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={C.introDescription}
            >
              {BAEKJI_HOME_COPY.introDescription}
            </YeonText>
          </YeonView>

          <YeonSurface
            as="section"
            className="mt-8 rounded-[20px] border border-[#e5e5e5] bg-white p-4 md:p-6"
          >
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className={C.sectionTitle}
            >
              {BAEKJI_HOME_COPY.deckSectionTitle}
            </YeonText>
            <YeonView className="mt-5">{renderBody()}</YeonView>
          </YeonSurface>
        </YeonView>
      </YeonView>
      {isGuestMigrationOpen && guestDeckCount > 0 ? (
        <MergeGuestDialog
          guestDeckCount={guestDeckCount}
          onClose={() => {
            void closeGuestMigration();
          }}
        />
      ) : null}
    </YeonView>
  );
}
