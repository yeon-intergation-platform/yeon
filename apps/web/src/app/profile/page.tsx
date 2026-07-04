import { YeonLink } from "@yeon/ui";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { YeonText, YeonView } from "@yeon/ui";
import { YEON_WEB_SHARED_CLASS as SHARED_FEATURE_CLASS } from "@yeon/ui/theme/web-style-tokens";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import { ProfileEditSection } from "@/features/profile/profile-edit-section";
import {
  getProfileText,
  type ProfileLanguage,
} from "@/features/profile/profile-i18n";
import { ProfileExperienceSection } from "@/features/user-experience/profile-experience-section";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { resolvePlatformLanguageFromRequest } from "@/lib/platform-language-server";
import { buildAuthSessionCleanupHref } from "@/server/auth/constants";
import { getCurrentAuthUser } from "@/server/auth/session";

export const metadata: YeonPageMetadata = {
  title: `내정보 | ${SITE_BRAND_NAME}`,
  robots: NON_INDEXABLE_ROBOTS,
};

type ProfileSearchParams = {
  lang?: string | string[];
};

type AuthUser = Awaited<ReturnType<typeof getCurrentAuthUser>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateTime(value: string, language: ProfileLanguage) {
  return new Date(value).toLocaleString(getProfileText(language).dateLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function resolveProfileUser(): Promise<{
  user: AuthUser;
  sessionError: boolean;
}> {
  try {
    return { user: await getCurrentAuthUser(), sessionError: false };
  } catch (error) {
    console.warn("[profile] 로그인 세션 조회 실패", error);
    return { user: null, sessionError: true };
  }
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<ProfileSearchParams>;
}) {
  const { lang } = await searchParams;
  const language = await resolvePlatformLanguageFromRequest(firstParam(lang));
  const text = getProfileText(language);
  const { user, sessionError } = await resolveProfileUser();

  return (
    <YeonView className={SHARED_FEATURE_CLASS.pageSurface}>
      <CommonProductHeader
        activeService="home"
        brandLabel={text.brandLabel}
        profileLabels={text.profileMenu}
        showBgmButton={false}
      />

      <YeonView as="main" className="mx-auto max-w-[820px] px-6 py-12 md:px-12">
        <YeonView
          as="section"
          className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-6 md:p-8"
        >
          <YeonText
            variant="unstyled"
            tone="inherit"
            className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#aaa]"
          >
            {text.eyebrow}
          </YeonText>
          <YeonText
            as="h1"
            variant="unstyled"
            tone="inherit"
            className="mt-3 text-[30px] font-black tracking-[-0.04em] md:text-[38px]"
          >
            {text.title}
          </YeonText>

          {sessionError ? (
            <YeonView className="mt-8 rounded-2xl border border-[#e5e5e5] bg-white p-5">
              <YeonText
                as="h2"
                variant="unstyled"
                tone="inherit"
                className="text-[15px] font-bold text-[#111]"
              >
                {text.sessionErrorTitle}
              </YeonText>
              <YeonText
                variant="unstyled"
                tone="inherit"
                className="mt-2 text-[14px] leading-[1.8] text-[#666]"
              >
                {text.sessionErrorDescription}
              </YeonText>
              <YeonLink
                href={buildAuthSessionCleanupHref("/profile")}
                className={
                  SHARED_FEATURE_CLASS.primaryActionButtonMd13 + " mt-5"
                }
              >
                {text.cleanupAction}
              </YeonLink>
            </YeonView>
          ) : user ? (
            <YeonView className="mt-8 grid gap-4">
              <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className={SHARED_FEATURE_CLASS.text12EmphasisSubtle}
                >
                  {text.email}
                </YeonText>
                <YeonText
                  variant="unstyled"
                  tone="inherit"
                  className="mt-2 text-[15px] font-semibold"
                >
                  {user.email}
                </YeonText>
              </YeonView>
              <YeonView className="grid gap-4 md:grid-cols-2">
                <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className={SHARED_FEATURE_CLASS.text12EmphasisSubtle}
                  >
                    {text.providers}
                  </YeonText>
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className="mt-2 text-[15px] font-semibold"
                  >
                    {user.providers.join(", ")}
                  </YeonText>
                </YeonView>
                <YeonView className="rounded-2xl border border-[#e5e5e5] bg-white p-5">
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className={SHARED_FEATURE_CLASS.text12EmphasisSubtle}
                  >
                    {text.lastLogin}
                  </YeonText>
                  <YeonText
                    variant="unstyled"
                    tone="inherit"
                    className="mt-2 text-[15px] font-semibold"
                  >
                    {formatDateTime(user.lastLoginAt, language)}
                  </YeonText>
                </YeonView>
              </YeonView>
              <ProfileEditSection
                initialDisplayName={user.displayName}
                initialAvatarUrl={user.avatarUrl}
                language={language}
              />
              <ProfileExperienceSection />
            </YeonView>
          ) : (
            <YeonView className="mt-8 rounded-2xl border border-[#e5e5e5] bg-white p-5">
              <YeonText
                variant="unstyled"
                tone="inherit"
                className="text-[15px] leading-[1.8] text-[#666]"
              >
                {text.loginRequired}
              </YeonText>
              <YeonLink
                href="/?login=1&next=%2Fprofile"
                className={
                  SHARED_FEATURE_CLASS.primaryActionButtonMd13 + " mt-5"
                }
              >
                {text.loginAction}
              </YeonLink>
            </YeonView>
          )}
        </YeonView>
      </YeonView>
    </YeonView>
  );
}
