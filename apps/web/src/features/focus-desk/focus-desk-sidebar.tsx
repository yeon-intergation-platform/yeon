import { BookOpen, CheckCircle2, Timer } from "lucide-react";
import type { ReactElement } from "react";
import type { CardDeckDto } from "@yeon/api-contract/card-decks";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import {
  YeonButton,
  YeonLink,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { CARD_SERVICE_COMMON_CLASS } from "@/features/card-service/card-service-common.const";
import { formatRemainingSeconds } from "./focus-desk-format";
import {
  FOCUS_DESK_MODE_OPTIONS,
  getFocusDeskModeLabel,
} from "./focus-desk-mode-options";
import {
  type FocusDeskMode,
  type FocusDeskReviewStats,
  type FocusDeskSessionStatus,
} from "./focus-desk-session";

function DeckOptionCard({
  deck,
  disabled,
  selected,
  onSelect,
}: {
  deck: CardDeckDto;
  disabled: boolean;
  selected: boolean;
  onSelect: (deckId: string) => void;
}): ReactElement {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={() => onSelect(deck.id)}
      className={`rounded-lg border bg-white p-4 text-left transition-colors hover:border-[#111] disabled:cursor-not-allowed disabled:opacity-60 ${
        selected ? "border-[#111]" : "border-[#e5e5e5]"
      }`}
    >
      <YeonView className="flex items-start justify-between gap-3">
        <YeonView className="min-w-0">
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="block truncate text-[15px] font-bold text-[#111]"
          >
            {deck.title}
          </YeonText>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="mt-2 block text-[12px] font-medium text-[#666]"
          >
            카드 {deck.itemCount}장
          </YeonText>
        </YeonView>
        {selected ? <CheckCircle2 aria-hidden="true" size={18} /> : null}
      </YeonView>
    </button>
  );
}

function RunningSessionPanel({
  mode,
  queueLength,
  remainingSeconds,
  selectedDeck,
  stats,
  onFinish,
}: {
  mode: FocusDeskMode;
  queueLength: number;
  remainingSeconds: number;
  selectedDeck: CardDeckDto | null;
  stats: FocusDeskReviewStats;
  onFinish: () => void;
}): ReactElement {
  const completedCount = Math.min(stats.reviewed + stats.skipped, queueLength);
  const progressPercent =
    queueLength === 0 ? 0 : Math.round((completedCount / queueLength) * 100);

  return (
    <YeonSurface className="border-[#111] p-5">
      <YeonView className="flex items-start justify-between gap-3">
        <YeonView className="min-w-0">
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={SHARED_FEATURE_CLASS.text12Soft}
          >
            집중 작업 중
          </YeonText>
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="mt-1 break-words text-[17px] font-black text-[#111]"
          >
            {selectedDeck?.title ?? "선택한 덱"}
          </YeonText>
        </YeonView>
        <Timer aria-hidden="true" size={20} />
      </YeonView>

      <YeonText
        as="strong"
        variant="unstyled"
        tone="inherit"
        className="mt-5 block text-[42px] font-black leading-none text-[#111]"
      >
        {formatRemainingSeconds(remainingSeconds)}
      </YeonText>
      <YeonView
        aria-hidden="true"
        className="mt-5 h-2 overflow-hidden rounded-full bg-[#eee]"
      >
        <YeonView
          className="h-full rounded-full bg-[#111]"
          style={{ width: `${progressPercent}%` }}
        />
      </YeonView>
      <YeonView className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["큐", `${completedCount}/${queueLength}`],
          ["모드", getFocusDeskModeLabel(mode)],
          ["채점", `${stats.reviewed}장`],
        ].map(([label, value]) => (
          <YeonView
            key={label}
            className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3"
          >
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text12Soft}
            >
              {label}
            </YeonText>
            <YeonText
              as="strong"
              variant="unstyled"
              tone="inherit"
              className="mt-1 block truncate text-[13px] font-black text-[#111]"
            >
              {value}
            </YeonText>
          </YeonView>
        ))}
      </YeonView>
      <YeonButton
        type="button"
        variant="secondary"
        onClick={onFinish}
        className="mt-4 w-full px-4 py-3 text-[13px]"
      >
        세션 종료하고 요약 보기
      </YeonButton>
    </YeonSurface>
  );
}

export function FocusDeskSidebar({
  decks,
  hasDecks,
  isDeckListError,
  isDeckListPending,
  mode,
  queueLength,
  remainingSeconds,
  selectedDeck,
  selectedDeckId,
  sessionStatus,
  stats,
  onDeckSelect,
  onFinish,
  onModeSelect,
}: {
  decks: CardDeckDto[];
  hasDecks: boolean;
  isDeckListError: boolean;
  isDeckListPending: boolean;
  mode: FocusDeskMode;
  queueLength: number;
  remainingSeconds: number;
  selectedDeck: CardDeckDto | null;
  selectedDeckId: string | null;
  sessionStatus: FocusDeskSessionStatus;
  stats: FocusDeskReviewStats;
  onDeckSelect: (deckId: string) => void;
  onFinish: () => void;
  onModeSelect: (mode: FocusDeskMode) => void;
}): ReactElement {
  if (sessionStatus === "running") {
    return (
      <RunningSessionPanel
        mode={mode}
        queueLength={queueLength}
        remainingSeconds={remainingSeconds}
        selectedDeck={selectedDeck}
        stats={stats}
        onFinish={onFinish}
      />
    );
  }

  return (
    <>
      <YeonSurface className="border-[#e5e5e5] p-5">
        <YeonView className="flex items-center justify-between gap-3">
          <YeonText
            as="h2"
            variant="unstyled"
            tone="inherit"
            className="text-[16px] font-black text-[#111]"
          >
            학습할 덱
          </YeonText>
          <BookOpen aria-hidden="true" size={18} />
        </YeonView>

        {isDeckListPending ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mt-4 ${SHARED_FEATURE_CLASS.text13Soft}`}
          >
            덱을 불러오는 중...
          </YeonText>
        ) : null}

        {isDeckListError ? (
          <YeonText
            as="p"
            variant="unstyled"
            tone="inherit"
            className={`mt-4 ${CARD_SERVICE_COMMON_CLASS.errorTextSm}`}
          >
            덱 목록을 불러오지 못했습니다.
          </YeonText>
        ) : null}

        {!isDeckListPending && !hasDecks ? (
          <YeonView className="mt-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text13Emphasis}
            >
              아직 학습할 덱이 없습니다.
            </YeonText>
            <YeonLink
              href={resolveYeonWebPath("cardDeckList")}
              className="mt-3 inline-flex rounded-lg bg-[#111] px-4 py-2 text-[13px] font-bold text-white no-underline"
            >
              덱 만들러 가기
            </YeonLink>
          </YeonView>
        ) : null}

        <YeonView className="mt-4 grid gap-3">
          {decks.map((deck) => (
            <DeckOptionCard
              key={deck.id}
              deck={deck}
              disabled={false}
              selected={deck.id === selectedDeckId}
              onSelect={onDeckSelect}
            />
          ))}
        </YeonView>
      </YeonSurface>

      <YeonSurface className="border-[#e5e5e5] p-5">
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className="text-[16px] font-black text-[#111]"
        >
          세션 모드
        </YeonText>
        <YeonView className="mt-4 grid gap-2">
          {FOCUS_DESK_MODE_OPTIONS.map((option) => (
            <button
              key={option.mode}
              type="button"
              aria-pressed={mode === option.mode}
              disabled={false}
              onClick={() => onModeSelect(option.mode)}
              className={`rounded-lg border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                mode === option.mode
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]"
              }`}
            >
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="block text-[14px] font-bold"
              >
                {option.label}
              </YeonText>
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className={`mt-1 block text-[12px] ${
                  mode === option.mode ? "text-white/75" : "text-[#666]"
                }`}
              >
                {option.description}
              </YeonText>
            </button>
          ))}
        </YeonView>
      </YeonSurface>
    </>
  );
}
