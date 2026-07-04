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
  type GameServiceLanguage,
} from "@/features/game-service/game-service-i18n";
import { getDetailGame } from "@/features/game-service/game-source";

export type GameDetailRouteParams = {
  gameSlug: string;
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

// 제목·카테고리·출처를 엮어 검색 노출에 유리한 한국어 키워드를 만든다.
function buildKeywords(game: GameEntry): string {
  const category = GAME_CATEGORY_LABELS[game.category];
  return [
    game.title,
    `${game.title} 게임`,
    `${game.title} 무료`,
    `${category} 게임`,
    "무료 온라인 게임",
    "브라우저 게임",
    "YEON 게임",
  ].join(", ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<GameDetailRouteParams>;
}): Promise<YeonPageMetadata> {
  const { gameSlug } = await params;
  const game = await getDetailGame(gameSlug);

  if (!game) {
    return { title: "게임을 찾을 수 없습니다 | YEON" };
  }

  const canonical = buildServiceCanonicalUrl("game", `/${game.slug}`);
  const title = `${game.title} - 무료로 바로 하는 ${GAME_CATEGORY_LABELS[game.category]} 게임 | YEON 게임`;
  const image = toAbsoluteImage(game.thumbUrl);
  const images = image ? [{ url: image, alt: game.title }] : undefined;

  return {
    title,
    description: game.summary,
    keywords: buildKeywords(game),
    alternates: { canonical },
    openGraph: {
      title,
      description: game.summary,
      url: canonical,
      siteName: SITE_BRAND_NAME,
      type: "website",
      locale: "ko_KR",
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: game.summary,
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
        name: game.title,
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
            name: game.title,
            item: canonical,
          },
        ],
      },
    ],
  };
}
