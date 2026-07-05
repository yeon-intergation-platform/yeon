import { type YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { buildServiceCanonicalUrl } from "@/lib/seo";
import {
  GAME_CATEGORY_LABELS,
  getGameSlugs,
  type GameEntry,
} from "@/features/game-service/game-catalog";
import {
  getLocalizedGameCategoryLabel,
  getLocalizedGameText,
  getGameServiceText,
  type GameServiceLanguage,
} from "@/features/game-service/game-service-i18n";
import { getDetailGame } from "@/features/game-service/game-source";
import { resolvePlatformLanguageFromRequest } from "@/lib/platform-language-server";

export type GameDetailRouteParams = {
  gameSlug: string;
};

type GameDetailRouteSearchParams = {
  lang?: string | string[];
};

export const GAME_HUB_URL = buildServiceCanonicalUrl("game");

// curated 간판 게임만 정적 생성하고, feed 게임은 on-demand로 렌더한다.
export function generateStaticParams() {
  return getGameSlugs().map((gameSlug) => ({ gameSlug }));
}

// og:image·JSON-LD image는 절대 URL이어야 한다. 호스팅 썸네일(/games/..)은 게임 도메인으로 절대화.
function toAbsoluteImage(thumbUrl: string): string | null {
  const trimmed = thumbUrl.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${GAME_HUB_URL}${trimmed}`;
  return null;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// 제목·카테고리·출처를 엮어 검색 노출에 유리한 키워드를 만든다.
function buildKeywords(game: GameEntry, language: GameServiceLanguage): string {
  const gameText = getLocalizedGameText(game, language);
  const category =
    language === "ko"
      ? GAME_CATEGORY_LABELS[game.category]
      : getLocalizedGameCategoryLabel(game.category, language);

  if (language === "en") {
    return [
      gameText.title,
      `${gameText.title} game`,
      `${gameText.title} free`,
      `${category} game`,
      "free online games",
      "browser games",
      "YEON Games",
    ].join(", ");
  }

  return [
    gameText.title,
    `${gameText.title} 게임`,
    `${gameText.title} 무료`,
    `${category} 게임`,
    "무료 온라인 게임",
    "브라우저 게임",
    "YEON 게임",
  ].join(", ");
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<GameDetailRouteParams>;
  searchParams?: Promise<GameDetailRouteSearchParams>;
}): Promise<YeonPageMetadata> {
  const { gameSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const language = await resolvePlatformLanguageFromRequest(
    firstParam(resolvedSearchParams.lang)
  );
  const game = await getDetailGame(gameSlug);

  if (!game) {
    return {
      title:
        language === "en"
          ? "Game not found | YEON"
          : "게임을 찾을 수 없습니다 | YEON",
    };
  }

  const canonical = buildServiceCanonicalUrl("game", `/${game.slug}`);
  const serviceText = getGameServiceText(language);
  const gameText = getLocalizedGameText(game, language);
  const category = getLocalizedGameCategoryLabel(game.category, language);
  const title =
    language === "en"
      ? `${gameText.title} - Play a free ${category} game | YEON Games`
      : `${gameText.title} - 무료로 바로 하는 ${category} 게임 | YEON 게임`;
  const image = toAbsoluteImage(game.thumbUrl);
  const images = image ? [{ url: image, alt: gameText.title }] : undefined;

  return {
    title,
    description: gameText.summary,
    keywords: buildKeywords(game, language),
    alternates: {
      canonical,
      languages: {
        ko: `${canonical}?lang=ko`,
        en: `${canonical}?lang=en`,
      },
    },
    openGraph: {
      title,
      description: gameText.summary,
      url: canonical,
      siteName: SITE_BRAND_NAME,
      type: "website",
      locale: serviceText.metadataLocale,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: gameText.summary,
      images: image ? [image] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export function getGameJsonLd(
  game: GameEntry,
  canonical: string,
  language: GameServiceLanguage = "ko"
) {
  const image = toAbsoluteImage(game.thumbUrl);
  const gameText = getLocalizedGameText(game, language);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoGame",
        name: gameText.title,
        description: gameText.description,
        url: canonical,
        inLanguage: language === "en" ? "en-US" : "ko-KR",
        ...(image ? { image } : {}),
        genre: getLocalizedGameCategoryLabel(game.category, language),
        applicationCategory: "GameApplication",
        operatingSystem: "Web",
        gamePlatform: "Web browser",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "KRW",
          availability: "https://schema.org/InStock",
        },
        publisher: { "@type": "Organization", name: game.provider },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: language === "en" ? "YEON Games" : "YEON 게임",
            item: GAME_HUB_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: getLocalizedGameCategoryLabel(game.category, language),
            item: `${GAME_HUB_URL}?category=${game.category}&lang=${language}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: gameText.title,
            item: canonical,
          },
        ],
      },
    ],
  };
}
