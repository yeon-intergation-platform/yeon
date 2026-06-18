"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import { useState } from "react";
import { YeonButton, YeonSurface, YeonView, YeonText } from "@yeon/ui";
import {
  type TypingDeckDto,
  type TypingDeckScope,
  useTypingDecks,
} from "./use-typing-decks";
import {
  TypingDeckDetailPanel,
  TypingDeckForm,
  TypingDeckList,
} from "./typing-deck-components";
import { TypingServiceHeader } from "./typing-service-header";
import { getTypingUiText } from "./typing-service-i18n";
import { useTypingSettings } from "./use-typing-settings";

export {
  TYPING_DECK_SCOPE_TABS,
  TypingDeckBulkPassageImportForm,
  TypingDeckDetailPanel,
  TypingDeckForm,
  TypingDeckList,
  TypingDeckPassageEditor,
  TypingDeckPassageList,
  typingDeckBadge,
  typingDeckLanguageLabel,
  typingDeckVisibilityLabel,
  type TypingDeckBulkPassageImportFormProps,
  type TypingDeckFormProps,
  type TypingDeckListProps,
  type TypingDeckPassageEditorProps,
  type TypingDeckPassageListProps,
  type TypingDeckDetailPanelProps,
  type TypingDeckScopeTab,
} from "./typing-deck-components";

export function TypingDecksScreen({
  adminMode = false,
  showAdminEntry = false,
}: {
  adminMode?: boolean;
  showAdminEntry?: boolean;
}) {
  const { settings } = useTypingSettings();
  const deckText = getTypingUiText(settings.locale).deck;
  const baseScopeTabs = [
    {
      value: "default" as TypingDeckScope,
      label: deckText.defaultScope,
      help: deckText.defaultScopeHelp,
    },
    {
      value: "mine" as TypingDeckScope,
      label: deckText.mineScope,
      help: deckText.mineScopeHelp,
    },
    {
      value: "public" as TypingDeckScope,
      label: deckText.publicScope,
      help: deckText.publicScopeHelp,
    },
  ];
  const scopeTabs = adminMode
    ? [
        ...baseScopeTabs,
        {
          value: "all" as TypingDeckScope,
          label: deckText.allScope,
          help: deckText.allScopeHelp,
        },
      ]
    : baseScopeTabs;
  const [scope, setScope] = useState<TypingDeckScope>(
    adminMode ? "all" : "default"
  );
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(!adminMode);
  const decksQuery = useTypingDecks(scope, adminMode);
  const decks = decksQuery.data?.decks ?? [];

  function handleCreated(deck: TypingDeckDto) {
    setScope("mine");
    setSelectedDeckId(deck.id);
    setIsCreateFormOpen(!adminMode);
  }

  return (
    <YeonView
      className={
        adminMode ? "bg-white text-[#111]" : SHARED_FEATURE_CLASS.pageSurface
      }
    >
      {!adminMode ? (
        <TypingServiceHeader
          active="decks"
          title={deckText.title}
          controls={
            <YeonView className="flex items-center justify-end gap-2">
              {showAdminEntry ? (
                <YeonButton as="a" href="/admin/typing-decks" variant="primary">
                  {deckText.adminEntry}
                </YeonButton>
              ) : null}
              <YeonButton as="a" href="/typing-service/rooms">
                {deckText.roomsLink}
              </YeonButton>
            </YeonView>
          }
        />
      ) : null}

      <YeonView
        as="main"
        className={`mx-auto max-w-[1400px] px-6 md:px-12 ${
          adminMode ? "py-8" : "py-10"
        }`}
      >
        <YeonView className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={TYPING_SERVICE_COMMON_CLASS.mutedInfoEmphasis}
            >
              {adminMode ? deckText.adminEyebrow : deckText.eyebrow}
            </YeonText>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="mt-1 break-keep text-[28px] font-semibold tracking-[-0.03em] text-[#111]"
            >
              {adminMode ? deckText.adminTitle : deckText.title}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={`mt-2 max-w-[720px] break-keep ${SHARED_FEATURE_CLASS.text14Neutral} leading-6`}
            >
              {adminMode ? deckText.adminSubtitle : deckText.subtitle}
            </YeonText>
          </YeonView>
        </YeonView>

        <YeonView className="mt-8 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
          <YeonView as="aside" className="space-y-5 lg:sticky lg:top-5">
            <YeonSurface className="p-4">
              <YeonView
                className={`grid gap-2 ${adminMode ? "grid-cols-4" : "grid-cols-3"}`}
              >
                {scopeTabs.map((tab) => (
                  <YeonButton
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setScope(tab.value);
                      setSelectedDeckId(null);
                    }}
                    variant={scope === tab.value ? "primary" : "secondary"}
                    size="md"
                    className="min-h-11 rounded-xl px-3 py-2 text-[13px]"
                    title={tab.help}
                  >
                    {tab.label}
                  </YeonButton>
                ))}
              </YeonView>
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className="mt-3 break-keep text-[12px] leading-5 text-[#666]"
              >
                {scopeTabs.find((tab) => tab.value === scope)?.help}
              </YeonText>
            </YeonSurface>

            {decksQuery.isPending ? (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className={SHARED_FEATURE_CLASS.text14Soft}
              >
                {deckText.loadingList}
              </YeonText>
            ) : null}
            {decksQuery.isError ? (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className={TYPING_SERVICE_COMMON_CLASS.errorTextMd}
              >
                {deckText.listError}
              </YeonText>
            ) : null}
            {decksQuery.isSuccess ? (
              <TypingDeckList
                decks={decks}
                selectedDeckId={selectedDeckId}
                onSelectDeck={setSelectedDeckId}
              />
            ) : null}

            {adminMode ? (
              <YeonView className="border-t border-[#e5e5e5] pt-5">
                <YeonView className="flex items-center justify-between gap-3">
                  <YeonView>
                    <YeonText
                      as="h2"
                      variant="unstyled"
                      tone="inherit"
                      className={TYPING_SERVICE_COMMON_CLASS.panelBodyTitle}
                    >
                      {deckText.newDeck}
                    </YeonText>
                    <YeonText
                      as="p"
                      variant="unstyled"
                      tone="inherit"
                      className="mt-1 text-[13px] leading-5 text-[#666]"
                    >
                      {deckText.openCreateHelp}
                    </YeonText>
                  </YeonView>
                  <YeonButton
                    type="button"
                    onClick={() => setIsCreateFormOpen((isOpen) => !isOpen)}
                    variant={isCreateFormOpen ? "secondary" : "primary"}
                  >
                    {isCreateFormOpen ? deckText.close : deckText.newDeck}
                  </YeonButton>
                </YeonView>
                {isCreateFormOpen ? (
                  <YeonView className="mt-4">
                    <TypingDeckForm
                      mode="create"
                      onSaved={handleCreated}
                      adminMode={adminMode}
                    />
                  </YeonView>
                ) : null}
              </YeonView>
            ) : (
              <TypingDeckForm
                mode="create"
                onSaved={handleCreated}
                adminMode={adminMode}
              />
            )}
          </YeonView>

          <YeonView as="section" className="min-w-0">
            {selectedDeckId ? (
              <TypingDeckDetailPanel
                deckId={selectedDeckId}
                adminMode={adminMode}
              />
            ) : (
              <YeonSurface
                variant="empty"
                className={`flex items-center justify-center rounded-lg bg-[#fafafa] p-10 ${
                  adminMode ? "min-h-[380px]" : "min-h-[520px]"
                }`}
              >
                <YeonView>
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className={`break-keep ${TYPING_SERVICE_COMMON_CLASS.panelBodyTitle}`}
                  >
                    {deckText.selectDeck}
                  </YeonText>
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className={`mt-2 max-w-[420px] break-keep ${SHARED_FEATURE_CLASS.text14Neutral} leading-6`}
                  >
                    {adminMode
                      ? deckText.adminSelectDeckHelp
                      : deckText.selectDeckHelp}
                  </YeonText>
                  {adminMode ? (
                    <YeonView
                      className={SHARED_FEATURE_CLASS.wrapGap2 + " mt-5"}
                    >
                      <YeonButton
                        type="button"
                        onClick={() => setIsCreateFormOpen(true)}
                        variant="primary"
                      >
                        {deckText.createDeck}
                      </YeonButton>
                      <YeonButton as="a" href="/admin/typing-characters">
                        {deckText.manageCharacters}
                      </YeonButton>
                    </YeonView>
                  ) : null}
                </YeonView>
              </YeonSurface>
            )}
          </YeonView>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
