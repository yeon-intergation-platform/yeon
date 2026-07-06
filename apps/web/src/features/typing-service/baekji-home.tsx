"use client";
import { YeonIcon, YeonLink, YeonSurface, YeonText, YeonView } from "@yeon/ui";
import { useYeonQuery } from "@yeon/ui/runtime/YeonQuery";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import { listServerCardDecksOrNull } from "../card-service/card-service-fetch";
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
} as const;

const CARD_DECKS_HREF = "/card-service/decks";

function sessionHref(deckId: string) {
  return `/recall-service/session?deckId=${encodeURIComponent(deckId)}`;
}

function deckDetailHref(deckId: string) {
  return `/card-service/decks/${encodeURIComponent(deckId)}`;
}

function DeckCard({ deck }: { deck: CardDeckDto }) {
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
        <YeonLink
          href={sessionHref(deck.id)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#111] px-4 py-2.5 text-[14px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
        >
          {BAEKJI_HOME_COPY.startAction}
          <YeonIcon name="chevron-right" size={16} aria-hidden="true" />
        </YeonLink>
        <YeonLink
          href={deckDetailHref(deck.id)}
          className={CC.panelGhostButton}
        >
          {BAEKJI_HOME_COPY.viewAction}
        </YeonLink>
      </YeonView>
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

export function BaekjiHome() {
  const decksQuery = useYeonQuery({
    queryKey: ["recall", "card-decks"],
    queryFn: () => listServerCardDecksOrNull(),
  });

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

    // null = 비로그인. listServerCardDecksOrNull이 401에서 null을 반환한다.
    if (decksQuery.data === null) {
      return (
        <EmptyState
          title={BAEKJI_HOME_COPY.loginTitle}
          description={BAEKJI_HOME_COPY.loginDescription}
          action={BAEKJI_HOME_COPY.loginAction}
        />
      );
    }

    const decks = decksQuery.data;
    // 로딩/에러/비로그인을 모두 지난 뒤에는 배열이 확정된다. undefined는 미확정 방어용.
    if (decks === undefined) {
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
    if (decks.length === 0) {
      return (
        <EmptyState
          title={BAEKJI_HOME_COPY.emptyTitle}
          description={BAEKJI_HOME_COPY.emptyDescription}
          action={BAEKJI_HOME_COPY.emptyAction}
        />
      );
    }

    return (
      <YeonView className="grid gap-3 sm:grid-cols-2">
        {decks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} />
        ))}
      </YeonView>
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
    </YeonView>
  );
}
