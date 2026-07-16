import {
  PUBLIC_CONTENT_CHANNELS,
  PUBLIC_CONTENT_ERROR_REPORT_MAILTO,
  PUBLIC_CONTENT_SERVICES,
  buildPublicContentCanonicalUrl,
  getPublicContentArticleBySlug,
  getPublicContentCategoryLabel,
  getPublicContentServiceLabel,
  type PublicContentArticle,
  type PublicContentService,
} from "./public-content-data";
import { getPublicContentServiceNavItems } from "./public-content-navigation";

export type PublicContentSupportHomeProblemEntry = {
  article: PublicContentArticle;
  categoryLabel: string;
  href: string;
  prompt: string;
  serviceLabel: string;
};

export type PublicContentSupportHomeServiceEntry = {
  articleCount: number;
  description: string;
  href: string;
  label: string;
  service: PublicContentService;
};

export type PublicContentSupportHomeReportEntry = {
  description: string;
  href: string;
  label: string;
};

export type PublicContentSupportHomeNoticeEntry = {
  article: PublicContentArticle;
  href: string;
};

type SupportHomeProblemSeed = {
  prompt: string;
  slugSegments: readonly string[];
};

const SUPPORT_HOME_SERVICE_DESCRIPTIONS = {
  [PUBLIC_CONTENT_SERVICES.nexa]:
    "설치, 디스코드 권한, 응답 없음, 채널 설정을 순서대로 확인합니다.",
  [PUBLIC_CONTENT_SERVICES.typing]:
    "타자연습 시작, 방 입장, 레이스 연결 문제를 빠르게 확인합니다.",
  [PUBLIC_CONTENT_SERVICES.card]:
    "덱 생성, 카드 추가, 게스트 데이터와 학습 시작 흐름을 정리합니다.",
  [PUBLIC_CONTENT_SERVICES.community]:
    "글 작성, 댓글, 게스트 닉네임, 커뮤니티 이용 기준을 안내합니다.",
  [PUBLIC_CONTENT_SERVICES.account]:
    "로그인이 자꾸 풀릴 때, 개인정보, 공개 URL, 오류 신고 위치를 확인합니다.",
} as const satisfies Record<PublicContentService, string>;

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

export function getPublicContentSupportHomeServiceEntries(): PublicContentSupportHomeServiceEntry[] {
  return getPublicContentServiceNavItems({
    channel: PUBLIC_CONTENT_CHANNELS.support,
  }).flatMap((item): PublicContentSupportHomeServiceEntry[] => {
    const [service] = item.slugSegments;

    if (!isSupportHomeService(service)) return [];

    return [
      {
        articleCount: item.count,
        description: SUPPORT_HOME_SERVICE_DESCRIPTIONS[service],
        href: item.href,
        label: item.label,
        service,
      },
    ];
  });
}

export function getPublicContentSupportHomeNoticeEntry(): PublicContentSupportHomeNoticeEntry | null {
  const article = getPublicContentArticleBySlug(PUBLIC_CONTENT_CHANNELS.news, [
    "notice",
    "public-content-network-start",
  ]);

  if (!article) return null;

  return {
    article,
    href: buildPublicContentCanonicalUrl(article.channel, article.slugSegments),
  };
}

export function getPublicContentSupportHomeReportEntry(): PublicContentSupportHomeReportEntry | null {
  const article = getPublicContentArticleBySlug(
    PUBLIC_CONTENT_CHANNELS.support,
    ["account", "troubleshooting", "report-service-error"]
  );

  if (!article) return null;

  return {
    description:
      "타자연습, 카드, 커뮤니티, NEXA에서 문제가 생기면 서비스 주소와 화면 상태만 짧게 보내도 됩니다.",
    href: PUBLIC_CONTENT_ERROR_REPORT_MAILTO,
    label: "오류 신고하기",
  };
}

function isSupportHomeService(
  service: string | undefined
): service is PublicContentService {
  return Object.values(PUBLIC_CONTENT_SERVICES).some(
    (value) => value === service
  );
}
