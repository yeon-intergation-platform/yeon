"use client";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { TYPING_SERVICE_COMMON_CLASS } from "./typing-service-common.const";
import { useState } from "react";
import {
  YeonButton,
  YeonSurface,
  YeonView,
  YeonText,
  YeonLink,
} from "@yeon/ui";
import {
  type TypingDeckDto,
  type TypingDeckScope,
  useTypingDecks,
} from "./use-typing-decks";
import {
  TYPING_DECK_SCOPE_TABS,
  TypingDeckDetailPanel,
  TypingDeckForm,
  TypingDeckList,
} from "./typing-deck-components";

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
  const scopeTabs = adminMode
    ? [
        ...TYPING_DECK_SCOPE_TABS,
        {
          value: "all" as TypingDeckScope,
          label: "전체",
          help: "관리자 전용: 비공개 포함 모든 DB 덱",
        },
      ]
    : TYPING_DECK_SCOPE_TABS;
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
        <YeonView
          as="header"
          className="border-b border-[#e5e5e5] px-6 py-3 md:px-12"
        >
          <YeonView className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
            <YeonLink
              href="/typing-service"
              className={`${TYPING_SERVICE_COMMON_CLASS.panelTextEmphasis} no-underline`}
            >
              YEON 타자연습
            </YeonLink>
            <YeonView className="flex flex-wrap items-center justify-end gap-2">
              {showAdminEntry ? (
                <YeonButton as="a" href="/admin/typing-decks" variant="primary">
                  관리자
                </YeonButton>
              ) : null}
              <YeonButton as="a" href="/typing-service/rooms">
                타자방으로
              </YeonButton>
            </YeonView>
          </YeonView>
        </YeonView>
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
              {adminMode ? "typing deck operations" : "Typing decks"}
            </YeonText>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="mt-1 break-keep text-[28px] font-semibold tracking-[-0.03em] text-[#111]"
            >
              {adminMode ? "타자 덱 운영" : "타자 덱 관리"}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={`mt-2 max-w-[720px] break-keep ${SHARED_FEATURE_CLASS.text14Neutral} leading-6`}
            >
              {adminMode
                ? "기본/공개/사용자 덱을 확인하고, 운영자가 필요한 연습 덱과 문장을 추가합니다."
                : "기본 덱을 둘러보고, 내 덱을 만들고, AI가 생성한 문단을 붙여넣어 타자 연습 문장을 빠르게 저장하세요."}
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
                목록을 불러오는 중...
              </YeonText>
            ) : null}
            {decksQuery.isError ? (
              <YeonText
                as="p"
                variant="unstyled"
                tone="inherit"
                className={TYPING_SERVICE_COMMON_CLASS.errorTextMd}
              >
                덱 목록을 불러오지 못했습니다.
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
                      새 덱
                    </YeonText>
                    <YeonText
                      as="p"
                      variant="unstyled"
                      tone="inherit"
                      className="mt-1 text-[13px] leading-5 text-[#666]"
                    >
                      필요할 때만 폼을 열어 덱을 추가합니다.
                    </YeonText>
                  </YeonView>
                  <YeonButton
                    type="button"
                    onClick={() => setIsCreateFormOpen((isOpen) => !isOpen)}
                    variant={isCreateFormOpen ? "secondary" : "primary"}
                  >
                    {isCreateFormOpen ? "닫기" : "새 덱"}
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
                    덱을 선택하세요.
                  </YeonText>
                  <YeonText
                    as="p"
                    variant="unstyled"
                    tone="inherit"
                    className={`mt-2 max-w-[420px] break-keep ${SHARED_FEATURE_CLASS.text14Neutral} leading-6`}
                  >
                    {adminMode
                      ? "왼쪽 목록에서 덱을 선택하면 문장 목록과 운영 편집 패널을 확인할 수 있습니다."
                      : "왼쪽 목록에서 기본/내/공개 덱을 선택하면 문단 목록, 직접 추가, AI 붙여넣기 패널을 사용할 수 있습니다."}
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
                        새 덱 만들기
                      </YeonButton>
                      <YeonButton as="a" href="/admin/typing-characters">
                        캐릭터 관리
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
