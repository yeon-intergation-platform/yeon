"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
        <p className="text-[18px] font-semibold tracking-[-0.02em] text-[#111]">
          {hasAnyDecks ? "조건에 맞는 덱이 없습니다." : "아직 덱이 없습니다."}
        </p>
        <p className="mt-2 text-[14px] leading-6 text-[#666]">
          {hasAnyDecks
            ? "검색어나 필터를 줄이면 더 많은 연습 덱을 볼 수 있습니다."
            : "내가 자주 연습할 문장 묶음을 만들고 바로 연습을 시작하세요."}
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 rounded-xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#333]"
        >
          새 덱 만들기
        </button>
      </div>
    </div>
  );
}

function DeckLibraryCard({ deck }: { deck: TypingDeckDto }) {
  const detailHref = `/typing-service/decks/${deck.id}`;
  const practiceHref = `/typing-service/practice?deckId=${encodeURIComponent(deck.id)}`;

  return (
    <article className="group relative flex min-h-[230px] flex-col rounded-3xl border border-[#e5e5e5] bg-white p-5 transition-colors hover:border-[#111]">
      <Link
        href={detailHref}
        aria-label={`${deck.title} 자세히 보기`}
        className="absolute inset-0 rounded-3xl"
      />
      <div className="relative z-10 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#666]">
        <span className="rounded-full bg-[#f3f3f3] px-2.5 py-1">
          {typingDeckBadge(deck)}
        </span>
        <span className="rounded-full border border-[#e8e8e8] px-2.5 py-1">
          {typingDeckLanguageLabel(deck.languageTag)}
        </span>
        {deck.isOwner ? (
          <span className="rounded-full border border-[#e8e8e8] px-2.5 py-1">
            내 덱
          </span>
        ) : null}
      </div>

      <div className="mt-5 min-w-0 flex-1">
        <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[#111] group-hover:underline group-hover:decoration-[#d8d8d8] group-hover:underline-offset-4">
          {deck.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-[14px] leading-6 text-[#666]">
          {deck.description ||
            "설명이 없는 덱입니다. 문단 구성을 확인하고 바로 연습해보세요."}
        </p>
      </div>

      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#efefef] pt-4">
        <span className="text-[13px] font-semibold text-[#777]">
          문단 {deck.passageCount ?? 0}개
        </span>
        <div className="flex flex-wrap gap-2">
          <Link
            href={detailHref}
            className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-[13px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111]"
          >
            자세히 보기
          </Link>
          <Link
            href={practiceHref}
            className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#333]"
          >
            연습하기
          </Link>
        </div>
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
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-[#888]">내 덱</p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-[#111]">
              새 덱 만들기
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-[#666]">
              제목과 언어만 먼저 정해도 됩니다. 문단 관리는 생성 후 상세
              화면에서 이어집니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e5e5e5] px-3 py-2 text-[13px] font-semibold text-[#666] transition-colors hover:border-[#111] hover:text-[#111]"
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
          deckMatchesLanguage(deck, languageFilter),
      ),
    [decks, languageFilter, normalizedSearch],
  );
  const hasFilteredDecks = Boolean(filteredDecks[0]);
  const hasAnyDecks = Boolean(decks[0]);

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <TypingServiceHeader
        active="decks"
        title="YEON 연습덱"
        controls={
          <>
            {showAdminEntry ? (
              <Link
                href="/admin/typing-decks"
                className="rounded-xl border border-[#e5e5e5] px-4 py-2 text-[13px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111]"
              >
                관리자
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#333]"
            >
              새 덱 만들기
            </button>
          </>
        }
      />

      <main className="px-6 py-10 md:px-10">
        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#888]">
              덱 라이브러리
            </p>
            <h1 className="mt-1 text-[34px] font-semibold tracking-[-0.04em] text-[#111] md:text-[42px]">
              연습할 덱을 고르세요
            </h1>
            <p className="mt-3 max-w-[680px] text-[15px] leading-7 text-[#666]">
              기본 덱, 내 덱, 공개 덱을 한 곳에서 찾고 바로 연습으로 이동합니다.
              문단 편집은 덱 상세 화면에서 이어집니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="rounded-xl bg-[#111] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#333]"
            >
              새 덱 만들기
            </button>
            <Link
              href="/typing-service"
              className="rounded-xl border border-[#e5e5e5] bg-white px-5 py-3 text-[14px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111]"
            >
              타자연습 홈으로
            </Link>
            <Link
              href="/typing-service/practice"
              className="rounded-xl border border-[#e5e5e5] bg-white px-5 py-3 text-[14px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111]"
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
                className="w-full bg-transparent text-[15px] text-[#111] outline-none placeholder:text-[#999]"
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
            <div className="flex flex-wrap gap-2">
              {TYPING_DECK_SCOPE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setScope(tab.value)}
                  className={`min-h-11 rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors ${
                    scope === tab.value
                      ? "bg-[#111] text-white"
                      : "border border-[#e5e5e5] bg-white text-[#666] hover:border-[#111] hover:text-[#111]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="text-[13px] text-[#777]">
              {decksQuery.isSuccess
                ? `${filteredDecks.length}개 표시 · 전체 ${decks.length}개`
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
                <DeckLibraryCard key={deck.id} deck={deck} />
              ))}
            </div>
          ) : null}
          {decksQuery.isSuccess && !hasFilteredDecks ? (
            <DeckLibraryEmptyState
              hasAnyDecks={hasAnyDecks}
              onCreate={() => setCreateModalOpen(true)}
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
