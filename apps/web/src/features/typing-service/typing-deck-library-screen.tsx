"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import { useYeonRouter } from "@yeon/ui/runtime/YeonNavigation";
import { useEffect, useMemo, useState } from "react";
import {
  YeonButton,
  YeonField,
  YeonText,
  YeonLabel,
  YeonModal,
  YeonView,
  YeonOption,
  YEON_WEB_OVERLAY_CLASS,
  YEON_WEB_SHADOW_CLASS,
  YeonLink,
} from "@yeon/ui";
import { trackEvent } from "@/lib/analytics";
import {
  type TypingDeckDto,
  type TypingDeckLanguageTag,
  type TypingDeckScope,
  useTypingDecks,
} from "./use-typing-decks";
import { TypingDeckForm } from "./typing-deck-components";
import { typingDeckBadge, typingDeckLanguageLabel } from "./typing-deck-meta";
import { TypingServiceHeader } from "./typing-service-header";
import { getTypingUiText, type TypingUiText } from "./typing-service-i18n";
import { useTypingSettings } from "./use-typing-settings";

const ALL_LANGUAGE_FILTER = "all";
const TYPING_DECK_LIBRARY_SCOPES: TypingDeckScope[] = [
  "default",
  "mine",
  "public",
];
const TYPING_DECK_LANGUAGE_FILTERS: TypingDeckLanguageTag[] = [
  "ko",
  "en",
  "mixed",
  "code",
];
type LanguageFilter = TypingDeckLanguageTag | typeof ALL_LANGUAGE_FILTER;

type TypingDeckLibraryScreenProps = {
  showAdminEntry?: boolean;
};

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase();
}

function deckMatchesSearch(
  deck: TypingDeckDto,
  searchText: string,
  labels: TypingUiText["deck"]
) {
  if (!searchText) {
    return true;
  }
  const haystack = [
    deck.title,
    deck.description ?? "",
    typingDeckBadge(deck, labels),
    typingDeckLanguageLabel(deck.languageTag, labels),
  ]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(searchText);
}

function deckMatchesLanguage(deck: TypingDeckDto, language: LanguageFilter) {
  return language === ALL_LANGUAGE_FILTER || deck.languageTag === language;
}

function resolveInitialLanguageFilter(locale: "ko" | "en"): LanguageFilter {
  return locale === "en" ? "en" : ALL_LANGUAGE_FILTER;
}

function DeckLibraryEmptyState({
  hasAnyDecks,
  labels,
  onCreate,
}: {
  hasAnyDecks: boolean;
  labels: TypingUiText["deck"];
  onCreate: () => void;
}) {
  return (
    <YeonView className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-[#e5e5e5] bg-[#fafafa] p-8 text-center">
      <YeonView className="max-w-md">
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`${TYPING_SERVICE_COMMON_CLASS.panelBodyTitle} break-keep tracking-[-0.02em]`}
        >
          {hasAnyDecks ? labels.emptyFilteredList : labels.emptyList}
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`mt-2 break-keep ${TYPING_SERVICE_COMMON_CLASS.textBody14Neutral}`}
        >
          {hasAnyDecks ? labels.emptyFilteredListHelp : labels.emptyListHelp}
        </YeonText>
        <YeonButton
          type="button"
          onClick={onCreate}
          variant="primary"
          size="lg"
          className="mt-5"
        >
          {labels.createDeck}
        </YeonButton>
      </YeonView>
    </YeonView>
  );
}

function DeckLibraryCard({
  deck,
  activeScope,
  labels,
}: {
  deck: TypingDeckDto;
  activeScope: TypingDeckScope;
  labels: TypingUiText["deck"];
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
    <YeonView
      as="article"
      className="group relative flex min-h-[230px] flex-col rounded-3xl border border-[#e5e5e5] bg-white p-5 transition-colors hover:border-[#111]"
    >
      <YeonLink
        href={detailHref}
        aria-label={labels.detailAriaLabel(deck.title)}
        className="absolute inset-0 rounded-3xl"
        onClick={handleDeckOpen}
      />
      <YeonView
        className={`relative z-10 flex flex-wrap items-center gap-2 ${SHARED_FEATURE_CLASS.text12EmphasisNeutral}`}
      >
        {activeScope === "default" ? null : (
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="rounded-full border border-[#e5e5e5] px-2.5 py-1"
          >
            {typingDeckBadge(deck, labels)}
          </YeonText>
        )}
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className="rounded-full border border-[#e5e5e5] px-2.5 py-1"
        >
          {typingDeckLanguageLabel(deck.languageTag, labels)}
        </YeonText>
        {deck.isOwner ? (
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className="rounded-full border border-[#e5e5e5] px-2.5 py-1"
          >
            {labels.ownedDeck}
          </YeonText>
        ) : null}
      </YeonView>

      <YeonView className="mt-5 min-w-0 flex-1">
        <YeonText
          as="h2"
          variant="unstyled"
          tone="inherit"
          className="break-keep text-[20px] font-semibold leading-7 tracking-[-0.03em] text-[#111] group-hover:underline group-hover:decoration-[#e5e5e5] group-hover:underline-offset-4"
        >
          {deck.title}
        </YeonText>
        <YeonText
          as="p"
          variant="unstyled"
          tone="inherit"
          className={`mt-3 line-clamp-2 break-keep ${TYPING_SERVICE_COMMON_CLASS.textBody14Neutral}`}
        >
          {deck.description || labels.noDescriptionPractice}
        </YeonText>
      </YeonView>

      <YeonView className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 pt-2">
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={SHARED_FEATURE_CLASS.text13EmphasisSubtle}
        >
          {labels.passageCount(deck.passageCount ?? 0)}
        </YeonText>
        <YeonLink
          href={practiceHref}
          className={`${SHARED_FEATURE_CLASS.primaryActionButtonMd13} no-underline`}
          onClick={() =>
            trackEvent("typing_practice_select", {
              ...detailParams,
              source: "deck_card_button",
            })
          }
        >
          {labels.practiceNow}
        </YeonLink>
      </YeonView>
    </YeonView>
  );
}

function CreateDeckModal({
  open,
  labels,
  onClose,
}: {
  open: boolean;
  labels: TypingUiText["deck"];
  onClose: () => void;
}) {
  const router = useYeonRouter();

  if (!open) {
    return null;
  }

  return (
    <YeonModal
      visible
      onRequestClose={onClose}
      aria-label={labels.createDeck}
      className={`fixed inset-0 z-50 m-0 flex h-auto max-h-none w-auto max-w-none items-center justify-center border-0 p-0 ${YEON_WEB_OVERLAY_CLASS.scrimSubtle}`}
    >
      <YeonView
        as="section"
        className={`mx-4 w-full max-w-xl rounded-3xl border border-[#e5e5e5] bg-white p-5 ${YEON_WEB_SHADOW_CLASS.modalSoft}`}
      >
        <YeonView
          className={SHARED_FEATURE_CLASS.alignBetweenStartGap3WithMargin4}
        >
          <YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.mutedInfoEmphasis}
            >
              {labels.createModalEyebrow}
            </YeonText>
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-[#111]"
            >
              {labels.createDeck}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={`${SHARED_FEATURE_CLASS.text13Neutral} mt-2 break-keep leading-5`}
            >
              {labels.createModalHelp}
            </YeonText>
          </YeonView>
          <YeonButton
            type="button"
            onClick={onClose}
            variant="secondary"
            size="sm"
            className={`rounded-xl px-3 py-2 ${SHARED_FEATURE_CLASS.text13EmphasisMuted}`}
          >
            {labels.close}
          </YeonButton>
        </YeonView>
        <TypingDeckForm
          mode="create"
          onSaved={(deck) => {
            onClose();
            router.push(`/typing-service/decks/${deck.id}`);
          }}
        />
      </YeonView>
    </YeonModal>
  );
}

export function TypingDeckLibraryScreen({
  showAdminEntry = false,
}: TypingDeckLibraryScreenProps) {
  const { settings } = useTypingSettings();
  const labels = getTypingUiText(settings.locale).deck;
  const [scope, setScope] = useState<TypingDeckScope>("default");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>(() =>
    resolveInitialLanguageFilter(settings.locale)
  );
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const decksQuery = useTypingDecks(scope);
  const decks = decksQuery.data?.decks ?? [];
  const normalizedSearch = normalizeSearchText(search);
  const filteredDecks = useMemo(
    () =>
      decks.filter(
        (deck) =>
          deckMatchesSearch(deck, normalizedSearch, labels) &&
          deckMatchesLanguage(deck, languageFilter)
      ),
    [decks, labels, languageFilter, normalizedSearch]
  );
  const hasFilteredDecks = Boolean(filteredDecks[0]);
  const hasAnyDecks = Boolean(decks[0]);
  useEffect(() => {
    setLanguageFilter(resolveInitialLanguageFilter(settings.locale));
  }, [settings.locale]);

  const openCreateModal = (source: string) => {
    setCreateModalOpen(true);
    trackEvent("typing_deck_create_open", {
      source,
      scope,
      language_filter: languageFilter,
    });
  };

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <TypingServiceHeader
        active="decks"
        title={labels.title}
        controls={
          <>
            {showAdminEntry ? (
              <YeonLink
                href="/admin/typing-decks"
                className={`rounded-xl border border-[#e5e5e5] px-4 py-2 ${SHARED_FEATURE_CLASS.text13Emphasis} no-underline transition-colors hover:border-[#111]`}
              >
                {labels.adminEntry}
              </YeonLink>
            ) : null}
            <YeonButton
              type="button"
              onClick={() => openCreateModal("header")}
              variant="primary"
              size="md"
            >
              {labels.createDeck}
            </YeonButton>
          </>
        }
      />

      <YeonView as="main" className="px-6 py-10 md:px-10">
        <YeonView
          as="section"
          className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.mutedInfoEmphasis}
            >
              {labels.libraryEyebrow}
            </YeonText>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className={`${SHARED_FEATURE_CLASS.text34Emphasis} mt-1 tracking-[-0.04em] md:text-[42px]`}
            >
              {labels.libraryTitle}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-3 max-w-[680px] break-keep text-[15px] leading-7 text-[#666]"
            >
              {labels.libraryDescription}
            </YeonText>
          </YeonView>
          <YeonView className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:flex md:flex-wrap">
            <YeonButton
              type="button"
              onClick={() => openCreateModal("hero")}
              variant="primary"
              size="lg"
              className="text-center"
            >
              {labels.createDeck}
            </YeonButton>
            <YeonLink
              href="/typing-service"
              className={`${TYPING_SERVICE_COMMON_CLASS.panelGhostButton} text-center`}
            >
              {labels.homeLink}
            </YeonLink>
            <YeonLink
              href="/typing-service/practice"
              className={`${TYPING_SERVICE_COMMON_CLASS.panelGhostButton} text-center`}
              onClick={() =>
                trackEvent("typing_practice_select", {
                  source: "library_hero",
                  deck_scope: scope,
                })
              }
            >
              {labels.practiceLink}
            </YeonLink>
          </YeonView>
        </YeonView>

        <YeonView
          as="section"
          className="mt-8 rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-4 md:p-5"
        >
          <YeonView className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <YeonLabel className="flex min-h-[48px] items-center rounded-2xl border border-[#e5e5e5] bg-white px-4">
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="sr-only"
              >
                {labels.searchLabel}
              </YeonText>
              <YeonField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={labels.searchPlaceholder}
                className={`${SHARED_FEATURE_CLASS.text15Primary} border-0 bg-transparent p-0 placeholder:text-[#aaa] focus:border-transparent`}
              />
            </YeonLabel>
            <YeonLabel className="flex min-h-[48px] items-center rounded-2xl border border-[#e5e5e5] bg-white px-4">
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="sr-only"
              >
                {labels.languageFilter}
              </YeonText>
              <YeonField
                as="select"
                value={languageFilter}
                onChange={(event) =>
                  setLanguageFilter(event.target.value as LanguageFilter)
                }
                className="border-0 bg-transparent p-0 text-[14px] font-semibold focus:border-transparent"
              >
                <YeonOption value={ALL_LANGUAGE_FILTER}>
                  {labels.allLanguages}
                </YeonOption>
                {TYPING_DECK_LANGUAGE_FILTERS.map((language) => (
                  <YeonOption key={language} value={language}>
                    {labels.language[language]}
                  </YeonOption>
                ))}
              </YeonField>
            </YeonLabel>
          </YeonView>

          <YeonView className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <YeonView
              role="tablist"
              aria-label={labels.scopeAriaLabel}
              className="inline-flex flex-wrap gap-1 rounded-2xl border border-[#e5e5e5] bg-white p-1"
            >
              {TYPING_DECK_LIBRARY_SCOPES.map((scopeValue) => (
                <YeonButton
                  key={scopeValue}
                  type="button"
                  role="tab"
                  aria-selected={scope === scopeValue}
                  onClick={() => setScope(scopeValue)}
                  variant={scope === scopeValue ? "primary" : "ghost"}
                  size="md"
                  className="min-h-11 rounded-xl px-4 py-2 text-[13px]"
                >
                  {scopeValue === "default"
                    ? labels.defaultScope
                    : scopeValue === "mine"
                      ? labels.mineScope
                      : labels.publicScope}
                </YeonButton>
              ))}
            </YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={SHARED_FEATURE_CLASS.text13Neutral}
            >
              {decksQuery.isSuccess
                ? filteredDecks.length === decks.length
                  ? labels.totalCount(decks.length)
                  : labels.filteredCount(decks.length, filteredDecks.length)
                : labels.loadingCount}
            </YeonText>
          </YeonView>
        </YeonView>

        <YeonView as="section" className="mt-8">
          {decksQuery.isPending ? (
            <YeonView className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <YeonView
                  key={index}
                  className="h-[230px] rounded-3xl border border-[#e5e5e5] bg-[#fafafa]"
                />
              ))}
            </YeonView>
          ) : null}
          {decksQuery.isError ? (
            <YeonText
              as="p"
              variant="body"
              tone="primary"
              className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-8 text-[14px] font-semibold"
            >
              {labels.listErrorLong}
            </YeonText>
          ) : null}
          {decksQuery.isSuccess && hasFilteredDecks ? (
            <YeonView className="grid gap-4 md:grid-cols-2">
              {filteredDecks.map((deck) => (
                <DeckLibraryCard
                  key={deck.id}
                  deck={deck}
                  activeScope={scope}
                  labels={labels}
                />
              ))}
            </YeonView>
          ) : null}
          {decksQuery.isSuccess && !hasFilteredDecks ? (
            <DeckLibraryEmptyState
              hasAnyDecks={hasAnyDecks}
              labels={labels}
              onCreate={() => openCreateModal("empty_state")}
            />
          ) : null}
        </YeonView>
      </YeonView>

      <CreateDeckModal
        open={createModalOpen}
        labels={labels}
        onClose={() => setCreateModalOpen(false)}
      />
    </YeonView>
  );
}
