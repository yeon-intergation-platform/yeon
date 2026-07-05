"use client";
import {
  YeonExperienceHistoryList,
  YeonExperiencePanel,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { QueryProvider } from "@/lib/query-provider";
import {
  getProfileText,
  type ProfileLanguage,
} from "@/features/profile/profile-i18n";
import { useExperienceAuthState } from "./use-experience-auth-state";
import { useExperienceHistory } from "./use-experience-history";
import { useUserExperience } from "./use-user-experience";

function SectionHeading({ label }: { label: string }) {
  return (
    <YeonText
      variant="unstyled"
      tone="inherit"
      className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#aaa]"
    >
      {label}
    </YeonText>
  );
}

function ProfileExperienceSectionInner({
  language,
}: {
  language: ProfileLanguage;
}) {
  const text = getProfileText(language).experience;
  const experienceQuery = useUserExperience(true);
  const historyQuery = useExperienceHistory(true);

  return (
    <YeonView className="mt-6 grid gap-4">
      <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
        <SectionHeading label={text.levelHeading} />
        {experienceQuery.data ? (
          <YeonExperiencePanel
            className="mt-3"
            level={experienceQuery.data.level}
            totalXp={experienceQuery.data.totalXp}
            xpIntoLevel={experienceQuery.data.xpIntoLevel}
            xpForNextLevel={experienceQuery.data.xpForNextLevel}
          />
        ) : (
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="mt-3 text-[13px] text-[#666]"
          >
            {experienceQuery.isError ? text.loadError : text.loading}
          </YeonText>
        )}
      </YeonView>

      <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
        <SectionHeading label={text.historyHeading} />
        <YeonView className="mt-3">
          {historyQuery.data ? (
            <YeonExperienceHistoryList
              activityLabels={text.activityLabels}
              emptyText={text.emptyHistory}
              items={historyQuery.data.items}
              locale={getProfileText(language).dateLocale}
            />
          ) : (
            <YeonText
              variant="unstyled"
              tone="inherit"
              className="text-[13px] text-[#666]"
            >
              {historyQuery.isError
                ? text.historyLoadError
                : text.historyLoading}
            </YeonText>
          )}
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

// 프로필 경험치 섹션. 전역 QueryProvider 밖에서도 동작하도록 자체 provider를 갖는다.
export function ProfileExperienceSection({
  language,
}: {
  language: ProfileLanguage;
}) {
  const isAuthenticated = useExperienceAuthState();

  if (isAuthenticated !== true) {
    return null;
  }

  return (
    <QueryProvider>
      <ProfileExperienceSectionInner language={language} />
    </QueryProvider>
  );
}
