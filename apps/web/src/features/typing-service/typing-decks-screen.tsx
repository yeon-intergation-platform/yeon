"use client";

import { useState } from "react";

import { YeonButton, YeonSurface } from "@/components/yeon-ui";
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
  const decksQuery = useTypingDecks(scope, adminMode);
  const decks = decksQuery.data?.decks ?? [];

  function handleCreated(deck: TypingDeckDto) {
    setScope("mine");
    setSelectedDeckId(deck.id);
  }

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="border-b border-[#e5e5e5] px-6 py-3 md:px-12">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
          <a
            href="/typing-service"
            className="text-[14px] font-semibold text-[#111] no-underline"
          >
            YEON 타자연습
          </a>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {showAdminEntry && !adminMode ? (
              <YeonButton as="a" href="/admin/typing-decks" variant="primary">
                관리자
              </YeonButton>
            ) : null}
            <YeonButton as="a" href="/typing-service/rooms">
              타자방으로
            </YeonButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-10 md:px-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#888]">
              Typing decks
            </p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#111]">
              타자 덱 관리
            </h1>
            <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-[#666]">
              기본 덱을 둘러보고, 내 덱을 만들고, AI가 생성한 문단을 붙여넣어
              타자 연습 문장을 빠르게 저장하세요.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-5 lg:sticky lg:top-5">
            <YeonSurface className="p-4">
              <div
                className={`grid gap-2 ${adminMode ? "grid-cols-4" : "grid-cols-3"}`}
              >
                {scopeTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setScope(tab.value);
                      setSelectedDeckId(null);
                    }}
                    className={`rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors ${
                      scope === tab.value
                        ? "bg-[#111] text-white"
                        : "bg-[#f6f6f6] text-[#666] hover:bg-[#ededed] hover:text-[#111]"
                    }`}
                    title={tab.help}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12px] leading-5 text-[#777]">
                {scopeTabs.find((tab) => tab.value === scope)?.help}
              </p>
            </YeonSurface>

            {decksQuery.isPending ? (
              <p className="text-[14px] text-[#888]">목록을 불러오는 중...</p>
            ) : null}
            {decksQuery.isError ? (
              <p className="text-[14px] text-red-600">
                덱 목록을 불러오지 못했습니다.
              </p>
            ) : null}
            {decksQuery.isSuccess ? (
              <TypingDeckList
                decks={decks}
                selectedDeckId={selectedDeckId}
                onSelectDeck={setSelectedDeckId}
              />
            ) : null}

            <TypingDeckForm
              mode="create"
              onSaved={handleCreated}
              adminMode={adminMode}
            />
          </aside>

          <section className="min-w-0">
            {selectedDeckId ? (
              <TypingDeckDetailPanel
                deckId={selectedDeckId}
                adminMode={adminMode}
              />
            ) : (
              <YeonSurface
                variant="empty"
                className="flex min-h-[520px] items-center justify-center rounded-3xl bg-[#fafafa] p-10"
              >
                <div>
                  <p className="text-[18px] font-semibold text-[#111]">
                    덱을 선택하세요.
                  </p>
                  <p className="mt-2 max-w-[420px] text-[14px] leading-6 text-[#666]">
                    왼쪽 목록에서 기본/내/공개 덱을 선택하면 문단 목록, 직접
                    추가, AI 붙여넣기 패널을 사용할 수 있습니다.
                  </p>
                </div>
              </YeonSurface>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
