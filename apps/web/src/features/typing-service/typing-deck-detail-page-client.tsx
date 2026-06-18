"use client";

import { YeonBadge, YeonLink, YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { TypingDeckDetailPanel } from "./typing-decks-screen";
import { getTypingUiText } from "./typing-service-i18n";
import { TypingServiceHeader } from "./typing-service-header";
import { useTypingSettings } from "./use-typing-settings";

export type TypingDeckDetailPageClientProps = {
  adminMode: boolean;
  deckId: string;
  showAdminEntry: boolean;
};

export function TypingDeckDetailPageClient({
  adminMode,
  deckId,
  showAdminEntry,
}: TypingDeckDetailPageClientProps) {
  const { settings } = useTypingSettings();
  const deckText = getTypingUiText(settings.locale).deck;

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <TypingServiceHeader
        active="decks"
        title={deckText.title}
        controls={
          <>
            <YeonLink
              href="/typing-service/decks"
              className="rounded-xl border border-[#e5e5e5] px-4 py-2 text-[13px] font-semibold text-[#111] no-underline transition-colors hover:border-[#111] hover:bg-[#fafafa]"
            >
              {deckText.listLink}
            </YeonLink>
            {showAdminEntry ? (
              <YeonLink
                href="/admin/typing-decks"
                className="rounded-xl bg-[#111] px-4 py-2 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#111]"
              >
                {deckText.adminEntry}
              </YeonLink>
            ) : null}
          </>
        }
      />

      <YeonView as="main" className="px-6 py-10 md:px-10">
        <YeonView className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <YeonView>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="text-[13px] font-semibold text-[#aaa]"
            >
              {deckText.detailEyebrow}
            </YeonText>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#111]"
            >
              {deckText.detailTitle}
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className="mt-2 max-w-[720px] text-[14px] leading-6 text-[#666]"
            >
              {deckText.detailDescription}
            </YeonText>
          </YeonView>
          {adminMode ? (
            <YeonBadge variant="neutral" className="w-fit">
              {deckText.adminMode}
            </YeonBadge>
          ) : null}
        </YeonView>

        <TypingDeckDetailPanel deckId={deckId} adminMode={adminMode} />
      </YeonView>
    </YeonView>
  );
}
