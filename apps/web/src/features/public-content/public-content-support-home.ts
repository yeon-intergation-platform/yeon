import {
  PUBLIC_CONTENT_CHANNELS,
  buildPublicContentCanonicalUrl,
  getPublicContentArticleBySlug,
  getPublicContentCategoryLabel,
  getPublicContentServiceLabel,
  type PublicContentArticle,
} from "./public-content-data";

export type PublicContentSupportHomeProblemEntry = {
  article: PublicContentArticle;
  categoryLabel: string;
  href: string;
  prompt: string;
  serviceLabel: string;
};

type SupportHomeProblemSeed = {
  prompt: string;
  slugSegments: readonly string[];
};

const SUPPORT_HOME_PROBLEM_SEEDS = [
  {
    prompt: "NEXA를 서버에 추가해야 해요",
    slugSegments: ["nexa", "guides", "add-nexa-discord-bot"],
  },
  {
    prompt: "NEXA 봇이 답하지 않아요",
    slugSegments: ["nexa", "troubleshooting", "bot-not-responding"],
  },
  {
    prompt: "디스코드 권한이 맞는지 확인하고 싶어요",
    slugSegments: ["nexa", "guides", "discord-bot-permissions"],
  },
  {
    prompt: "타자연습을 바로 시작하고 싶어요",
    slugSegments: ["typing", "getting-started", "start-typing-practice"],
  },
  {
    prompt: "플래시카드 덱을 만들고 싶어요",
    slugSegments: ["card", "guides", "create-flashcard-deck"],
  },
  {
    prompt: "커뮤니티에 글을 쓰고 싶어요",
    slugSegments: ["community", "guides", "write-community-post"],
  },
] as const satisfies readonly SupportHomeProblemSeed[];

function toSupportHomeProblemEntry(
  seed: SupportHomeProblemSeed
): PublicContentSupportHomeProblemEntry | null {
  const article = getPublicContentArticleBySlug(
    PUBLIC_CONTENT_CHANNELS.support,
    seed.slugSegments
  );

  if (!article) return null;

  return {
    article,
    categoryLabel: getPublicContentCategoryLabel(article.category),
    href: buildPublicContentCanonicalUrl(article.channel, article.slugSegments),
    prompt: seed.prompt,
    serviceLabel: getPublicContentServiceLabel(article.service),
  };
}

export function getPublicContentSupportHomeProblemEntries({
  limit = SUPPORT_HOME_PROBLEM_SEEDS.length,
}: {
  limit?: number;
} = {}): PublicContentSupportHomeProblemEntry[] {
  if (limit <= 0) return [];

  return SUPPORT_HOME_PROBLEM_SEEDS.map(toSupportHomeProblemEntry)
    .filter((entry): entry is PublicContentSupportHomeProblemEntry =>
      Boolean(entry)
    )
    .slice(0, limit);
}
