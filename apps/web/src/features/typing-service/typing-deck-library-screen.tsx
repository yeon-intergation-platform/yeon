"use client";

import { SHARED_FEATURE_CLASS } from "@/features/shared-style-constants";

import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  TYPING_DECK_LANGUAGE_OPTIONS,
  type TypingDeckDto,
  type TypingDeckLanguageTag,
  type TypingDeckScope,
  useTypingDecks,
} from "./use-typing-decks";
import {
  TYPING_DECK_SCOPE_TABS,
  TypingDeckForm,
  typingDeckBadge,
  typingDeckLanguageLabel,
} from "./typing-decks-screen";
import { TypingServiceHeader } from "./typing-service-header";

const ALL_LANGUAGE_FILTER = "all";
type LanguageFilter = TypingDeckLanguageTag | typeof ALL_LANGUAGE_FILTER;

type TypingDeckLibraryScreenProps = {
  showAdminEntry?: boolean;
};

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase();
}

function deckMatchesSearch(deck: TypingDeckDto, searchText: string) {
  if (!searchText) {
    return true;
  }
  const haystack = [
    deck.title,
    deck.description ?? "",
    typingDeckBadge(deck),
    typingDeckLanguageLabel(deck.languageTag),
  ]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(searchText);
}

function deckMatchesLanguage(deck: TypingDeckDto, language: LanguageFilter) {
  return language === ALL_LANGUAGE_FILTER || deck.languageTag === language;
}

function DeckLibraryEmptyState({
  hasAnyDecks,
  onCreate,
}: {
  hasAnyDecks: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-[#dcdcdc] bg-[#fafafa] p-8 text-center">
      <div className="max-w-md">
        <p
          className={`${TYPING_SERVICE_COMMON_CLASS.panelBodyTitle} break-keep tracking-[-0.02em]`}
        >
          {hasAnyDecks ? "조건에 맞는 덱이 없습니다." : "아직 덱이 없습니다."}
        </p>
        <p
          className={`mt-2 break-keep ${TYPING_SERVICE_COMMON_CLASS.textBody14Neutral}`}
        >
          {hasAnyDecks
            ? "검색어나 필터를 줄이면 더 많은 연습 덱을 볼 수 있습니다."
            : "내가 자주 연습할 문장 묶음을 만들고 바로 연습을 시작하세요."}
        </p>
        <button
          type="button"
          onClick={onCreate}
          className={`mt-5 ${SHARED_FEATURE_CLASS.primaryActionButtonMd14}`}
        >
          새 덱 만들기
        </button>
      </div>
    </div>
  );
}

function DeckLibraryCard({
  deck,
  activeScope,
}: {
  deck: TypingDeckDto;
  activeScope: TypingDeckScope;
}) {
  const detailHref = `/typing-service/decks/${deck.id}`;
  const practiceHref = `/typing-service/practice?deckId=${encodeURIComponent(deck.id)}`;
  const detailParams = {
    deck_id: deck.id,
    deck_source: deck.source,
    deck_visibility: deck.visibility,
    language_tag: deck.languageTag,
  };

  function handleDeckOpen() {
    trackEvent("deck_open", {
      source: "typing_deck_library",
      deck_id: deck.id,
      deck_title: deck.title,
      deck_source: deck.source,
      deck_visibility: deck.visibility,
      deck_language: deck.languageTag,
    });
  }

  return (
    <article className="group relative flex min-h-[230px] flex-col rounded-3xl border border-[#e5e5e5] bg-white p-5 transition-colors hover:border-[#111]">
      <Link
        href={detailHref}
        aria-label={`${deck.title} 자세히 보기`}
        className="absolute inset-0 rounded-3xl"
        onClick={handleDeckOpen}
      />
      <div
        className={`relative z-10 flex flex-wrap items-center gap-2 ${SHARED_FEATURE_CLASS.text12EmphasisNeutral}`}
      >
        {activeScope === "default" ? null : (
          <span className="rounded-full border border-[#e5e5e5] px-2.5 py-1">
            {typingDeckBadge(deck)}
          </span>
        )}
        <span className="rounded-full border border-[#e5e5e5] px-2.5 py-1">
          {typingDeckLanguageLabel(deck.languageTag)}
        </span>
        {deck.isOwner ? (
          <span className="rounded-full border border-[#e5e5e5] px-2.5 py-1">
            내 덱
          </span>
        ) : null}
      </div>

      <div className="mt-5 min-w-0 flex-1">
        <h2 className="break-keep text-[20px] font-semibold leading-7 tracking-[-0.03em] text-[#111] group-hover:underline group-hover:decoration-[#d8d8d8] group-hover:underline-offset-4">
          {deck.title}
        </h2>
        <p
          className={`mt-3 line-clamp-2 break-keep ${TYPING_SERVICE_COMMON_CLASS.textBody14Neutral}`}
        >
          {deck.description ||
            "설명이 없는 덱입니다. 문단 구성을 확인하고 바로 연습해보세요."}
        </p>
      </div>

      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 pt-2">
        <span className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}>
          문단 {deck.passageCount ?? 0}개
        </span>
        <Link
          href={practiceHref}
          className={`${SHARED_FEATURE_CLASS.primaryActionButtonMd13} no-underline`}
          onClick={() =>
            trackEvent("typing_practice_select", {
              ...detailParams,
              source: "deck_card_button",
            })
          }
        >
          연습하기
        </Link>
      </div>
    </article>
  );
}

function CreateDeckModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-8">
      <section className="w-full max-w-xl rounded-3xl border border-[#e5e5e5] bg-white p-5 shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
        <div className={SHARED_FEATURE_CLASS.alignBetweenStartGap3WithMargin4}>
          <div>
            <p className={TYPING_SERVICE_COMMON_CLASS.mutedInfoEmphasis}>
              내 덱
            </p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-[#111]">
              새 덱 만들기
            </h2>
            <p
              className={`${SHARED_FEATURE_CLASS.text13Neutral} mt-2 break-keep leading-5`}
            >
              제목과 언어만 정하면 시작할 수 있어요. 문단은 만든 뒤 이어서
              채웁니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border border-[#e5e5e5] px-3 py-2 ${SHARED_FEATURE_CLASS.text13EmphasisMuted} transition-colors hover:border-[#111] hover:text-[#111]`}
          >
            닫기
          </button>
        </div>
        <TypingDeckForm
          mode="create"
          onSaved={(deck) => {
            onClose();
            router.push(`/typing-service/decks/${deck.id}`);
          }}
        />
      </section>
    </div>
  );
}

export function TypingDeckLibraryScreen({
  showAdminEntry = false,
}: TypingDeckLibraryScreenProps) {
  const [scope, setScope] = useState<TypingDeckScope>("default");
  const [languageFilter, setLanguageFilter] =
    useState<LanguageFilter>(ALL_LANGUAGE_FILTER);
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const decksQuery = useTypingDecks(scope);
  const decks = decksQuery.data?.decks ?? [];
  const normalizedSearch = normalizeSearchText(search);
  const filteredDecks = useMemo(
    () =>
      decks.filter(
        (deck) =>
          deckMatchesSearch(deck, normalizedSearch) &&
          deckMatchesLanguage(deck, languageFilter)
      ),
    [decks, languageFilter, normalizedSearch]
  );
  const hasFilteredDecks = Boolean(filteredDecks[0]);
  const hasAnyDecks = Boolean(decks[0]);
  const openCreateModal = (source: string) => {
    setCreateModalOpen(true);
    trackEvent("typing_deck_create_open", {
      source,
      scope,
      language_filter: languageFilter,
    });
  };

  return (
    <div className={SHARED_FEATURE_CLASS.pageSurface}>
      <TypingServiceHeader
        active="decks"
        title="YEON 연습덱"
        controls={
          <>
            {showAdminEntry ? (
              <Link
                href="/admin/typing-decks"
                className={`rounded-xl border border-[#e5e5e5] px-4 py-2 ${SHARED_FEATURE_CLASS.text13Emphasis} no-underline transition-colors hover:border-[#111]`}
              >
                관리자
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => openCreateModal("header")}
              className={SHARED_FEATURE_CLASS.primaryActionButtonMd13}
            >
              새 덱 만들기
            </button>
          </>
        }
      />

      <main className="px-6 py-10 md:px-10">
        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={TYPING_SERVICE_COMMON_CLASS.mutedInfoEmphasis}>
              덱 라이브러리
            </p>
            <h1
              className={`${SHARED_FEATURE_CLASS.text34Emphasis} mt-1 tracking-[-0.04em] md:text-[42px]`}
            >
              연습할 덱을 고르세요
            </h1>
            <p className="mt-3 max-w-[680px] break-keep text-[15px] leading-7 text-[#666]">
              기본 덱, 내 덱, 공개 덱을 한 곳에서 찾아 바로 연습하세요.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:flex md:flex-wrap">
            <button
              type="button"
              onClick={() => openCreateModal("hero")}
              className={`${SHARED_FEATURE_CLASS.primaryActionButtonMd14} text-center`}
            >
              새 덱 만들기
            </button>
            <Link
              href="/typing-service"
              className={`${TYPING_SERVICE_COMMON_CLASS.panelGhostButton} text-center`}
            >
              타자연습 홈으로
            </Link>
            <Link
              href="/typing-service/practice"
              className={`${TYPING_SERVICE_COMMON_CLASS.panelGhostButton} text-center`}
              onClick={() =>
                trackEvent("typing_practice_select", {
                  source: "library_hero",
                  deck_scope: scope,
                })
              }
            >
              자유 연습으로 이동
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-4 md:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <label className="flex min-h-[48px] items-center rounded-2xl border border-[#e5e5e5] bg-white px-4">
              <span className="sr-only">덱 검색</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="덱 제목, 설명, 언어로 검색"
                className={`${SHARED_FEATURE_CLASS.text15Primary} w-full bg-transparent outline-none placeholder:text-[#999]`}
              />
            </label>
            <label className="flex min-h-[48px] items-center rounded-2xl border border-[#e5e5e5] bg-white px-4">
              <span className="sr-only">언어 필터</span>
              <select
                value={languageFilter}
                onChange={(event) =>
                  setLanguageFilter(event.target.value as LanguageFilter)
                }
                className="w-full bg-transparent text-[14px] font-semibold text-[#111] outline-none"
              >
                <option value={ALL_LANGUAGE_FILTER}>모든 언어</option>
                {TYPING_DECK_LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div
              role="tablist"
              aria-label="덱 범위"
              className="inline-flex flex-wrap gap-1 rounded-2xl border border-[#e5e5e5] bg-white p-1"
            >
              {TYPING_DECK_SCOPE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={scope === tab.value}
                  onClick={() => setScope(tab.value)}
                  className={`min-h-11 rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors ${
                    scope === tab.value
                      ? "bg-[#111] text-white"
                      : "text-[#666] hover:bg-[#fafafa] hover:text-[#111]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className={SHARED_FEATURE_CLASS.text13Neutral}>
              {decksQuery.isSuccess
                ? filteredDecks.length === decks.length
                  ? `총 ${decks.length}개`
                  : `전체 ${decks.length}개 중 ${filteredDecks.length}개 표시`
                : "덱 목록을 불러오는 중"}
            </p>
          </div>
        </section>

        <section className="mt-8">
          {decksQuery.isPending ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[230px] rounded-3xl border border-[#e5e5e5] bg-[#fafafa]"
                />
              ))}
            </div>
          ) : null}
          {decksQuery.isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-[14px] font-semibold text-red-700">
              덱 목록을 불러오지 못했습니다. 잠시 뒤 다시 시도해주세요.
            </div>
          ) : null}
          {decksQuery.isSuccess && hasFilteredDecks ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredDecks.map((deck) => (
                <DeckLibraryCard
                  key={deck.id}
                  deck={deck}
                  activeScope={scope}
                />
              ))}
            </div>
          ) : null}
          {decksQuery.isSuccess && !hasFilteredDecks ? (
            <DeckLibraryEmptyState
              hasAnyDecks={hasAnyDecks}
              onCreate={() => openCreateModal("empty_state")}
            />
          ) : null}
        </section>
      </main>

      <CreateDeckModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
