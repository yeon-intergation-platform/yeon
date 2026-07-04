import {
  getYeonRequestCookies,
  getYeonRequestHeaders,
} from "@yeon/ui/runtime/YeonServerRequest";
import {
  DEFAULT_PLATFORM_LANGUAGE,
  PLATFORM_LANGUAGE_COOKIE_NAME,
  normalizePlatformLanguage,
  type PlatformLanguage,
} from "@/lib/platform-language";

function pickAcceptedLanguage(value: string | null): PlatformLanguage | null {
  const firstLanguage = value
    ?.split(",")
    .map((entry) => entry.split(";")[0]?.trim())
    .find((entry) => entry && entry.length > 0);

  if (!firstLanguage) return null;
  return normalizePlatformLanguage(firstLanguage);
}

export async function resolvePlatformLanguageFromRequest(
  explicitLanguage?: string | null
): Promise<PlatformLanguage> {
  if (explicitLanguage) {
    return normalizePlatformLanguage(explicitLanguage);
  }

  const cookieStore = await getYeonRequestCookies();
  const cookieLanguage = cookieStore.get(PLATFORM_LANGUAGE_COOKIE_NAME)?.value;
  if (cookieLanguage) {
    return normalizePlatformLanguage(cookieLanguage);
  }

  const headerStore = await getYeonRequestHeaders();
  return (
    pickAcceptedLanguage(headerStore.get("accept-language")) ??
    DEFAULT_PLATFORM_LANGUAGE
  );
}
