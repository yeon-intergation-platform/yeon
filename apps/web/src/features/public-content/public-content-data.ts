import type { YeonMetadataRoute } from "@yeon/ui/runtime/YeonMetadataRoute";
import { SITE_SUPPORT_EMAIL } from "@/lib/site-brand";

export const PUBLIC_CONTENT_CHANNELS = {
  support: "support",
  news: "news",
  blog: "blog",
} as const;

export type PublicContentChannel =
  (typeof PUBLIC_CONTENT_CHANNELS)[keyof typeof PUBLIC_CONTENT_CHANNELS];

export const PUBLIC_CONTENT_CALLOUT_TONES = {
  note: "note",
  warning: "warning",
  success: "success",
} as const;

export type PublicContentCalloutTone =
  (typeof PUBLIC_CONTENT_CALLOUT_TONES)[keyof typeof PUBLIC_CONTENT_CALLOUT_TONES];

export const PUBLIC_CONTENT_SERVICES = {
  nexa: "nexa",
  typing: "typing",
  card: "card",
  community: "community",
  account: "account",
} as const;

export type PublicContentService =
  (typeof PUBLIC_CONTENT_SERVICES)[keyof typeof PUBLIC_CONTENT_SERVICES];

type PublicContentSupportCtaTarget = {
  ctaLabel: string;
  ctaHref: string;
};

export const PUBLIC_CONTENT_NEXA_INSTALL_URL =
  "https://discord-ai.yeon.world/install";

export const PUBLIC_CONTENT_NEXA_DISCORD_BOT_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=1509346092850876416&permissions=3968122435926081&integration_type=0&scope=applications.commands+bot";

export const PUBLIC_CONTENT_ERROR_REPORT_MAILTO = `mailto:${SITE_SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "[YEON 오류 신고]"
)}`;

export const PUBLIC_CONTENT_SUPPORT_CTA_TARGETS = {
  nexa: {
    ctaLabel: "NEXA 설치 페이지 열기",
    ctaHref: PUBLIC_CONTENT_NEXA_INSTALL_URL,
  },
  typing: {
    ctaLabel: "타자연습 열기",
    ctaHref: "https://typing.yeon.world",
  },
  card: {
    ctaLabel: "플래시카드 열기",
    ctaHref: "https://card.yeon.world",
  },
  community: {
    ctaLabel: "커뮤니티 열기",
    ctaHref: "https://community.yeon.world",
  },
} as const satisfies Partial<
  Record<PublicContentService, PublicContentSupportCtaTarget>
>;

export function getPublicContentSupportCtaTarget(
  service: PublicContentService
) {
  return (
    PUBLIC_CONTENT_SUPPORT_CTA_TARGETS[
      service as keyof typeof PUBLIC_CONTENT_SUPPORT_CTA_TARGETS
    ] ?? null
  );
}

export type PublicContentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "heading";
      title: string;
    }
  | {
      type: "steps";
      items: readonly string[];
    }
  | {
      type: "checklist";
      items: readonly string[];
    }
  | {
      type: "image";
      src: string;
      alt: string;
      width: number;
      height: number;
      caption?: string;
    }
  | {
      type: "code";
      language: string;
      code: string;
      filename?: string;
    }
  | {
      type: "links";
      title: string;
      links: readonly {
        href: string;
        label: string;
      }[];
    }
  | {
      type: "callout";
      title: string;
      text: string;
      tone?: PublicContentCalloutTone;
    };

export type PublicContentArticle = {
  affectedServiceLabel?: string;
  channel: PublicContentChannel;
  service: PublicContentService;
  category: string;
  slugSegments: readonly string[];
  title: string;
  description: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  readingMinutes: number;
  ctaLabel?: string;
  ctaHref?: string;
  sourcePaths: readonly string[];
  body: readonly PublicContentBlock[];
};

export type PublicContentCollection = {
  channel: PublicContentChannel;
  slugSegments: readonly string[];
  title: string;
  description: string;
  articles: readonly PublicContentArticle[];
  canonicalUrl: string;
  lastModified: string;
};

type PublicContentSitemapEntry = {
  url: string;
  changeFrequency: NonNullable<
    YeonMetadataRoute["Sitemap"][number]["changeFrequency"]
  >;
  priority: number;
  lastModified?: string;
};

export const PUBLIC_CONTENT_CHANNEL_CONFIG = {
  support: {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    host: "https://support.yeon.world",
    internalBasePath: "/support",
    label: "Support",
    brandLabel: "YEON 고객지원",
    title: "YEON Support",
    description:
      "NEXA, 타자연습, 플래시카드, 커뮤니티를 바로 사용할 수 있게 돕는 공개 도움말입니다.",
    homeEyebrow: "도움말 센터",
    homeTitle: "서비스별로 알맞은 해결 방법을 찾아보세요",
    homeDescription:
      "사용 가이드, 정책 안내, 문제 해결 방법을 쉽고 빠르게 찾아볼 수 있습니다.",
  },
  news: {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    host: "https://news.yeon.world",
    internalBasePath: "/news",
    label: "News",
    brandLabel: "YEON 뉴스",
    title: "YEON News",
    description: "YEON 서비스에 실제로 적용된 변경과 필요한 조치만 알립니다.",
    homeEyebrow: "공식 소식 · 변경사항",
    homeTitle: "YEON의 실제 변경사항",
    homeDescription: "서비스 기능, 정책, 접속에 영향을 주는 변경만 기록합니다.",
  },
  blog: {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    host: "https://blog.yeon.world",
    internalBasePath: "/blog",
    label: "Blog",
    brandLabel: "YEON 블로그",
    title: "YEON Blog",
    description:
      "YEON 서비스의 실제 구현과 제품 동작을 남기는 기술·제품 기록입니다.",
    homeEyebrow: "제작 기록 · 기술과 판단",
    homeTitle: "서비스를 만들며 확인한 구현 기록",
    homeDescription:
      "NEXA, 타자방, 플래시카드, 커뮤니티에서 실제로 선택한 구조와 동작을 기록합니다.",
  },
} as const satisfies Record<
  PublicContentChannel,
  {
    channel: PublicContentChannel;
    host: string;
    internalBasePath: string;
    label: string;
    brandLabel: string;
    title: string;
    description: string;
    homeEyebrow: string;
    homeTitle: string;
    homeDescription: string;
  }
>;

export const PUBLIC_CONTENT_SERVICE_LABELS = {
  nexa: "NEXA",
  typing: "타자연습",
  card: "플래시카드",
  community: "커뮤니티",
  account: "계정/정책",
} as const satisfies Record<PublicContentService, string>;

export const PUBLIC_CONTENT_CATEGORY_LABELS = {
  "getting-started": "처음 시작",
  guides: "가이드",
  troubleshooting: "문제 해결",
  faq: "FAQ",
  policy: "정책",
  notice: "공지",
  updates: "업데이트",
  news: "뉴스 해설",
  engineering: "기술 글",
  product: "제품 글",
  devlog: "개발 일지",
  essay: "에세이",
} as const;

const NEWS_CATEGORY_TITLES = {
  notice: "공식 공지",
  updates: "제품 업데이트",
  news: "업계 뉴스 해설",
} as const;

const NEWS_TOPIC_LABELS = {
  ai: "AI",
  discord: "Discord",
  developer: "개발자",
  product: "제품",
} as const;

const BLOG_CATEGORY_TITLES = {
  engineering: "기술 글",
  product: "제품 글",
  devlog: "개발 일지",
  essay: "에세이",
} as const;

const PUBLISHED_DATE = "2026-06-17";
const DAILYTING_FASTSTART_PUBLISHED_DATE = "2026-07-14";
const PUBLIC_CONTENT_EDITORIAL_UPDATE_DATE = "2026-07-16";
const NEXA_OPERATOR_ARTICLE_DATE = "2026-06-17";
const TYPING_REALTIME_ARTICLE_DATE = "2026-06-19";
const CARD_GUEST_ARTICLE_DATE = "2026-06-09";
const COMMUNITY_GUEST_ARTICLE_DATE = "2026-06-27";
const NEXA_SAFETY_ARTICLE_DATE = "2026-06-17";

const PUBLIC_CONTENT_ARTICLE_DRAFTS: readonly PublicContentArticle[] = [
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "guides",
    slugSegments: ["nexa", "guides", "add-nexa-discord-bot"],
    title: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
    description:
      "디스코드 서버 관리자가 실제 NEXA 설치 페이지에서 봇을 추가하고, 데스크톱 앱 설치와 구분해 확인하는 순서입니다.",
    summary:
      "설치 페이지와 직접 초대 링크를 열고, 서버 선택과 권한 승인 후 테스트 채널에서 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.nexa,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/README.md",
      "/Users/osuma/coding_stuffs/discord-assitant/central-server/src/main/resources/static/install.html",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/BOT_PERMISSIONS.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "이 글은 디스코드 서버에 NEXA 봇을 추가하는 절차입니다. NEXA 데스크톱 앱 설치는 내 PC를 로컬 AI Provider로 연결할 때 쓰는 선택 절차이고, 서버에 봇만 추가할 때는 데스크톱 앱을 설치하지 않아도 됩니다.",
      },
      {
        type: "links",
        title: "먼저 열 링크",
        links: [
          {
            href: PUBLIC_CONTENT_NEXA_INSTALL_URL,
            label: "NEXA 설치 페이지",
          },
          {
            href: PUBLIC_CONTENT_NEXA_DISCORD_BOT_INVITE_URL,
            label: "Discord에 NEXA 봇 바로 추가",
          },
        ],
      },
      {
        type: "heading",
        title: "봇 추가 순서",
      },
      {
        type: "steps",
        items: [
          "디스코드에서 봇을 추가할 서버를 정하고, 본인 역할에 서버 관리 또는 봇 초대 권한이 있는지 확인합니다.",
          "NEXA 설치 페이지를 열고 “디스코드에 봇 추가”를 누릅니다. 바로 추가하려면 위의 Discord 초대 링크를 열어도 됩니다.",
          "Discord 승인 화면에서 서버 이름이 맞는지 확인합니다. 다른 서버가 선택되어 있으면 진행하지 않습니다.",
          "요청 권한을 확인합니다. 권한 설명이 필요하면 NEXA 권한 문서를 먼저 열어 비교합니다.",
          "승인 후 서버 멤버 목록이나 테스트 채널에서 NEXA 봇이 보이는지 확인합니다.",
          "슬래시 명령 목록에 NEXA 명령이 보이면 짧은 테스트 질문을 보내 응답을 확인합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "데스크톱 앱 설치와 헷갈리지 마세요",
        text: "설치 페이지에 데스크톱 앱 안내가 함께 보여도, 디스코드 서버에 봇을 추가하는 데스크톱 앱 설치는 필수가 아닙니다. 서버 봇 추가는 Discord 승인 화면에서 끝납니다.",
      },
      {
        type: "heading",
        title: "추가 후 확인할 것",
      },
      {
        type: "checklist",
        items: [
          "봇이 서버 멤버 목록에 표시됩니다.",
          "테스트 채널에서 메시지를 읽고 답변할 수 있습니다.",
          "사용할 채널에서 봇 역할이 숨겨져 있지 않습니다.",
          "응답이 없다면 권한 문서와 문제 해결 문서를 이어서 확인합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.success,
        title: "응답이 확인되면 완료입니다",
        text: "테스트 채널에서 NEXA가 답변하면 봇 추가와 기본 권한 확인은 끝난 상태입니다.",
      },
      {
        type: "links",
        title: "설치 후 함께 볼 문서",
        links: [
          {
            href: "https://support.yeon.world/nexa/guides/discord-bot-permissions",
            label: "NEXA 봇에게 필요한 디스코드 권한",
          },
          {
            href: "https://support.yeon.world/nexa/troubleshooting/bot-not-responding",
            label: "NEXA 봇이 응답하지 않을 때 확인할 5가지",
          },
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "guides",
    slugSegments: ["nexa", "guides", "discord-bot-permissions"],
    title: "NEXA 봇에게 필요한 디스코드 권한",
    description:
      "NEXA AI 봇이 메시지를 읽고 답변하기 위해 필요한 Discord 권한과 Message Content Intent 확인 방법입니다.",
    summary:
      "기본 권한, 권장 권한, Message Content Intent를 분리해서 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 5,
    ctaLabel: "NEXA 설치 페이지 열기",
    ctaHref: PUBLIC_CONTENT_NEXA_INSTALL_URL,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/docs/BOT_PERMISSIONS.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "NEXA가 서버에서 답변하려면 채널을 볼 수 있고, 메시지를 읽고, 답변을 보낼 수 있어야 합니다. 권한은 서버 전체 역할과 채널별 권한이 함께 맞아야 합니다.",
      },
      {
        type: "heading",
        title: "필수 권한",
      },
      {
        type: "checklist",
        items: [
          "View Channel: 봇이 채널을 볼 수 있어야 합니다.",
          "Send Messages: 봇이 답변을 보낼 수 있어야 합니다.",
          "Read Message History: 이전 대화 맥락을 읽어야 할 때 필요합니다.",
          "Use Slash Commands: slash command를 사용할 경우 필요합니다.",
          "기본 권장 Permissions Integer는 2147568640이고, 채널 AI 프로필 표시까지 포함한 권장 값은 2684734528입니다.",
        ],
      },
      {
        type: "heading",
        title: "권한 확인 순서",
      },
      {
        type: "steps",
        items: [
          "디스코드 서버 설정에서 역할 메뉴를 엽니다.",
          "NEXA 봇 역할을 선택합니다.",
          "필수 권한이 켜져 있는지 확인합니다.",
          "봇을 사용할 채널 설정을 열고 역할별 권한 덮어쓰기가 있는지 확인합니다.",
          "채널에서 View Channel과 Send Messages가 거부되어 있지 않은지 확인합니다.",
          "메시지 내용을 읽어야 하는 기능이라면 Discord Developer Portal의 Message Content Intent 상태를 확인합니다.",
        ],
      },
      {
        type: "heading",
        title: "Message Content Intent를 켜야 하는 경우",
      },
      {
        type: "steps",
        items: [
          "Discord Developer Portal에서 NEXA 애플리케이션을 엽니다.",
          "Bot 메뉴의 Privileged Gateway Intents 영역으로 이동합니다.",
          "@멘션 질문처럼 일반 메시지 본문을 읽는 기능을 쓸 때만 Message Content Intent를 켭니다.",
          "슬래시 명령, 버튼, 모달 중심으로만 쓴다면 Message Content Intent 없이도 동작해야 합니다.",
          "설정을 바꾼 뒤 봇을 재시작하고 테스트 채널에서 멘션 질문과 슬래시 명령을 각각 확인합니다.",
        ],
      },
      {
        type: "callout",
        title: "Manage Webhooks는 채널 AI 프로필 표시용입니다",
        text: "채널별 AI 이름이나 아이콘으로 답변하려면 Manage Webhooks 권한이 필요합니다. 이 권한이 없어도 질문 처리는 계속하고, 답변은 기본 봇 이름으로 보내는 폴백이 원칙입니다.",
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "채널 권한이 더 우선입니다",
        text: "서버 역할 권한이 맞아도 특정 채널에서 권한이 거부되어 있으면 NEXA가 응답하지 못할 수 있습니다.",
      },
      {
        type: "links",
        title: "권한 문제를 더 확인하기",
        links: [
          {
            href: "https://support.yeon.world/nexa/troubleshooting/bot-not-responding",
            label: "NEXA 봇이 응답하지 않을 때 확인할 5가지",
          },
          {
            href: "https://support.yeon.world/nexa/guides/exclude-channel",
            label: "AI가 답변하면 안 되는 채널을 제외하는 법",
          },
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "troubleshooting",
    slugSegments: ["nexa", "troubleshooting", "bot-not-responding"],
    title: "NEXA 봇이 응답하지 않을 때 확인할 5가지",
    description:
      "NEXA 봇이 디스코드 채널에서 응답하지 않을 때 서버 권한, 채널 권한, 명령어, 상태, 설치 흐름을 순서대로 점검합니다.",
    summary: "응답 없음 문제를 권한, 채널, 명령어, 상태 순서로 좁혀갑니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.nexa,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/docs/FAQ.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/BOT_PERMISSIONS.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "응답 없음 문제는 대부분 봇이 채널을 볼 수 없거나 메시지를 보낼 수 없을 때 발생합니다. 먼저 서버 전체 문제가 아니라 특정 채널 문제인지 확인하는 것이 빠릅니다.",
      },
      {
        type: "steps",
        items: [
          "다른 테스트 채널에서 같은 질문을 보내 봅니다.",
          "NEXA 봇 역할에 View Channel과 Send Messages 권한이 있는지 확인합니다.",
          "해당 채널의 권한 덮어쓰기에서 봇 역할이 차단되어 있지 않은지 확인합니다.",
          "slash command를 쓰는 경우 Use Slash Commands 권한을 확인합니다.",
          "설치 페이지 또는 공지에서 현재 서비스 상태나 업데이트 안내가 있는지 확인합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "가장 먼저 볼 지점",
        text: "한 채널에서만 응답하지 않는다면 서버 문제가 아니라 채널 권한 문제일 가능성이 큽니다.",
      },
      {
        type: "callout",
        title: "답변은 오는데 이름이나 아이콘만 다르면",
        text: "채널 AI 이름/아이콘 표시에는 Manage Webhooks 권한이 필요합니다. 이 권한이 없으면 Provider 처리 결과를 버리지 않고 기본 봇 메시지로 보내는 것이 정상 폴백입니다.",
      },
      {
        type: "links",
        title: "함께 볼 NEXA 문서",
        links: [
          {
            href: "https://support.yeon.world/nexa/guides/discord-bot-permissions",
            label: "NEXA 봇에게 필요한 디스코드 권한",
          },
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.typing,
    category: "getting-started",
    slugSegments: ["typing", "getting-started", "start-typing-practice"],
    title: "typing.yeon.world에서 타자연습을 시작하는 방법",
    description:
      "YEON 타자연습에서 바로 연습을 시작하고 방, 덱, 결과 화면을 확인하는 기본 순서입니다.",
    summary:
      "타자 서비스 홈에서 연습으로 들어가고 결과를 확인하는 흐름을 정리합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.typing,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/platform-services.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/app/typing-service",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON 타자연습은 로그인 없이도 바로 시작할 수 있는 공개 서비스입니다. 방 목록, 연습 덱, 실시간 레이스 화면을 목적에 맞게 선택하면 됩니다.",
      },
      {
        type: "steps",
        items: [
          "typing.yeon.world를 엽니다.",
          "혼자 연습하려면 연습 또는 덱 화면으로 이동합니다.",
          "다른 사람과 함께하려면 방 목록에서 참여할 방을 찾습니다.",
          "방을 직접 만들 경우 제목과 사용할 문단을 확인합니다.",
          "레이스 화면에 들어가면 준비 상태와 입력창을 확인합니다.",
          "결과 화면에서 속도와 정확도를 확인합니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "방 화면이 열리지 않으면 새로고침 후 다시 들어갑니다.",
          "실시간 연결이 계속 실패하면 잠시 뒤 다시 시도합니다.",
          "타자방과 레이스 화면은 race-server 연결 상태를 함께 확인합니다.",
          "문단이 보이지 않으면 다른 덱을 선택합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.card,
    category: "guides",
    slugSegments: ["card", "guides", "create-flashcard-deck"],
    title: "card.yeon.world에서 플래시카드 덱을 만드는 방법",
    description:
      "YEON 플래시카드에서 덱을 만들고 카드를 추가한 뒤 학습을 시작하는 기본 순서입니다.",
    summary: "덱 생성, 카드 추가, 학습 시작까지 한 흐름으로 정리합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.card,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/platform-services.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/app/card-service",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON 플래시카드는 덱을 먼저 만들고 그 안에 앞면과 뒷면 카드를 추가하는 방식으로 사용합니다. 로그인 상태에 따라 저장 범위가 달라질 수 있으므로 중요한 덱은 계정 상태를 먼저 확인하는 것이 좋습니다.",
      },
      {
        type: "steps",
        items: [
          "card.yeon.world를 엽니다.",
          "덱 목록에서 새 덱 만들기 흐름으로 들어갑니다.",
          "덱 제목과 설명을 입력합니다.",
          "카드 추가 화면에서 앞면 질문과 뒷면 답변을 입력합니다.",
          "필요한 카드를 모두 추가한 뒤 덱 상세 화면으로 돌아갑니다.",
          "학습 시작 버튼으로 복습을 시작합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "중요한 덱은 로그인 상태를 확인하세요",
        text: "게스트 상태에서 만든 데이터는 기기와 브라우저 상태에 영향을 받을 수 있습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.community,
    category: "guides",
    slugSegments: ["community", "guides", "write-community-post"],
    title: "community.yeon.world에서 커뮤니티 글을 쓰는 방법",
    description:
      "YEON 커뮤니티에서 글을 작성하고 댓글 흐름을 확인하는 기본 사용 방법입니다.",
    summary:
      "커뮤니티 글 작성 전 확인할 공개성, 제목, 본문, 댓글 흐름을 정리합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.community,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/platform-services.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/app/community",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON 커뮤니티는 글과 댓글, 실시간 흐름을 함께 제공하는 공개 서비스입니다. 작성 전에는 글이 다른 사용자에게 보일 수 있다는 점을 기준으로 제목과 본문을 정리하세요.",
      },
      {
        type: "steps",
        items: [
          "community.yeon.world를 엽니다.",
          "글 작성 버튼 또는 작성 영역으로 이동합니다.",
          "제목에는 질문이나 공유하려는 내용을 구체적으로 씁니다.",
          "본문에는 필요한 배경과 원하는 답변을 함께 적습니다.",
          "작성 전 개인정보나 민감한 내용이 들어가지 않았는지 확인합니다.",
          "글을 올린 뒤 댓글 알림이나 피드 상태를 확인합니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "개인정보를 올리지 않습니다.",
          "서비스 오류 신고는 재현 순서를 함께 적습니다.",
          "다른 사용자가 이해할 수 있게 제목을 구체적으로 씁니다.",
          "작성한 글과 댓글은 공개 피드에서 다른 사용자에게 보일 수 있습니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "faq",
    slugSegments: ["nexa", "faq", "free-plan-limit"],
    title: "NEXA 무료 플랜에서는 무엇까지 사용할 수 있나요?",
    description:
      "NEXA의 무료 사용 범위와 관리자 프리미엄 기능의 차이를 현재 공개 안내 기준으로 정리했습니다.",
    summary:
      "채널 AI, 기본 질문, Provider 참여는 무료 범위이고 서버별 고급 관리 기능은 프리미엄 범위입니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.nexa,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/i18n/messages.json",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/BETA.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "현재 NEXA 공개 안내 기준으로 채널 AI, 기본 질문, Provider 참여는 무료 범위로 안내됩니다. 서버 운영자가 더 세밀한 서버별 설정을 쓰려는 경우에만 관리자 프리미엄 기능이 분리됩니다.",
      },
      {
        type: "heading",
        title: "무료로 시작할 수 있는 것",
      },
      {
        type: "checklist",
        items: [
          "디스코드 서버에서 기본 질문을 보내고 답변을 받습니다.",
          "허용된 채널에서 채널 AI를 사용할 수 있습니다.",
          "Provider로 참여해 내 PC의 로컬 AI 자원을 기여할 수 있습니다.",
          "라이선스 상태와 사용량 같은 기본 정보를 확인할 수 있습니다.",
        ],
      },
      {
        type: "heading",
        title: "관리자 프리미엄으로 분리되는 것",
      },
      {
        type: "checklist",
        items: [
          "서버별 페르소나와 전역 프롬프트셋을 세밀하게 관리합니다.",
          "RAG 문서나 지식 소스를 서버 운영 목적에 맞게 관리합니다.",
          "프리셋 쓰기처럼 서버 운영자가 관리하는 고급 설정을 사용합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "최종 결제 조건은 설치 페이지에서 확인하세요",
        text: "가격, 체험 기간, 이벤트 무료 상태는 운영 정책에 따라 바뀔 수 있으므로 실제 결제나 라이선스 신청 전에는 NEXA 설치 페이지의 최신 안내를 확인해야 합니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "guides",
    slugSegments: ["nexa", "guides", "server-ai-tone"],
    title: "서버별 AI 말투를 설정하는 방법",
    description:
      "NEXA에서 서버 전체 말투와 채널별 AI 성격을 나누어 설정할 때 확인할 관리자 기준입니다.",
    summary:
      "전역 프롬프트셋은 서버 전체 기본 성격이고, 채널 AI는 채널마다 다른 말투와 목적을 지정합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 5,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.nexa,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/i18n/messages.json",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_USER_FLOWS.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_SAFETY_POLICY.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "NEXA의 서버별 말투 설정은 서버 관리자 중심 기능입니다. 서버 전체에 적용할 기본 성격은 전역 프롬프트셋으로 관리하고, 채널마다 다른 말투나 목적이 필요하면 채널 AI 설정을 사용합니다.",
      },
      {
        type: "heading",
        title: "설정할 때 나누어 볼 것",
      },
      {
        type: "checklist",
        items: [
          "서버 전체 기본 성격: 전역 프롬프트셋에서 관리합니다.",
          "채널별 말투와 목적: 채널 AI 설정에서 지정합니다.",
          "관리 권한: 서버 관리자만 서버 설정을 바꿀 수 있습니다.",
          "안전 기준: 모든 응답에는 NEXA 안전 지침이 우선 적용됩니다.",
        ],
      },
      {
        type: "heading",
        title: "권장 순서",
      },
      {
        type: "steps",
        items: [
          "서버에서 NEXA가 어떤 역할을 해야 하는지 먼저 정합니다.",
          "서버 전체 기본 성격을 한 문장으로 정리합니다.",
          "질문 채널, 공지 채널, 개발 채널처럼 목적이 다른 채널을 분리합니다.",
          "채널별 AI 설정에서 말투와 목적을 필요한 곳에만 지정합니다.",
          "테스트 질문을 보내 실제 답변이 서버 분위기와 맞는지 확인합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "전역 설정을 너무 길게 쓰지 마세요",
        text: "말투 지시가 길수록 운영자가 의도한 핵심이 흐려질 수 있습니다. 서버 전체 기본값은 짧게 두고, 세부 목적은 채널별 설정으로 나누는 편이 관리하기 쉽습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "guides",
    slugSegments: ["nexa", "guides", "exclude-channel"],
    title: "AI가 답변하면 안 되는 채널을 제외하는 법",
    description:
      "NEXA가 허용된 채널에서만 답변하도록 채널 AI 허용 상태와 디스코드 권한을 함께 점검하는 방법입니다.",
    summary:
      "채널 AI 허용 목록과 채널 권한을 함께 관리해 NEXA가 답하면 안 되는 채널을 막습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.nexa,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/i18n/messages.json",
      "/Users/osuma/coding_stuffs/discord-assitant/provider-agent/src/provider_agent/guild_policy.py",
    ],
    body: [
      {
        type: "paragraph",
        text: "NEXA는 서버 관리자가 허용한 채널에서만 AI가 답변하도록 운영할 수 있습니다. 답변을 막고 싶은 채널은 채널 AI 허용 상태와 디스코드 채널 권한을 함께 확인해야 합니다.",
      },
      {
        type: "steps",
        items: [
          "서버 설정 또는 NEXA 관리 화면에서 채널별 AI 허용 항목을 엽니다.",
          "AI가 답변하면 안 되는 채널을 허용 목록에서 끕니다.",
          "해당 채널의 디스코드 권한에서 NEXA 역할이 메시지를 보낼 수 있는지 확인합니다.",
          "완전히 차단해야 하는 채널은 Send Messages 권한도 거부합니다.",
          "테스트 메시지를 보내 NEXA가 응답하지 않는지 확인합니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "허용된 채널에서만 AI가 답해야 합니다.",
          "채널 권한 덮어쓰기가 서버 역할 권한보다 우선할 수 있습니다.",
          "응답 금지 채널과 단순 비활성 채널을 운영 문서에 구분해 두면 나중에 혼동이 줄어듭니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "권한 차단은 강한 조치입니다",
        text: "채널 AI 허용 상태만 끄면 운영 의도가 분명하고, 디스코드 권한까지 막으면 봇의 다른 기능도 제한될 수 있습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "guides",
    slugSegments: ["nexa", "guides", "remove-nexa-discord-bot"],
    title: "NEXA 봇을 서버에서 제거하는 방법",
    description:
      "디스코드 서버에서 NEXA 봇을 제거하기 전 확인할 설정, Provider 연결, 권한 정리 순서입니다.",
    summary:
      "서버 관리자 권한으로 봇을 제거하고, Provider 연결과 남은 역할/채널 설정을 함께 정리합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.nexa,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/README.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_USER_FLOWS.md",
      "/Users/osuma/coding_stuffs/discord-assitant/i18n/messages.json",
    ],
    body: [
      {
        type: "paragraph",
        text: "NEXA를 더 이상 사용하지 않는다면 먼저 서버에서 실제로 어떤 기능을 쓰고 있었는지 확인하세요. Provider Pool, 채널 AI, RAG 문서, 프리셋을 사용했다면 봇 제거 전 운영자에게 공지하는 것이 좋습니다.",
      },
      {
        type: "steps",
        items: [
          "디스코드 서버에서 서버 관리자 권한이 있는 계정으로 접속합니다.",
          "서버 설정의 앱/통합 또는 멤버 목록에서 NEXA 봇을 찾습니다.",
          "NEXA 봇을 서버에서 제거합니다.",
          "NEXA 전용 역할이나 자동 생성 채널이 남아 있다면 더 이상 필요 없는지 확인한 뒤 정리합니다.",
          "Provider로 참여하던 사용자가 있다면 데스크톱 앱에서 해당 서버 연결을 정리하도록 안내합니다.",
          "다시 사용할 가능성이 있으면 기존 운영 문서와 설정 의도를 남겨 둡니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "제거 후에도 디스코드 메시지는 서버에 남을 수 있습니다",
        text: "봇을 제거해도 기존 채널에 남아 있는 메시지는 디스코드 서버 데이터입니다. 필요한 경우 서버 관리자가 별도로 메시지를 정리해야 합니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "policy",
    slugSegments: ["account", "policy", "privacy-conversation-data"],
    title: "YEON 개인정보와 대화 데이터 처리 방법",
    description:
      "YEON 계정, 공개 커뮤니티, 플래시카드, NEXA 대화 데이터에서 사용자가 확인해야 할 개인정보 기준입니다.",
    summary:
      "로그인 정보는 식별과 세션 유지에 쓰고, 공개 글과 NEXA 질문에는 민감정보를 넣지 않는 것이 기본입니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 5,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/site-brand.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/platform-services.ts",
      "/Users/osuma/coding_stuffs/discord-assitant/i18n/messages.json",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_SAFETY_POLICY.md",
      "/Users/osuma/coding_stuffs/discord-assitant/README.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON은 서비스별로 필요한 데이터가 다릅니다. 계정 로그인, 공개 커뮤니티 글, 플래시카드 학습 데이터, NEXA 대화 데이터는 같은 개인정보 기준 안에서 구분해 봐야 합니다.",
      },
      {
        type: "heading",
        title: "서비스별 데이터 원칙",
      },
      {
        type: "checklist",
        items: [
          "Google 로그인 이름, 이메일, 프로필 이미지는 회원 식별과 로그인 유지에 사용합니다.",
          "플래시카드 게스트 데이터는 현재 브라우저 로컬 저장소에 의존할 수 있습니다.",
          "커뮤니티 글과 댓글은 공개 피드에서 다른 사용자에게 보일 수 있습니다.",
          "NEXA 질문은 Provider PC로 전송될 수 있으므로 민감정보를 입력하지 않는 것이 원칙입니다.",
          "NEXA 대화 원문은 무저장/무로깅 원칙으로 다룹니다.",
        ],
      },
      {
        type: "heading",
        title: "사용자가 지켜야 할 것",
      },
      {
        type: "steps",
        items: [
          "비밀번호, API 키, 인증 토큰을 글이나 질문에 넣지 않습니다.",
          "개인 주민번호, 주소, 전화번호 같은 개인정보를 넣지 않습니다.",
          "회사 내부 문서나 비공개 자료를 그대로 붙여넣지 않습니다.",
          "민감한 내용이 필요하면 공개 가능한 범위로 요약해 질문합니다.",
        ],
      },
      {
        type: "callout",
        title: "공개 글과 디스코드 메시지는 별도입니다",
        text: "YEON이나 NEXA가 대화 원문을 보관하지 않는 원칙과 별개로, 사용자가 공개 커뮤니티나 디스코드 채널에 남긴 메시지는 해당 서비스 화면에 남아 있을 수 있습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "faq",
    slugSegments: ["nexa", "faq", "updates-notices"],
    title: "NEXA 업데이트와 공지는 어디서 확인하나요?",
    description:
      "NEXA의 공식 공지, 제품 업데이트, 사용법, 개발 글을 어떤 공개 채널에서 확인해야 하는지 정리했습니다.",
    summary:
      "공식 소식은 news, 사용법은 support, 제작 과정과 기술 글은 blog에서 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.nexa,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/public-content/public-content-data.ts",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/BETA.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON은 공개 콘텐츠를 목적별로 나눕니다. NEXA를 실제로 쓰는 방법은 support에서 보고, 제품 변경과 공지는 news에서 확인하며, 기술적 배경이나 제작 과정은 blog에서 읽는 구조입니다.",
      },
      {
        type: "heading",
        title: "채널별 확인 위치",
      },
      {
        type: "checklist",
        items: [
          "support.yeon.world: NEXA 사용법, 문제 해결, FAQ, 정책 안내",
          "news.yeon.world: 공식 공지, 제품 업데이트, 업계 뉴스 해설",
          "blog.yeon.world: 개발기, 기술 선택, 제품 제작 과정",
          "discord-ai.yeon.world: 설치와 제품 진입점",
        ],
      },
      {
        type: "heading",
        title: "확인 순서",
      },
      {
        type: "steps",
        items: [
          "설치나 사용 중 문제가 생기면 support에서 관련 가이드를 먼저 찾습니다.",
          "새 기능이나 변경사항이 궁금하면 news의 NEXA 업데이트를 확인합니다.",
          "왜 그렇게 만들었는지 알고 싶으면 blog의 engineering 또는 product 글을 확인합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "guides",
    slugSegments: ["nexa", "guides", "connect-ollama-provider"],
    title: "내 컴퓨터의 Ollama를 NEXA Provider로 연결하는 방법",
    description:
      "NEXA Provider로 참여하기 전에 Ollama, 모델, provider-agent, Discord 승인 토큰을 순서대로 확인하는 가이드입니다.",
    summary:
      "Ollama는 localhost 전용으로 두고, Discord에서 provider 참여 승인을 받은 뒤 provider-agent로 연결합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 5,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.nexa,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/README.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/FAQ.md",
      "/Users/osuma/coding_stuffs/discord-assitant/provider-agent/README.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "NEXA Provider는 내 컴퓨터의 로컬 AI 실행 환경을 Discord 서버의 질문 처리에 기여하는 역할입니다. 기본 경로는 Discord 봇, 중앙 서버, 인증된 provider-agent, localhost Ollama 순서로 이어집니다.",
      },
      {
        type: "heading",
        title: "연결 전 확인할 것",
      },
      {
        type: "checklist",
        items: [
          "Ollama가 설치되어 있고 사용할 모델을 받을 수 있습니다.",
          "Ollama는 기본 localhost 전용으로 둡니다.",
          "Discord 서버에서 provider 참여가 허용되어 있습니다.",
          "provider-agent를 실행할 컴퓨터가 절전 상태로 들어가지 않게 준비합니다.",
          "토큰은 노출되면 안 되므로 채팅이나 공개 문서에 붙여넣지 않습니다.",
        ],
      },
      {
        type: "heading",
        title: "연결 순서",
      },
      {
        type: "steps",
        items: [
          "Ollama를 설치하고 사용할 모델을 내려받습니다.",
          "Discord 서버에서 provider 참여 명령을 실행합니다.",
          "관리자 승인이 필요한 서버라면 승인 완료 안내를 기다립니다.",
          "발급된 토큰과 relay 주소를 provider-agent에 입력합니다.",
          "provider-agent에서 Ollama 연결 자가 점검을 실행합니다.",
          "Discord에서 간단한 질문을 보내 Provider Pool을 통해 응답이 오는지 확인합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "Ollama를 외부에 직접 열지 마세요",
        text: "NEXA 구조에서는 외부 사용자가 내 Ollama에 직접 접근하지 않습니다. provider-agent가 인증된 연결로 중앙 서버에 붙고, Ollama는 기본 localhost 전용으로 두는 것이 안전한 기본값입니다.",
      },
      {
        type: "links",
        title: "함께 볼 NEXA 문서",
        links: [
          {
            href: "https://support.yeon.world/nexa/faq/provider-pool-how-it-works",
            label: "NEXA Provider Pool은 어떻게 작동하나요?",
          },
          {
            href: "https://support.yeon.world/account/policy/privacy-conversation-data",
            label: "개인정보와 대화 데이터는 어떻게 처리되나요?",
          },
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "guides",
    slugSegments: ["nexa", "guides", "install-provider-agent-safely"],
    title: "NEXA provider-agent를 안전하게 설치하는 방법",
    description:
      "provider-agent 설치 전 확인할 공식 배포 경로, 토큰 보관, 기본 한도, localhost Ollama 원칙을 정리했습니다.",
    summary:
      "공식 설치 경로를 사용하고 토큰을 보호하며, 기본 한도와 Ollama localhost 원칙을 유지합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 5,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.nexa,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/SECURITY.md",
      "/Users/osuma/coding_stuffs/discord-assitant/provider-agent/packaging/README.md",
      "/Users/osuma/coding_stuffs/discord-assitant/provider-agent/README.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "provider-agent는 내 컴퓨터에서 실행되어 NEXA 중앙 서버와 로컬 Ollama 사이를 연결합니다. 설치할 때는 실행 파일 출처, 토큰 보관, 네트워크 기본값을 함께 확인해야 합니다.",
      },
      {
        type: "steps",
        items: [
          "NEXA 설치 페이지나 공식 저장소에서 안내하는 배포 경로만 사용합니다.",
          "설치 파일이나 패키지 관리자가 제공하는 검증 절차를 확인합니다.",
          "Discord에서 받은 provider 토큰은 본인 컴퓨터의 agent 설정에만 입력합니다.",
          "기본 하루 처리 한도와 동시 처리 한도를 확인합니다.",
          "Ollama가 localhost로만 열려 있는지 확인합니다.",
          "설치 후 자가 점검으로 Ollama 연결과 중앙 서버 연결 상태를 확인합니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "공유 컴퓨터에서는 provider-agent를 켜 두지 않습니다.",
          "토큰을 스크린샷, 채팅, 이슈에 올리지 않습니다.",
          "무제한 처리 옵션은 운영 의도를 이해한 뒤에만 사용합니다.",
          "원격 Ollama 연결은 위험을 알고 명시적으로 허용할 때만 사용합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "토큰은 비밀번호처럼 다룹니다",
        text: "Provider 토큰은 내 agent가 서버에 연결하는 인증 정보입니다. 유출되면 즉시 서버 관리자에게 알리고 기존 연결을 폐기해야 합니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "faq",
    slugSegments: ["nexa", "faq", "provider-pool-how-it-works"],
    title: "NEXA Provider Pool 질문 처리 방식 확인 방법",
    description:
      "Discord 질문이 중앙 서버를 거쳐 provider-agent와 로컬 Ollama로 전달되는 기본 흐름을 초보자용으로 설명합니다.",
    summary:
      "사용자는 Discord에서 질문하고, 중앙 서버가 Provider Pool에서 가능한 provider를 골라 로컬 Ollama 실행 결과를 돌려받습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.nexa,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/README.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/adr/0003-community-provider-pool.md",
      "/Users/osuma/coding_stuffs/discord-assitant/specs/product-v2/README.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "Provider Pool은 Discord 사용자의 질문을 중앙 서버가 받아, 참여 중인 provider의 로컬 AI 실행 환경으로 안전하게 중계하는 구조입니다. 사용자는 provider PC에 직접 접속하지 않고, provider도 Discord 사용자 정보를 직접 관리하지 않습니다.",
      },
      {
        type: "heading",
        title: "기본 흐름",
      },
      {
        type: "steps",
        items: [
          "사용자가 Discord에서 질문을 보냅니다.",
          "NEXA 중앙 서버가 서버 정책과 사용량 제한을 확인합니다.",
          "온라인 provider 중 처리 가능한 연결을 고릅니다.",
          "인증된 WebSocket 연결을 통해 provider-agent로 요청을 전달합니다.",
          "provider-agent가 localhost Ollama에 요청을 보내고 응답을 받습니다.",
          "중앙 서버가 결과를 Discord 채널에 다시 보냅니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "금전 거래나 판매 구조가 아니라 기여 기반 구조입니다.",
          "provider는 일시정지하거나 떠날 수 있습니다.",
          "서버 관리자는 허용 채널, 역할, 한도 같은 정책을 관리합니다.",
          "질문에는 비밀번호, 토큰, 개인정보를 넣지 않는 것이 기본 원칙입니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "policy",
    slugSegments: ["nexa", "policy", "admin-safety-controls"],
    title: "NEXA 관리자 정책과 안전장치 확인 방법",
    description:
      "NEXA 서버 관리자가 채널, 역할, Provider Pool, 콘텐츠 안전 기준을 운영할 때 확인할 책임과 안전장치입니다.",
    summary:
      "서버 관리자는 사용 채널과 역할 정책을 정하고, NEXA는 불법 red-line, 신고 대응, 무저장 원칙 같은 기본 안전 기준을 둡니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 5,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.nexa,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_SAFETY_POLICY.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/PROVIDER_SAFETY_POLICY.md",
      "/Users/osuma/coding_stuffs/discord-assitant/SECURITY.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "NEXA는 Discord 서버 안에서 쓰이는 중개형 AI 서비스입니다. 서버 관리자는 어떤 채널에서 어떤 역할이 AI를 쓰는지 정해야 하고, NEXA는 불법 콘텐츠, 신고 대응, 개인정보 최소화 같은 기본 안전 기준을 유지해야 합니다.",
      },
      {
        type: "heading",
        title: "관리자가 정해야 하는 것",
      },
      {
        type: "checklist",
        items: [
          "AI가 답변해도 되는 채널과 답변하면 안 되는 채널을 구분합니다.",
          "provider 참여를 허용할 역할과 승인 절차를 정합니다.",
          "서버별 말투, 프롬프트, RAG 문서의 책임자를 정합니다.",
          "신고가 들어왔을 때 확인할 관리자와 처리 기준을 정합니다.",
        ],
      },
      {
        type: "heading",
        title: "NEXA가 기본으로 지키는 원칙",
      },
      {
        type: "checklist",
        items: [
          "불법 콘텐츠와 미성년 성적물 같은 red-line은 관리자 설정과 무관하게 금지합니다.",
          "질문과 답변 원문은 저장하지 않는 무저장/무로깅 원칙을 둡니다.",
          "provider-agent는 원문 프롬프트를 파일이나 로그에 보존하지 않는 방향으로 운영합니다.",
          "Discord ToS와 서버 운영 정책을 함께 지키는 것을 전제로 합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "법률 검토가 필요한 영역",
        text: "CSAM 같은 명백한 불법 콘텐츠 대응은 출시 전 법률 검토가 필요한 영역입니다. 이 문서는 운영 설계 기준이며 법률 자문이 아닙니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.typing,
    category: "guides",
    slugSegments: ["typing", "guides", "change-practice-deck"],
    title: "타자연습에서 연습 덱을 바꾸는 방법",
    description:
      "YEON 타자연습에서 한국어와 영어 연습 덱을 바꾸고, 덱 API가 실패할 때 기본 문장으로 대체되는 흐름을 설명합니다.",
    summary:
      "언어별 선택 덱, 기본 로컬 문장, 원격 덱 목록, 연습 결과 확인 흐름을 한 번에 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.typing,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/use-typing-settings.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/typing-race-solo-screen.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/app/typing-service/practice/page.tsx",
    ],
    body: [
      {
        type: "paragraph",
        text: "타자연습은 언어별로 선택한 덱을 기억합니다. 한국어는 기본 타자 문장, 영어는 Default local passages를 기본값으로 두고, 공개 덱이나 사용자 덱을 불러올 수 있으면 목록에 함께 표시합니다.",
      },
      {
        type: "heading",
        title: "연습 덱을 바꾸는 순서",
      },
      {
        type: "steps",
        items: [
          "typing.yeon.world에서 연습 화면으로 이동합니다.",
          "현재 언어가 한국어인지 영어인지 확인합니다.",
          "덱 선택 영역에서 사용할 덱을 고릅니다.",
          "선택한 덱에 문장이 있으면 해당 문장으로 연습을 시작합니다.",
          "덱 API를 사용할 수 없거나 문장이 비어 있으면 기본 문장으로 대체되는지 확인합니다.",
          "연습 후 속도와 정확도 결과를 확인합니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "한국어와 영어의 선택 덱은 따로 저장됩니다.",
          "기본 로컬 덱은 네트워크 없이도 사용할 수 있습니다.",
          "원격 덱이 실패하면 화면은 기본 문장으로 대체합니다.",
          "타자방에서 같은 덱으로 레이스를 진행하려면 race-server 연결도 필요합니다.",
          "연습 결과에는 속도와 정확도가 함께 표시됩니다.",
        ],
      },
      {
        type: "callout",
        title: "URL로 덱을 지정할 수 있습니다",
        text: "연습 경로는 deckId를 기준으로 덱 문장을 준비할 수 있습니다. 링크로 특정 덱 연습을 공유할 때는 해당 덱이 접근 가능한 상태인지 먼저 확인하세요.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.typing,
    category: "troubleshooting",
    slugSegments: ["typing", "troubleshooting", "race-room-connection-failed"],
    title: "타자방에 접속되지 않을 때 확인할 것",
    description:
      "YEON 타자방 목록에 방이 보이지 않거나 실시간 방 접속이 실패할 때 확인할 공개방 상태, 참가자 수, 레이스 서버 연결 기준입니다.",
    summary:
      "대기 중인 공개방인지, 참가자가 있는지, 레이스 서버 연결과 재시도 흐름이 정상인지 순서대로 봅니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.typing,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/typing-service-fetch.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/use-race-room.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/typing-room-screen.tsx",
    ],
    body: [
      {
        type: "paragraph",
        text: "타자방 목록은 모든 방을 그대로 보여주지 않습니다. 현재 대기 중이고, 활성 상태이며, 공개방이고, 참가자가 1명 이상 있는 방만 공개 목록에 표시합니다.",
      },
      {
        type: "steps",
        items: [
          "방 목록을 새로고침하고 공개방이 표시되는지 확인합니다.",
          "방이 이미 시작되었거나 종료된 상태가 아닌지 확인합니다.",
          "참가자가 없는 빈 방은 공개 대기 목록에서 보이지 않을 수 있습니다.",
          "브라우저가 레이스 서버에 연결하는 동안 잠시 기다립니다.",
          "오프라인 또는 연결 실패 안내가 나오면 재연결 버튼으로 다시 시도합니다.",
          "계속 실패하면 새 방을 만들거나 잠시 뒤 다시 들어갑니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "로그인 토큰 실패가 항상 입장 실패는 아닙니다",
        text: "레이스 사용자 토큰 발급은 best-effort로 처리됩니다. 토큰이 없으면 경험치 적립이 빠질 수 있지만, 레이스 진행 자체를 막지는 않도록 설계되어 있습니다.",
      },
      {
        type: "checklist",
        items: [
          "방 상태가 WAITING입니다.",
          "방 lifecycle이 ACTIVE입니다.",
          "방 visibility가 PUBLIC입니다.",
          "현재 참가자 수가 1명 이상입니다.",
          "브라우저가 NEXT_PUBLIC_RACE_SERVER_URL 또는 기본 2567 race-server에 연결할 수 있습니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.card,
    category: "guides",
    slugSegments: ["card", "guides", "merge-guest-decks-after-login"],
    title: "로그인 전에 만든 플래시카드 덱을 계정에 추가하는 방법",
    description:
      "게스트 상태에서 만든 YEON 플래시카드 덱을 로그인 후 계정 덱으로 가져오는 이관 흐름과 확인 항목입니다.",
    summary:
      "로그인 후 게스트 덱이 있으면 계정에 추가하는 안내가 열리고, 이관 뒤 다른 기기에서도 같은 덱을 볼 수 있습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.card,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/use-card-service-decks-screen-state.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/components/merge-guest-dialog.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/guest-card-service-store.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "로그인 전에 만든 플래시카드 덱은 브라우저의 게스트 저장소에 남아 있을 수 있습니다. 로그인한 상태에서 게스트 덱이 발견되면 계정에 추가할지 묻는 창이 열립니다.",
      },
      {
        type: "steps",
        items: [
          "게스트 상태에서 덱과 카드를 만듭니다.",
          "같은 브라우저에서 로그인합니다.",
          "덱 목록 화면에 방금 만든 덱을 계정에 추가할지 묻는 창이 뜨는지 확인합니다.",
          "계정에 추가를 누릅니다.",
          "이관 완료 메시지에서 덱 개수와 카드 장수를 확인합니다.",
          "다른 기기에서도 같은 계정으로 로그인해 덱이 보이는지 확인합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "같은 브라우저에서 진행하세요",
        text: "게스트 덱은 로컬 저장소에 있기 때문에 다른 기기나 다른 브라우저로 바로 옮겨 보이지 않을 수 있습니다. 만든 브라우저에서 로그인 후 이관하는 것이 안전합니다.",
      },
      {
        type: "checklist",
        items: [
          "로그인 상태입니다.",
          "게스트 덱 개수가 1개 이상입니다.",
          "이관 창이 닫힌 뒤 덱 목록을 다시 확인합니다.",
          "이관 실패 메시지가 있으면 저장 공간 또는 브라우저 권한을 확인합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.card,
    category: "guides",
    slugSegments: ["card", "guides", "review-mode-shortcuts"],
    title: "플래시카드 복습 모드 단축키 사용하는 방법",
    description:
      "YEON 플래시카드 복습 모드에서 정답 보기, 어려움/보통/쉬움 채점, 스킵 단축키를 사용하는 방법입니다.",
    summary:
      "복습 모드는 Space로 정답을 보고, 1/2/3으로 채점하고, s로 스킵할 수 있습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.card,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/deck-play-screen.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/utils/card-review-shortcuts.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/utils/__tests__/card-review-shortcuts.test.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "플래시카드에는 일반 플래시카드 모드와 복습 모드가 있습니다. 일반 모드는 카드를 클릭하거나 Space 또는 Enter로 뒤집고, 복습 모드는 정답을 본 뒤 난이도를 기록하는 흐름입니다.",
      },
      {
        type: "heading",
        title: "복습 모드 단축키",
      },
      {
        type: "checklist",
        items: [
          "Space: 정답을 봅니다.",
          "1: 어려움으로 기록합니다.",
          "2: 보통으로 기록합니다.",
          "3: 쉬움으로 기록합니다.",
          "s: 현재 카드를 스킵합니다.",
        ],
      },
      {
        type: "steps",
        items: [
          "덱 학습 화면에서 복습 모드를 선택합니다.",
          "카드를 읽고 Space를 눌러 정답을 확인합니다.",
          "정답을 본 뒤 1, 2, 3 중 하나로 난이도를 기록합니다.",
          "지금 기록하지 않을 카드는 s로 건너뜁니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "입력칸에서는 단축키가 막힙니다",
        text: "링크, 버튼, 입력칸, 선택창, textarea, contenteditable 영역에서는 단축키가 실행되지 않게 막아 두었습니다. 한국어 입력 상태에서도 물리 S 키 스킵은 동작합니다.",
      },
      {
        type: "callout",
        title: "게스트와 로그인 사용자의 저장 범위가 다릅니다",
        text: "게스트 덱은 현재 브라우저 로컬 저장소에 의존하고, 로그인 덱은 계정에 연결됩니다. 복습 기록을 오래 유지하려면 로그인 상태를 확인하세요.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.community,
    category: "guides",
    slugSegments: ["community", "guides", "set-guest-nickname"],
    title: "커뮤니티 게스트 닉네임과 비밀번호를 설정하는 방법",
    description:
      "YEON 커뮤니티에서 게스트 닉네임을 바꾸고 글 수정·삭제용 비밀번호를 설정하는 방법입니다.",
    summary:
      "게스트 닉네임은 자동 생성되며 직접 바꿀 수 있고, 비밀번호는 글과 댓글 수정·삭제 확인에 사용됩니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.community,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/community-guest-identity.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/components/community-feed-forms.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/components/community-guest-identity-confirm-modal.tsx",
    ],
    body: [
      {
        type: "paragraph",
        text: "커뮤니티는 게스트도 글과 댓글을 남길 수 있게 닉네임을 자동 생성합니다. 기본 닉네임은 익명 뒤에 네 자리 숫자가 붙는 형식이며, 작성 영역에서 직접 바꿀 수 있습니다.",
      },
      {
        type: "steps",
        items: [
          "community.yeon.world를 엽니다.",
          "상단 또는 작성 영역의 게스트 닉네임 입력칸을 확인합니다.",
          "원하는 닉네임을 입력합니다.",
          "글 수정이나 삭제에 사용할 비밀번호를 입력합니다.",
          "글쓰기 버튼을 눌러 작성 패널을 엽니다.",
          "제목과 내용을 입력한 뒤 게시합니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "닉네임은 최대 40자까지 입력할 수 있습니다.",
          "비밀번호는 최대 128자까지 입력할 수 있습니다.",
          "비밀번호는 글과 댓글의 수정·삭제 확인에 사용됩니다.",
          "브라우저 저장소를 사용할 수 없으면 임시 닉네임이 생성됩니다.",
          "닉네임은 공개 글과 댓글에 함께 표시될 수 있습니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "비밀번호를 잊으면 수정이 어려울 수 있습니다",
        text: "게스트 글은 계정 로그인 기반이 아니므로, 작성할 때 사용한 닉네임과 비밀번호를 기억해야 나중에 수정하거나 삭제할 수 있습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.community,
    category: "troubleshooting",
    slugSegments: ["community", "troubleshooting", "post-or-reply-failed"],
    title: "커뮤니티 글이나 댓글 등록이 안 될 때 확인할 것",
    description:
      "YEON 커뮤니티에서 글 작성, 댓글 등록, 수정, 삭제가 실패할 때 입력 제한과 오류 메시지를 기준으로 확인하는 방법입니다.",
    summary:
      "제목과 본문 필수 입력, 글자 수 제한, 게스트 닉네임과 비밀번호, API 오류 메시지를 순서대로 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.community,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/components/community-feed-forms.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/chat-service-api.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/hooks/use-community-feed.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "커뮤니티 글과 댓글은 빈 내용으로 등록할 수 없습니다. 화면에 보이는 오류 문구가 있다면 먼저 그 문구를 기준으로 제목, 본문, 댓글 입력값을 확인하세요.",
      },
      {
        type: "steps",
        items: [
          "글 작성 시 제목과 내용을 모두 입력했는지 확인합니다.",
          "제목은 80자, 본문은 280자를 넘지 않았는지 확인합니다.",
          "댓글은 400자 안에 들어가는지 확인합니다.",
          "수정할 내용이 빈 값이 아닌지 확인합니다.",
          "게스트 글 수정·삭제라면 작성 때 사용한 닉네임과 비밀번호를 입력합니다.",
          "화면에 나온 오류 메시지를 확인한 뒤 다시 시도합니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "글 제목은 필수입니다.",
          "글 본문은 필수입니다.",
          "댓글 내용은 필수입니다.",
          "수정·삭제에는 게스트 확인 정보가 필요할 수 있습니다.",
          "요청 실패 시 API에서 내려온 메시지가 화면 오류로 표시됩니다.",
        ],
      },
      {
        type: "callout",
        title: "글과 댓글은 같은 feed API를 사용합니다",
        text: "글 등록은 /feed, 댓글 등록은 /feed/{postId}/replies 경로를 사용합니다. 둘 다 실패한다면 네트워크나 세션 상태도 함께 확인하세요.",
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "공개 피드 기준을 먼저 확인하세요",
        text: "커뮤니티 글과 댓글은 다른 사용자가 읽을 수 있는 공개 영역입니다. 개인정보, 비밀번호, 토큰, 타인을 공격하는 문장은 올리지 않습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.typing,
    category: "guides",
    slugSegments: ["typing", "guides", "join-typing-room"],
    title: "타자방에 입장하는 방법",
    description:
      "typing.yeon.world에서 공개 타자방을 찾고 race-server 연결 상태를 확인한 뒤 입장하는 순서입니다.",
    summary:
      "공개방, 입장 가능 상태, 참가자 수, race-server 연결을 확인하고 방에 들어갑니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.typing,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/typing-room-lobby-screen.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/use-race-room.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/typing-room-screen.tsx",
    ],
    body: [
      {
        type: "paragraph",
        text: "타자방은 혼자 연습과 달리 실시간 race-server 연결을 사용합니다. 방 목록에서 공개방을 고를 때는 입장 가능 상태와 남은 자리, 사용할 덱을 함께 확인하세요.",
      },
      {
        type: "steps",
        items: [
          "typing.yeon.world에서 방 목록으로 이동합니다.",
          "공개방 또는 입장 가능 필터를 선택합니다.",
          "방 제목, 남은 자리, 언어와 덱 정보를 확인합니다.",
          "입장할 방을 선택하고 레이스 화면으로 이동합니다.",
          "연결 상태가 connected로 바뀌고 대기 화면이 보이는지 확인합니다.",
          "준비 버튼이나 화면 안내에 따라 레이스 시작을 기다립니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "방이 만석이면 다른 방을 선택합니다.",
          "이미 시작된 방이면 새 방을 만들거나 다른 대기방을 찾습니다.",
          "race-server 연결 오류가 보이면 새로고침 후 다시 입장합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.typing,
    category: "troubleshooting",
    slugSegments: ["typing", "troubleshooting", "race-not-starting"],
    title: "타자 레이스가 시작되지 않을 때 해결 방법",
    description:
      "타자방에 들어갔지만 레이스가 시작되지 않을 때 준비 상태, 방장 시작, seed, race-server 연결을 확인하는 방법입니다.",
    summary:
      "참가자 준비, 방장 시작, 문장 seed, race-server 이벤트 수신 상태를 순서대로 좁혀갑니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.typing,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/typing-room-screen.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/typing-race-multiplayer-screen.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/use-race-room.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "타자 레이스가 시작되지 않는 문제는 준비 상태가 맞지 않거나, 방장이 시작하지 않았거나, race-server 이벤트가 끊겼을 때 생길 수 있습니다.",
      },
      {
        type: "steps",
        items: [
          "내 준비 상태가 켜져 있는지 확인합니다.",
          "다른 참가자도 준비 상태인지 확인합니다.",
          "방장 화면에서 시작 버튼이 눌렸는지 확인합니다.",
          "문장 seed 오류 안내가 있으면 다른 덱으로 바꿉니다.",
          "연결 상태가 disconnected 또는 error라면 재연결을 시도합니다.",
          "계속 시작되지 않으면 방을 나갔다가 새 공개방을 만듭니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "race-server 연결이 핵심입니다",
        text: "시작 이벤트는 race-server에서 내려옵니다. 화면만 열려 있고 연결이 끊긴 상태라면 레이스가 진행되지 않습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.typing,
    category: "troubleshooting",
    slugSegments: ["typing", "troubleshooting", "result-not-saved"],
    title: "타자 결과가 저장되지 않을 때 확인할 것",
    description:
      "타자 레이스 결과가 보이지 않거나 경험치가 반영되지 않을 때 로그인 토큰과 race-server 결과 이벤트를 확인하는 방법입니다.",
    summary:
      "레이스 결과 화면, 로그인 사용자 토큰, best-effort 경험치 적립, race-server finish 이벤트를 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.typing,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/use-race-room.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/typing-race-multiplayer-screen.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/race-server/src/rooms/typing-race-room-backend-client.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "타자 결과는 race-server가 finish 이벤트를 받고 결과 snapshot을 내려줄 때 화면에 표시됩니다. 로그인 사용자 경험치 적립은 별도 토큰 기반 best-effort 흐름입니다.",
      },
      {
        type: "steps",
        items: [
          "레이스를 끝까지 완료했는지 확인합니다.",
          "결과 화면에 순위, 속도, 정확도, 실수 수가 표시되는지 확인합니다.",
          "로그인 상태에서 진행했다면 새로고침 후 프로필 경험치가 반영되는지 확인합니다.",
          "로그인 토큰 발급이 실패했다면 레이스 진행은 되지만 경험치 적립은 빠질 수 있습니다.",
          "결과 화면 자체가 비어 있으면 race-server 연결이 끊겼는지 확인합니다.",
          "같은 문제가 반복되면 레이스 시간, 방 코드, 오류 화면을 기록해 신고합니다.",
        ],
      },
      {
        type: "callout",
        title: "비로그인도 레이스는 진행됩니다",
        text: "사용자 토큰은 경험치 적립에 필요하지만, 토큰이 없다고 해서 레이스 진행 자체를 막지는 않는 구조입니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.typing,
    category: "troubleshooting",
    slugSegments: ["typing", "troubleshooting", "site-not-opening"],
    title: "typing.yeon.world가 열리지 않을 때 해결 방법",
    description:
      "typing.yeon.world 접속이 되지 않을 때 브라우저, 네트워크, canonical URL, race-server 연결을 나누어 확인합니다.",
    summary: "사이트 접속 문제와 타자방 실시간 연결 문제를 분리해 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.typing,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/subdomain-routing.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/platform-services.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/use-race-room.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "typing.yeon.world가 열리지 않는 문제와 타자방 race-server 연결 실패는 다른 문제입니다. 먼저 웹 페이지가 열리는지 확인하고, 그 다음 실시간 방 연결을 확인하세요.",
      },
      {
        type: "steps",
        items: [
          "주소가 https://typing.yeon.world 인지 확인합니다.",
          "브라우저 새로고침 또는 시크릿 창에서 다시 엽니다.",
          "yeon.world에서 타자연습 링크를 눌러 같은 페이지로 이동되는지 확인합니다.",
          "페이지는 열리지만 방이 안 열리면 race-server 연결 상태를 확인합니다.",
          "다른 네트워크에서도 같은지 확인합니다.",
          "계속 실패하면 오류 화면과 시간을 기록해 신고합니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "웹 페이지가 아예 열리지 않는지 확인합니다.",
          "방 목록만 비어 있는지 확인합니다.",
          "방 입장 후 연결 오류인지 확인합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.card,
    category: "guides",
    slugSegments: ["card", "guides", "add-and-edit-cards"],
    title: "플래시카드 카드를 추가하고 수정하는 방법",
    description:
      "card.yeon.world에서 덱 안에 카드를 추가하고 기존 카드를 수정할 때 게스트 저장과 로그인 저장 차이를 확인합니다.",
    summary:
      "덱 상세에서 앞면과 뒷면을 입력하고, 게스트 데이터는 로컬 저장소에 의존한다는 점을 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.card,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/deck-detail-screen.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/hooks/use-card-mutations.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/guest-card-service-store.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "플래시카드 카드는 덱 안에 앞면과 뒷면을 넣어 만듭니다. 게스트 상태라면 현재 브라우저 로컬 저장소에 저장되고, 로그인 상태라면 계정 덱으로 관리됩니다.",
      },
      {
        type: "steps",
        items: [
          "card.yeon.world에서 덱 목록을 엽니다.",
          "카드를 추가할 덱을 선택합니다.",
          "카드 추가 영역에서 앞면 질문과 뒷면 답변을 입력합니다.",
          "저장 후 카드 목록에 새 카드가 보이는지 확인합니다.",
          "수정할 카드를 열고 내용을 바꾼 뒤 저장합니다.",
          "게스트 상태라면 같은 브라우저에서 다시 열어 변경이 남아 있는지 확인합니다.",
        ],
      },
      {
        type: "callout",
        title: "게스트 데이터는 기기에 묶입니다",
        text: "게스트로 만든 카드는 다른 기기에서 자동으로 보이지 않습니다. 여러 기기에서 이어 쓰려면 로그인 후 계정 덱으로 관리하세요.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.card,
    category: "guides",
    slugSegments: ["card", "guides", "start-card-study"],
    title: "플래시카드 학습을 시작하는 방법",
    description:
      "card.yeon.world에서 덱을 고르고 플래시카드 또는 복습 모드로 학습을 시작하는 기본 흐름입니다.",
    summary:
      "덱 상세에서 학습을 시작하고, 게스트와 로그인 사용자의 저장 범위를 구분합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.card,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/deck-play-screen.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/card-service-decks-screen.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/guest-card-service-store.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "플래시카드 학습은 덱을 선택한 뒤 카드 앞면을 보고 정답을 확인하는 흐름입니다. 복습 모드를 쓰면 쉬움, 보통, 어려움 같은 기록을 남길 수 있습니다.",
      },
      {
        type: "steps",
        items: [
          "card.yeon.world에서 덱 목록을 엽니다.",
          "학습할 덱을 선택합니다.",
          "덱에 카드가 1장 이상 있는지 확인합니다.",
          "학습 시작 또는 복습 모드를 선택합니다.",
          "카드 앞면을 보고 답을 떠올린 뒤 정답을 확인합니다.",
          "복습 모드에서는 난이도를 선택해 다음 학습 기준을 남깁니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "게스트 덱은 현재 브라우저에 저장됩니다.",
          "로그인 덱은 계정에 연결됩니다.",
          "덱에 카드가 없으면 먼저 카드를 추가해야 합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.card,
    category: "troubleshooting",
    slugSegments: ["card", "troubleshooting", "deck-data-not-visible"],
    title: "카드 데이터가 보이지 않을 때 확인할 것",
    description:
      "플래시카드 덱이나 카드가 보이지 않을 때 게스트 브라우저 저장소, 로그인 상태, 병합 흐름을 확인하는 방법입니다.",
    summary:
      "게스트 데이터와 로그인 계정 데이터를 구분하고, 같은 브라우저에서 병합 흐름을 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.card,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/use-card-service-decks-screen-state.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/components/merge-guest-dialog.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/guest-card-service-store.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "카드 데이터가 보이지 않을 때는 먼저 게스트 데이터인지 로그인 계정 데이터인지 구분해야 합니다. 게스트 덱은 브라우저 로컬 저장소에 있고, 로그인 덱은 계정 기준으로 조회됩니다.",
      },
      {
        type: "steps",
        items: [
          "현재 로그인 상태인지 확인합니다.",
          "게스트로 만들었던 브라우저와 같은 브라우저인지 확인합니다.",
          "로그인 후 게스트 덱 병합 안내가 보이는지 확인합니다.",
          "계정 덱이 비어 있으면 수동 병합 버튼이나 안내를 확인합니다.",
          "브라우저 저장소를 지웠다면 게스트 덱이 사라졌을 수 있습니다.",
          "계속 보이지 않으면 덱 제목, 사용 기기, 로그인 계정을 기록해 신고합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "게스트 덱은 백업이 아닙니다",
        text: "게스트 덱은 빠른 시작용입니다. 중요한 학습 데이터는 로그인 후 계정 덱으로 옮기는 편이 안전합니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.card,
    category: "troubleshooting",
    slugSegments: ["card", "troubleshooting", "site-not-opening"],
    title: "card.yeon.world가 열리지 않을 때 해결 방법",
    description:
      "card.yeon.world 접속 문제를 브라우저, canonical URL, 로그인 상태, 게스트 저장소 문제로 나누어 확인합니다.",
    summary:
      "사이트 접속과 덱 데이터 표시 문제를 분리하고, 게스트와 로그인 사용자 차이를 함께 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.card,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/subdomain-routing.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/platform-services.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/auth-state.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "card.yeon.world 접속 실패와 카드 데이터가 비어 보이는 문제는 다릅니다. 먼저 사이트가 열리는지 확인하고, 그 다음 로그인 상태와 게스트 저장소를 확인하세요.",
      },
      {
        type: "steps",
        items: [
          "주소가 https://card.yeon.world 인지 확인합니다.",
          "브라우저 새로고침 또는 시크릿 창에서 다시 엽니다.",
          "yeon.world에서 플래시카드 링크를 눌러 이동되는지 확인합니다.",
          "사이트는 열리지만 덱이 없다면 로그인 상태를 확인합니다.",
          "게스트 덱은 만든 브라우저에서만 보일 수 있습니다.",
          "계속 실패하면 오류 화면과 시간을 기록해 신고합니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "페이지 접속 실패인지 확인합니다.",
          "로그인 세션 만료인지 확인합니다.",
          "게스트 저장소 문제인지 확인합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.community,
    category: "guides",
    slugSegments: ["community", "guides", "write-comment"],
    title: "커뮤니티에서 댓글을 남기는 방법",
    description:
      "community.yeon.world에서 게시글 댓글을 열고 게스트 닉네임과 비밀번호로 댓글을 남기는 방법입니다.",
    summary:
      "댓글 입력 전 공개성, 닉네임, 비밀번호, 수정·삭제 기준을 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.community,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/components/community-feed-post-item.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/community-post-detail-page.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/hooks/use-community-feed.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "커뮤니티 댓글은 공개 게시글 아래에 표시됩니다. 댓글을 남기기 전에는 다른 사용자가 읽을 수 있다는 점과 게스트 닉네임이 함께 표시된다는 점을 확인하세요.",
      },
      {
        type: "steps",
        items: [
          "community.yeon.world에서 댓글을 남길 글을 엽니다.",
          "댓글 영역을 펼칩니다.",
          "댓글 내용을 입력합니다.",
          "게스트 닉네임과 비밀번호가 필요한 경우 입력합니다.",
          "개인정보나 공격적인 표현이 없는지 확인합니다.",
          "댓글 버튼을 눌러 등록합니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "댓글은 공개 피드에 표시될 수 있습니다.",
          "비밀번호는 수정·삭제 확인에 쓰입니다.",
          "댓글은 400자 안에 작성합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.community,
    category: "troubleshooting",
    slugSegments: ["community", "troubleshooting", "post-not-visible"],
    title: "커뮤니티 글이 보이지 않을 때 확인할 것",
    description:
      "커뮤니티 글이 목록이나 상세에서 보이지 않을 때 공개 피드, 카테고리, 네트워크, 삭제 상태를 확인하는 방법입니다.",
    summary:
      "목록 새로고침, 카테고리, 상세 URL, 댓글 수, 공개 행동 기준을 함께 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.community,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/community-page.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/community-post-detail-page.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/hooks/use-community-feed.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "커뮤니티 글이 보이지 않을 때는 작성 실패인지, 목록 갱신 문제인지, 삭제된 글인지 나누어 봐야 합니다. 공개 피드는 네트워크 상태와 캐시 갱신의 영향을 받을 수 있습니다.",
      },
      {
        type: "steps",
        items: [
          "커뮤니티 목록을 새로고침합니다.",
          "글을 올린 카테고리가 맞는지 확인합니다.",
          "상세 URL을 알고 있다면 직접 열어 봅니다.",
          "작성 직후 오류 메시지가 없었는지 확인합니다.",
          "수정·삭제 과정에서 삭제된 글인지 확인합니다.",
          "계속 보이지 않으면 제목, 작성 시간, 닉네임을 기록해 신고합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "공개 기준을 위반한 글은 조치될 수 있습니다",
        text: "개인정보 노출, 타인 공격, 서비스 방해 목적의 글은 운영 기준에 따라 숨김이나 삭제 대상이 될 수 있습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.community,
    category: "troubleshooting",
    slugSegments: ["community", "troubleshooting", "site-not-opening"],
    title: "community.yeon.world가 열리지 않을 때 해결 방법",
    description:
      "community.yeon.world 접속 문제를 브라우저, canonical URL, 공개 피드 API, 게스트 저장소 상태로 나누어 확인합니다.",
    summary: "사이트 접속 실패와 글/댓글 로딩 실패를 분리해 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.community,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/subdomain-routing.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/platform-services.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/hooks/use-community-feed.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "community.yeon.world가 열리지 않는 문제와 글/댓글이 불러와지지 않는 문제는 다릅니다. 공개 피드가 보이지 않을 때도 먼저 페이지 접속 자체를 확인하세요.",
      },
      {
        type: "steps",
        items: [
          "주소가 https://community.yeon.world 인지 확인합니다.",
          "브라우저 새로고침 또는 시크릿 창에서 다시 엽니다.",
          "yeon.world에서 커뮤니티 링크를 눌러 이동되는지 확인합니다.",
          "페이지는 열리지만 글이 없으면 피드 오류 메시지를 확인합니다.",
          "댓글만 실패하면 해당 글 상세에서 다시 시도합니다.",
          "계속 실패하면 오류 화면과 시간을 기록해 신고합니다.",
        ],
      },
      {
        type: "checklist",
        items: [
          "공개 피드가 비어 있는지 확인합니다.",
          "글 작성 또는 댓글 작성만 실패하는지 확인합니다.",
          "게스트 닉네임 저장소 오류 안내가 있는지 확인합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.community,
    category: "policy",
    slugSegments: ["community", "policy", "usage-rules"],
    title: "커뮤니티 이용 정책과 행동 기준 확인 방법",
    description:
      "YEON 커뮤니티에서 공개 글과 댓글을 남길 때 지켜야 할 개인정보, 공격 표현, 신고 기준입니다.",
    summary:
      "공개 피드에서는 개인정보를 올리지 않고, 타인을 공격하지 않으며, 오류 신고는 재현 순서와 함께 남깁니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ...PUBLIC_CONTENT_SUPPORT_CTA_TARGETS.community,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/community-content.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/community-post-format.ts",
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON 커뮤니티는 타자연습과 플래시카드 사용자가 공개 글과 댓글로 소통하는 공간입니다. 게시 전에는 공개성과 다른 사용자의 안전을 먼저 확인해야 합니다.",
      },
      {
        type: "heading",
        title: "기본 행동 기준",
      },
      {
        type: "checklist",
        items: [
          "개인정보, 비밀번호, 토큰, 비공개 자료를 올리지 않습니다.",
          "타인을 공격하거나 괴롭히는 문장을 올리지 않습니다.",
          "서비스 오류 신고는 재현 순서와 화면 상태를 함께 적습니다.",
          "카테고리는 글 목적에 맞게 선택합니다.",
          "게스트 비밀번호는 수정·삭제 확인용으로 본인이 기억합니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "공개 피드입니다",
        text: "커뮤니티에 남긴 글과 댓글은 다른 사용자가 볼 수 있습니다. 운영자가 확인해야 하는 민감한 내용은 공개 글로 올리지 마세요.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "troubleshooting",
    slugSegments: ["account", "troubleshooting", "session-signed-out"],
    title: "YEON 로그인이 자꾸 풀릴 때 확인할 것",
    description:
      "YEON 서비스에서 다시 로그인하라는 화면이 반복될 때 주소, 브라우저 설정, 게스트 저장 차이를 확인하는 방법입니다.",
    summary:
      "다시 로그인하라는 화면이 반복될 때 공식 주소, 브라우저 설정, 게스트/계정 저장 차이를 확인합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/api-client.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/card-service-fetch.test.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/use-card-service-auth-state.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "로그인이 자꾸 풀리는 것처럼 보일 때는 먼저 접속 주소와 브라우저 설정을 확인합니다. 카드 서비스처럼 게스트 데이터와 계정 데이터가 따로 보이는 경우도 있어서, 단순히 저장된 내용이 사라진 것으로 보일 수 있습니다.",
      },
      {
        type: "steps",
        items: [
          "지금 주소가 yeon.world, typing.yeon.world, card.yeon.world, community.yeon.world 중 하나인지 확인합니다.",
          "새로고침 후에도 다시 로그인하라는 화면이 반복되는지 확인합니다.",
          "시크릿 모드이거나 브라우저가 사이트 데이터 저장을 막고 있지 않은지 확인합니다.",
          "card.yeon.world에서 덱이 사라진 것처럼 보이면 게스트 저장과 계정 저장 차이를 확인합니다.",
          "다른 브라우저나 기기에서 같은 계정으로 확인합니다.",
          "계속 반복되면 support 홈의 오류 신고 버튼으로 서비스 주소와 화면 상태를 보내 주세요.",
        ],
      },
      {
        type: "callout",
        title: "게스트 데이터와 계정 데이터는 다르게 보일 수 있습니다",
        text: "로그인해도 다른 브라우저에 있던 게스트 덱이 자동으로 계정 덱처럼 보이지 않을 수 있습니다. 저장 위치가 달라 보이는 문제와 로그인 유지 문제를 나누어 확인하세요.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "guides",
    slugSegments: ["account", "guides", "public-service-urls"],
    title: "YEON 서비스별 공개 URL과 접속 주소 확인 방법",
    description:
      "yeon.world, typing.yeon.world, card.yeon.world, community.yeon.world, discord-ai.yeon.world의 역할과 접속 주소입니다.",
    summary:
      "서비스별 canonical 공개 URL을 확인하고 support, news, blog 채널과 구분합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/platform-services.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/subdomain-routing.ts",
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON은 서비스별 공개 URL을 분리해 운영합니다. 검색이나 공유 링크를 만들 때는 내부 앱 경로보다 canonical 공개 URL을 우선 확인하세요.",
      },
      {
        type: "checklist",
        items: [
          "yeon.world: 전체 브랜드 허브",
          "typing.yeon.world: 타자연습 서비스",
          "card.yeon.world: 플래시카드 서비스",
          "community.yeon.world: 커뮤니티",
          "discord-ai.yeon.world: NEXA 디스코드 AI 어시스턴트",
          "support.yeon.world: 사용법과 문제 해결",
          "news.yeon.world: 공식 공지와 제품 업데이트",
          "blog.yeon.world: 개발기와 기술 글",
        ],
      },
      {
        type: "steps",
        items: [
          "사용할 서비스를 먼저 고릅니다.",
          "공유할 때는 해당 서비스의 공개 URL을 사용합니다.",
          "도움말은 support.yeon.world에서 찾습니다.",
          "제품 변경 공지는 news.yeon.world에서 확인합니다.",
          "기술 배경은 blog.yeon.world에서 확인합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "troubleshooting",
    slugSegments: ["account", "troubleshooting", "report-service-error"],
    title: "YEON 오류를 바로 신고하는 곳",
    description:
      "YEON 서비스에서 문제가 생겼을 때 support 홈의 오류 신고 버튼이나 공개 문의 이메일로 바로 보내는 방법입니다.",
    summary:
      "Support 홈의 오류 신고 버튼으로 바로 보내고, 서비스 주소와 화면 상태만 짧게 적어도 됩니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ctaLabel: "오류 신고하기",
    ctaHref: PUBLIC_CONTENT_ERROR_REPORT_MAILTO,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/site-brand.ts",
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-quality-checklist.md",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/platform-services.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "오류가 나면 support 홈의 오류 신고 버튼을 누르거나 공개 문의 이메일로 바로 보내 주세요. 긴 양식은 필요 없습니다. 어떤 서비스에서 무엇을 하다가 막혔는지만 알 수 있으면 확인을 시작할 수 있습니다.",
      },
      {
        type: "links",
        title: "신고 위치",
        links: [
          {
            href: PUBLIC_CONTENT_ERROR_REPORT_MAILTO,
            label: "오류 신고 이메일 열기",
          },
          {
            href: "https://support.yeon.world",
            label: "Support 홈에서 오류 신고 버튼 찾기",
          },
        ],
      },
      {
        type: "heading",
        title: "짧게 보내도 되는 내용",
      },
      {
        type: "checklist",
        items: [
          "문제가 난 서비스 주소",
          "무엇을 누른 뒤 어떤 화면이나 메시지가 나왔는지",
          "다시 연락받을 이메일",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "민감한 정보는 보내지 마세요",
        text: "비밀번호, 인증 코드, API 키, 결제 정보처럼 다른 사람이 알면 안 되는 내용은 신고 메일에 넣지 마세요. 화면 캡처는 도움이 되지만 필수는 아닙니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "notice",
    slugSegments: ["notice", "public-content-network-start"],
    affectedServiceLabel: "Support · News · Blog",
    title: "YEON 공개 콘텐츠 화면을 정리했습니다",
    description:
      "Support는 문제 해결, News는 실제 변경, Blog는 제작 기록만 보여주도록 공개 콘텐츠 목록을 정리했습니다.",
    summary:
      "안내성 글과 내부 운영 글은 피드에서 숨기고, 필요한 정보만 남겼습니다.",
    publishedAt: PUBLIC_CONTENT_EDITORIAL_UPDATE_DATE,
    updatedAt: PUBLIC_CONTENT_EDITORIAL_UPDATE_DATE,
    readingMinutes: 1,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/public-content/public-content-data.ts",
      "/Users/osuma/coding_stuffs/yeon/docs/product/backlog/2026-07-16-public-content-editorial-cleanup-2.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "2026년 7월 16일 공개 콘텐츠 화면을 정리했습니다. 사용법과 오류 해결은 Support에서, 실제 서비스 변경은 News에서, 구현 기록은 Blog에서 바로 찾을 수 있게 목록을 줄였습니다.",
      },
      {
        type: "heading",
        title: "바뀐 점",
      },
      {
        type: "checklist",
        items: [
          "Support 홈에서 채널 안내 공지를 빼고 검색, 서비스 선택, 문제 해결 문서만 남겼습니다.",
          "News 피드에서 내부 운영과 문서 홍보 성격의 글을 숨기고 실제 변경 공지만 남겼습니다.",
          "Blog 피드에서 채널 분리와 검색 운영 글을 빼고 서비스 구현 기록만 남겼습니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.note,
        title: "사용자 조치 없음",
        text: "기존 서비스 주소와 사용 방식은 바뀌지 않습니다. 필요한 정보가 더 짧은 경로로 보이도록 목록과 화면만 정리했습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "updates",
    slugSegments: ["updates", "nexa", "discord-permission-guides"],
    title: "NEXA 디스코드 권한 안내 문서를 공개했습니다",
    description:
      "NEXA 봇 설치와 응답 문제를 줄이기 위해 디스코드 권한 안내와 문제 해결 문서를 공개했습니다.",
    summary:
      "권한 확인, Message Content Intent, 채널별 권한 문제를 support 문서로 정리했습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 2,
    ctaLabel: "NEXA 권한 가이드 보기",
    ctaHref: "https://support.yeon.world/nexa/guides/discord-bot-permissions",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/docs/BOT_PERMISSIONS.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "NEXA 봇을 서버에 추가한 뒤 가장 자주 막히는 부분은 채널 권한과 메시지 읽기 권한입니다. 이를 줄이기 위해 권한 안내 문서와 응답 없음 문제 해결 문서를 먼저 공개했습니다.",
      },
      {
        type: "steps",
        items: [
          "서버 역할 권한을 확인합니다.",
          "채널별 권한 덮어쓰기를 확인합니다.",
          "Message Content Intent가 필요한 기능인지 확인합니다.",
          "응답 없음 문제는 support 문제 해결 문서를 따라 점검합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.typing,
    category: "updates",
    slugSegments: ["updates", "typing", "support-guides"],
    title: "타자연습 기본 사용 가이드를 추가했습니다",
    description:
      "typing.yeon.world를 처음 사용하는 사용자를 위해 시작 방법과 실시간 연결 점검 항목을 공개했습니다.",
    summary:
      "타자연습 진입, 방 참여, 결과 확인 흐름을 support 문서로 정리했습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 2,
    ctaLabel: "타자연습 가이드 보기",
    ctaHref:
      "https://support.yeon.world/typing/getting-started/start-typing-practice",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/app/typing-service",
    ],
    body: [
      {
        type: "paragraph",
        text: "타자연습 서비스의 첫 진입 흐름을 더 쉽게 확인할 수 있도록 기본 사용 가이드를 공개했습니다. 혼자 연습하는 경우와 방에 참여하는 경우를 함께 다룹니다.",
      },
      {
        type: "checklist",
        items: [
          "typing.yeon.world 공개 접속 경로",
          "연습과 방 참여 흐름",
          "실시간 연결이 실패할 때 확인할 항목",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "notice",
    slugSegments: ["notice", "support-open"],
    title: "YEON support.yeon.world 오픈 안내",
    description:
      "YEON의 서비스별 도움말과 문제 해결 문서를 support.yeon.world에서 분리 운영하기 시작했습니다.",
    summary:
      "NEXA, 타자연습, 플래시카드, 커뮤니티 도움말을 support 채널에서 서비스별로 확인할 수 있습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 2,
    ctaLabel: "Support 열기",
    ctaHref: "https://support.yeon.world",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/public-content/public-content-data.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON은 사용자가 문제를 해결할 때 바로 검색해서 들어올 수 있도록 support.yeon.world를 분리했습니다. 이 채널은 공식 소식이나 개발기보다 사용법, 튜토리얼, 오류 해결, FAQ에 집중합니다.",
      },
      {
        type: "heading",
        title: "처음 공개한 범위",
      },
      {
        type: "checklist",
        items: [
          "NEXA 설치, 권한, 응답 없음, 개인정보, FAQ",
          "타자연습 시작, 덱 변경, 타자방 접속 문제",
          "플래시카드 덱 생성, 게스트 덱 이관, 복습 단축키",
          "커뮤니티 글 작성, 게스트 닉네임, 글·댓글 등록 문제",
        ],
      },
      {
        type: "paragraph",
        text: "초기 support는 많은 메뉴보다 실제로 따라 할 수 있는 글을 우선합니다. 빈 문서나 제목만 있는 페이지는 만들지 않는다는 운영 원칙을 유지합니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "notice",
    slugSegments: ["notice", "news-operation-principles"],
    title: "news.yeon.world 운영 원칙 안내",
    description:
      "YEON 공식 소식, 제품 업데이트, 업계 해설을 news.yeon.world에서 어떻게 나누어 운영하는지 안내합니다.",
    summary:
      "news는 공지와 업데이트를 우선하고, 업계 뉴스는 사용자에게 주는 의미를 해설할 때만 발행합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 2,
    ctaLabel: "News 홈 보기",
    ctaHref: "https://news.yeon.world",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "news.yeon.world는 YEON의 공식 소식을 모으는 채널입니다. 서비스 공지와 제품 업데이트는 사실 중심으로 쓰고, 업계 뉴스 해설은 단순 요약이 아니라 YEON 사용자에게 어떤 의미가 있는지 설명할 때만 발행합니다.",
      },
      {
        type: "checklist",
        items: [
          "notice: 운영 공지와 중요한 정책 안내",
          "updates: 제품 변경사항과 사용자 영향",
          "news: AI, Discord, 개발자 도구, 제품 운영 관련 해설",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "notice",
    slugSegments: ["notice", "blog-operation-principles"],
    title: "blog.yeon.world 운영 원칙 안내",
    description:
      "YEON 개발기, 기술 글, 제품 제작기, 회고를 blog.yeon.world에서 별도 운영하는 기준입니다.",
    summary:
      "blog는 공식 공지나 도움말을 대체하지 않고, 제품을 만들며 남긴 결정과 기술 맥락을 기록합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 2,
    ctaLabel: "Blog 열기",
    ctaHref: "https://blog.yeon.world",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
      "/Users/osuma/coding_stuffs/yeon/docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "blog.yeon.world는 news 안의 하위 메뉴가 아니라 별도 채널로 운영합니다. 이곳에는 공식 공지보다 긴 제품 판단, 기술 선택, 시행착오, 회고를 남깁니다.",
      },
      {
        type: "checklist",
        items: [
          "engineering: 구현 구조와 기술 선택 이유",
          "product: 어떤 사용자 문제를 풀려는지",
          "devlog: 진행 상황과 배운 점",
          "essay: 짧은 생각과 운영 관점",
        ],
      },
      {
        type: "paragraph",
        text: "blog 글은 홍보 문구만 반복하지 않고 실제 기능, 코드 경로, 운영 정책과 연결되도록 관리합니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "news",
    slugSegments: ["news", "ai", "discord-ai-news-interpretation"],
    title: "NEXA와 Discord AI 뉴스 해설을 운영하는 기준 안내",
    description:
      "YEON이 AI와 Discord 관련 업계 뉴스를 단순 요약하지 않고 NEXA 사용자 관점으로 해설하는 기준입니다.",
    summary:
      "업계 뉴스 해설은 최신 소식보다 사용자가 실제로 확인해야 할 권한, 안전, 운영 영향에 집중합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ctaLabel: "NEXA 도움말 보기",
    ctaHref: "https://support.yeon.world/nexa/guides/discord-bot-permissions",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/BOT_PERMISSIONS.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_SAFETY_POLICY.md",
      "https://docs.discord.com/developers/events/gateway",
    ],
    body: [
      {
        type: "paragraph",
        text: "news.yeon.world의 업계 뉴스 해설은 빠른 속보 경쟁을 하지 않습니다. AI와 Discord 생태계의 변화가 NEXA 사용자에게 어떤 설정, 권한, 안전 기준, 운영 판단으로 이어지는지 설명하는 데 집중합니다.",
      },
      {
        type: "heading",
        title: "해설할 때 보는 기준",
      },
      {
        type: "checklist",
        items: [
          "Discord 서버 관리자가 바꿔야 할 권한이나 intent가 있는지 확인합니다.",
          "AI 봇이 답변하면 안 되는 채널과 안전 정책에 영향이 있는지 봅니다.",
          "NEXA support 문서에서 바로 따라 할 조치가 필요한지 연결합니다.",
          "불확실한 외부 소식은 공식 문서나 실제 서비스 변경으로 확인되기 전까지 과장하지 않습니다.",
        ],
      },
      {
        type: "paragraph",
        text: "이 기준을 지키면 news는 단순 홍보 채널이 아니라 사용자가 무엇을 확인해야 하는지 알려주는 공식 해설 채널이 됩니다.",
      },
      {
        type: "links",
        title: "참고 출처",
        links: [
          {
            href: "https://docs.discord.com/developers/events/gateway",
            label: "Discord Developer Docs - Gateway",
          },
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.card,
    category: "updates",
    slugSegments: ["updates", "card", "support-guides"],
    title: "플래시카드 지원 문서를 추가했습니다",
    description:
      "card.yeon.world 사용자를 위해 덱 생성, 게스트 덱 이관, 복습 단축키 도움말을 공개했습니다.",
    summary:
      "게스트와 로그인 사용자의 저장 흐름, 덱 학습 시작, 복습 모드 단축키를 support 문서로 정리했습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 2,
    ctaLabel: "플래시카드 도움말 보기",
    ctaHref:
      "https://support.yeon.world/card/guides/merge-guest-decks-after-login",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/use-card-service-decks-screen-state.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/deck-play-screen.tsx",
    ],
    body: [
      {
        type: "paragraph",
        text: "플래시카드 서비스는 로그인 전에도 덱을 만들 수 있고, 로그인 후 계정으로 가져오는 흐름이 있습니다. 이 차이를 이해하기 쉽게 support 문서로 분리했습니다.",
      },
      {
        type: "checklist",
        items: [
          "card.yeon.world에서 덱을 만드는 기본 흐름",
          "로그인 전에 만든 게스트 덱을 계정에 추가하는 방법",
          "복습 모드에서 Space, 1, 2, 3, s 단축키를 사용하는 방법",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.community,
    category: "updates",
    slugSegments: ["updates", "community", "support-guides"],
    title: "커뮤니티 지원 문서를 추가했습니다",
    description:
      "community.yeon.world 사용자를 위해 글 작성, 게스트 닉네임, 글·댓글 등록 문제 해결 문서를 공개했습니다.",
    summary:
      "게스트 닉네임과 비밀번호, 글자 수 제한, 글·댓글 등록 실패 확인 항목을 support 문서로 정리했습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 2,
    ctaLabel: "커뮤니티 도움말 보기",
    ctaHref: "https://support.yeon.world/community/guides/set-guest-nickname",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/community-guest-identity.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/components/community-feed-forms.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/hooks/use-community-feed.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "커뮤니티는 작은 글·댓글 피드와 게스트 작성 흐름부터 시작합니다. 사용자가 막히기 쉬운 닉네임, 비밀번호, 글자 수 제한, 등록 실패 메시지를 support 문서로 정리했습니다.",
      },
      {
        type: "checklist",
        items: [
          "게스트 닉네임은 자동 생성되며 직접 바꿀 수 있습니다.",
          "비밀번호는 글과 댓글 수정·삭제 확인에 사용됩니다.",
          "글 제목, 본문, 댓글은 빈 값으로 등록할 수 없습니다.",
          "화면 오류 메시지는 API 실패 원인을 확인하는 첫 단서입니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "notice",
    slugSegments: ["notice", "nexa", "support-docs-start"],
    title: "NEXA 공개 지원 문서 시작 안내",
    description:
      "NEXA 설치, 권한, Provider, 안전 정책을 support.yeon.world에서 공개 지원 문서로 운영하기 시작했습니다.",
    summary:
      "NEXA 사용자는 설치, 권한, Provider 연결, 안전 정책을 support 문서에서 확인할 수 있습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 2,
    ctaLabel: "NEXA support 보기",
    ctaHref: "https://support.yeon.world/nexa",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/public-content/public-content-data.ts",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/BOT_PERMISSIONS.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_SAFETY_POLICY.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "NEXA 공개 지원 문서는 디스코드 서버 관리자가 실제로 확인해야 할 설치, 권한, Provider, 개인정보, 안전 정책을 support.yeon.world에서 한곳에 묶기 위해 시작했습니다.",
      },
      {
        type: "checklist",
        items: [
          "디스코드 서버에 NEXA AI 봇을 추가하는 방법",
          "NEXA 봇에게 필요한 디스코드 권한",
          "Ollama Provider 연결과 provider-agent 설치 기준",
          "NEXA 관리자 정책과 안전장치",
        ],
      },
      {
        type: "links",
        title: "관련 문서",
        links: [
          {
            href: "https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
            label: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
          },
          {
            href: "https://support.yeon.world/nexa/policy/admin-safety-controls",
            label: "NEXA 관리자 정책과 안전장치 확인 방법",
          },
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "notice",
    slugSegments: ["notice", "nexa", "discord-ai-sitemap-registration"],
    title: "NEXA discord-ai.yeon.world sitemap 등록 안내",
    description:
      "discord-ai.yeon.world를 Search Console과 sitemap 운영 대상에 포함하는 내부 공지입니다.",
    summary:
      "NEXA 제품 랜딩과 support/news/blog 채널을 검색 운영 대상에 함께 둡니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 2,
    ctaLabel: "Search Console 운영 문서 보기",
    ctaHref: "https://news.yeon.world/notice/news-operation-principles",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/docs/seo/google-search-console.md",
      "/Users/osuma/coding_stuffs/yeon/apps/web/scripts/submit-search-console-sitemaps.mjs",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/seo.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "discord-ai.yeon.world는 NEXA 제품 진입점입니다. support, news, blog 채널만 검색 운영에 넣으면 제품 랜딩과 도움말 사이의 연결이 약해지므로 sitemap과 Search Console 운영 대상에 함께 둡니다.",
      },
      {
        type: "steps",
        items: [
          "discord-ai.yeon.world의 canonical URL을 확인합니다.",
          "Search Console URL-prefix property에 등록 상태를 확인합니다.",
          "제품 랜딩 sitemap 제출 여부를 점검합니다.",
          "support 문서에서 discord-ai.yeon.world 설치 페이지로 연결되는 CTA를 확인합니다.",
        ],
      },
      {
        type: "callout",
        title: "내부 운영 공지입니다",
        text: "이 글은 사용자 기능 변경보다 검색 운영 대상과 sitemap 제출 범위를 분명히 하는 내부 공지 성격입니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "product",
    slugSegments: ["product", "why-split-support-news-blog"],
    title: "왜 support, news, blog를 분리했는가",
    description:
      "YEON 공개 콘텐츠를 도움말, 공식 소식, 개발 기록으로 나눈 이유와 운영 기준을 정리했습니다.",
    summary:
      "검색 유입과 신뢰를 만들기 위해 콘텐츠 목적을 세 채널로 분리한 결정 기록입니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ctaLabel: "공개 콘텐츠 분리 공지 보기",
    ctaHref: "https://news.yeon.world/notice/public-content-network-start",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "하나의 블로그 안에 공지, 사용법, 개발기를 모두 넣으면 사용자가 찾는 목적이 섞입니다. YEON은 검색해서 들어온 사용자가 바로 해결책을 찾을 수 있도록 support를 분리하고, 공식 변화는 news, 제작 과정은 blog에 남기기로 했습니다.",
      },
      {
        type: "heading",
        title: "분리 기준",
      },
      {
        type: "checklist",
        items: [
          "문제를 해결하려는 글은 support에 둡니다.",
          "제품 변경과 공지는 news에 둡니다.",
          "기술 선택과 제작 과정은 blog에 둡니다.",
        ],
      },
      {
        type: "paragraph",
        text: "이 구조는 글을 더 많이 만들기 위한 구조가 아니라, 같은 글이라도 사용자가 기대하는 맥락에서 읽게 하기 위한 구조입니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "devlog",
    slugSegments: ["devlog", "public-content-network-start"],
    title: "YEON 공개 콘텐츠 네트워크를 시작하며 배운 운영 구조",
    description:
      "support, news, blog를 분리한 공개 콘텐츠 네트워크를 만들며 정리한 초기 운영 구조와 배운 점입니다.",
    summary:
      "빈 페이지를 만들지 않고 실제 도움말, 공식 소식, 제작 기록을 나누어 채우는 방식으로 시작했습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ctaLabel: "공개 콘텐츠 정책 보기",
    ctaHref: "https://news.yeon.world/notice/news-operation-principles",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
      "/Users/osuma/coding_stuffs/yeon/docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/public-content/public-content-coverage-report.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "처음에는 news 안에 blog를 넣는 구조도 생각할 수 있었습니다. 하지만 사용법, 공식 공지, 개발 기록이 섞이면 검색해서 들어온 사용자가 자신에게 맞는 글인지 판단하기 어렵습니다. 그래서 YEON은 support, news, blog를 별도 채널로 나누는 구조로 시작했습니다.",
      },
      {
        type: "heading",
        title: "이번에 배운 점",
      },
      {
        type: "checklist",
        items: [
          "도메인을 나누는 것보다 각 도메인의 역할을 계속 지키는 일이 더 중요합니다.",
          "빈 메뉴를 많이 만드는 것보다 실제로 읽을 수 있는 글을 적게 만드는 편이 낫습니다.",
          "운영자가 놓치는 분류는 coverage report처럼 자동으로 드러내야 합니다.",
          "support 글은 검색형 제목과 단계형 본문이 있어야 실제 사용자가 따라 할 수 있습니다.",
        ],
      },
      {
        type: "paragraph",
        text: "앞으로 devlog는 완성된 홍보문보다 어떤 제약을 보고 어떤 결정을 했는지 기록하는 공간으로 유지합니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "essay",
    slugSegments: ["essay", "why-support-docs-first"],
    title: "개인 제품에서 support 문서를 먼저 만드는 이유",
    description:
      "작은 제품일수록 화려한 뉴스보다 사용자가 문제를 해결하는 support 문서를 먼저 만드는 이유를 정리했습니다.",
    summary:
      "support 문서는 검색 유입뿐 아니라 제품이 어떤 문제를 책임질지 정하는 운영 기준이 됩니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ctaLabel: "Support 홈 보기",
    ctaHref: "https://support.yeon.world",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-quality-checklist.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "개인 제품은 기능을 계속 만드는 속도보다 사용자가 막혔을 때 다시 돌아올 수 있는 설명을 갖추는 일이 더 중요할 때가 있습니다. support 문서는 단순한 고객센터가 아니라 제품이 어떤 문제를 책임지는지 정리하는 운영 기준입니다.",
      },
      {
        type: "heading",
        title: "먼저 써야 보이는 것",
      },
      {
        type: "checklist",
        items: [
          "사용자가 실제로 검색할 질문이 무엇인지 보입니다.",
          "제품에서 아직 설명하지 못하는 빈 부분이 드러납니다.",
          "공지와 개발기가 support 문서를 반복하지 않게 됩니다.",
          "나중에 admin이나 CMS를 만들 때 필요한 필드가 분명해집니다.",
        ],
      },
      {
        type: "paragraph",
        text: "그래서 YEON은 news와 blog를 함께 열더라도, 검색 유입과 신뢰를 먼저 만드는 support 문서를 계속 중심에 둡니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "engineering",
    slugSegments: ["engineering", "nexa-provider-pool-overview"],
    title: "NEXA Provider Pool은 어떤 문제를 풀려고 하는가",
    description:
      "discord-assistant/NEXA가 로컬 AI provider와 Discord 사용자를 연결하는 구조를 제품 관점에서 설명합니다.",
    summary:
      "NEXA의 사용자, provider, admin 역할과 Provider Pool의 기본 목적을 정리합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ctaLabel: "NEXA 설치 페이지 보기",
    ctaHref: "https://discord-ai.yeon.world/install",
    sourcePaths: ["/Users/osuma/coding_stuffs/discord-assitant/README.md"],
    body: [
      {
        type: "paragraph",
        text: "NEXA는 Discord 안에서 AI를 쓰려는 사용자와 로컬 LLM을 제공할 수 있는 provider를 연결하는 구조를 지향합니다. 사용자는 Discord에서 질문하고, provider는 자신의 환경에서 모델 실행 자원을 제공하며, admin은 정책과 안전 기준을 관리합니다.",
      },
      {
        type: "heading",
        title: "세 가지 역할",
      },
      {
        type: "checklist",
        items: [
          "사용자: Discord에서 질문하고 응답을 받습니다.",
          "Provider: 로컬 Ollama 같은 실행 환경을 연결합니다.",
          "Admin: provider 상태, 안전 정책, 운영 흐름을 관리합니다.",
        ],
      },
      {
        type: "paragraph",
        text: "이 구조의 핵심은 AI 기능을 서버 운영자가 이해할 수 있는 권한, 안전, 설치 흐름으로 낮추는 것입니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "engineering",
    slugSegments: ["engineering", "search-console-sitemap-operations"],
    title: "Search Console과 sitemap을 운영 절차에 넣는 이유",
    description:
      "YEON 공개 사이트가 늘어날 때 canonical, robots, sitemap을 운영 절차에 포함해야 하는 이유를 정리했습니다.",
    summary:
      "서브도메인이 늘어날수록 검색엔진이 볼 URL과 보지 말아야 할 URL을 명확히 해야 합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 3,
    ctaLabel: "공개 URL 도움말 보기",
    ctaHref: "https://support.yeon.world/account/guides/public-service-urls",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/seo.ts",
      "/Users/osuma/coding_stuffs/yeon/docs/seo/google-search-console.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON은 서비스별 서브도메인과 공개 콘텐츠 서브도메인을 함께 운영합니다. 이때 canonical과 sitemap이 어긋나면 검색엔진은 어떤 URL이 대표인지 판단하기 어려워집니다.",
      },
      {
        type: "code",
        language: "txt",
        filename: "sitemap-targets.txt",
        code: "https://support.yeon.world/sitemap.xml\nhttps://news.yeon.world/sitemap.xml\nhttps://blog.yeon.world/sitemap.xml",
      },
      {
        type: "steps",
        items: [
          "서비스별 canonical host를 먼저 정합니다.",
          "host별 robots.txt가 자기 sitemap을 가리키게 합니다.",
          "sitemap에는 공개 발행 URL만 넣습니다.",
          "draft, admin, auth, API 경로는 색인 대상에서 제외합니다.",
          "Search Console에는 각 URL-prefix property와 sitemap을 제출합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "engineering",
    slugSegments: ["engineering", "dailyting-video-faststart"],
    title: "Dailyting 영상 로딩에서 mp4 faststart를 선택한 이유",
    description:
      "Dailyting 영상 업로드 뒤 mp4 재생 인덱스를 파일 앞쪽으로 옮긴 이유와, 같은 영상에서 확인한 구조 측정의 범위를 정리합니다.",
    summary:
      "파일의 moov atom 배치를 바꿔 재생 인덱스에 도달하기 전 필요한 선행 다운로드 조건을 구조적으로 줄였습니다.",
    publishedAt: DAILYTING_FASTSTART_PUBLISHED_DATE,
    updatedAt: DAILYTING_FASTSTART_PUBLISHED_DATE,
    readingMinutes: 5,
    ctaLabel: "기술 글 더 보기",
    ctaHref: "https://blog.yeon.world/engineering",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/backend-engineering-evidence/case-studies/dailyting-faststart.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "Dailyting에서 정상적인 영상 URL인데도 재생 시작이 늦어지는 경우를 확인했습니다. 앱 렌더링이나 스토리지 속도로 바로 단정하지 않고, 먼저 mp4 파일의 top-level atom 배치를 확인했습니다.",
      },
      {
        type: "heading",
        title: "문제를 파일 구조부터 확인한 이유",
      },
      {
        type: "paragraph",
        text: "mp4의 moov atom에는 재생 인덱스가 들어 있습니다. 이 atom이 파일 끝에 있으면 progressive 재생기는 인덱스를 읽을 때까지 재생을 시작할 수 없습니다. Dailyting의 원본은 ftyp → mdat → moov 순서여서, 재생 시작 전에 파일의 대부분을 먼저 내려받아야 했습니다.",
      },
      {
        type: "code",
        language: "bash",
        filename: "faststart-remux.sh",
        code: "ffmpeg -y -i input.mp4 -c copy -movflags +faststart output.mp4",
      },
      {
        type: "paragraph",
        text: "해결은 업로드 확정 단계에서 재인코딩 없이 remux하는 것이었습니다. -c copy로 코덱을 다시 변환하지 않고, -movflags +faststart로 moov atom만 파일 앞쪽으로 옮깁니다.",
      },
      {
        type: "heading",
        title: "같은 영상으로 비교한 구조",
      },
      {
        type: "code",
        language: "text",
        filename: "atom-layout.txt",
        code: "파일: 1280×720, 10초, 약 829KB\n\nBefore: ftyp → mdat → moov\n  moov offset: 824,577\n  재생 전 필요한 선행 다운로드: 828,968B (100%)\n\nAfter:  ftyp → moov → mdat\n  moov offset: 32\n  재생 전 필요한 선행 다운로드: 4,423B (0.5%)",
      },
      {
        type: "paragraph",
        text: "이 값은 네트워크 속도나 단말 성능이 아니라 재생 인덱스를 읽기 전 필요한 파일 바이트 수입니다. 같은 파일 구조에서 재생 인덱스에 도달하기 전 필요한 다운로드가 100%에서 0.5%로 줄었습니다.",
      },
      {
        type: "heading",
        title: "운영 파이프라인에서 지킨 경계",
      },
      {
        type: "steps",
        items: [
          "업로드 확정 단계에서 faststart remux를 수행합니다.",
          "처리에 실패하면 원본을 확정해 업로드 자체가 막히지 않게 합니다.",
          "상태 전환은 중복 실행되지 않도록 처리합니다.",
          "측정 결과는 파일 구조 근거와 함께 기록하고, 단말 체감 성능 수치로 바꾸어 말하지 않습니다.",
        ],
      },
      {
        type: "callout",
        tone: PUBLIC_CONTENT_CALLOUT_TONES.warning,
        title: "약 99%는 첫 프레임 시간 자체가 아닙니다",
        text: "실제 첫 프레임 시간은 네트워크 RTT, 플레이어 버퍼 정책, 단말 성능에 따라 달라집니다. 이 결과는 재생기가 인덱스를 얻기 전 기다려야 하는 파일 선행 다운로드 조건이 약 99% 줄었다는 구조 측정입니다.",
      },
      {
        type: "links",
        title: "공개 가능한 근거",
        links: [
          {
            href: "https://github.com/Hyeonjun0527/backend-engineering-evidence/blob/main/case-studies/dailyting-faststart.md",
            label: "Dailyting faststart 공개 기술 증빙",
          },
          {
            href: "https://dailyting.cloud",
            label: "Dailyting 서비스",
          },
        ],
      },
      {
        type: "paragraph",
        text: "운영 파일, 사용자 데이터, 내부 경로, 배포 구성은 공개하지 않습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "product",
    slugSegments: ["product", "nexa-discord-server-operator-design"],
    title: "NEXA에서 채널 권한과 Provider Pool을 함께 확인하는 이유",
    description:
      "Discord 채널 권한, Message Content Intent, Provider Pool 전달 경로를 운영자가 한 흐름에서 확인해야 하는 이유를 기록합니다.",
    summary:
      "질문이 어디서 읽히고 어느 Provider PC로 전달될 수 있는지부터 확인할 수 있게 구성했습니다.",
    publishedAt: NEXA_OPERATOR_ARTICLE_DATE,
    updatedAt: NEXA_OPERATOR_ARTICLE_DATE,
    readingMinutes: 5,
    ctaLabel: "NEXA 설치 페이지 보기",
    ctaHref: "https://discord-ai.yeon.world/install",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/docs/FAQ.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/BOT_PERMISSIONS.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_SAFETY_POLICY.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "Discord 서버에서 AI 봇을 운영하는 일은 질문에 답하는 기능만의 문제가 아닙니다. 어떤 채널에서 답해야 하는지, 누가 설정을 바꿀 수 있는지, 민감한 질문을 어떻게 안내할지, 서버 관리자의 책임을 어디까지 둘지까지 함께 결정해야 합니다.",
      },
      {
        type: "heading",
        title: "운영자가 먼저 확인하는 것",
      },
      {
        type: "checklist",
        items: [
          "봇이 볼 수 있는 채널과 답변할 수 있는 채널",
          "Message Content Intent와 Discord 권한",
          "서버별 프롬프트와 채널 AI 설정",
          "Provider Pool로 질문이 전달될 수 있다는 개인정보 안내",
          "불법 콘텐츠와 Discord ToS를 다루는 안전 정책",
        ],
      },
      {
        type: "paragraph",
        text: "그래서 NEXA support 문서는 설치 버튼보다 권한, 응답 없음, 채널 제외, 개인정보 안내를 먼저 다룹니다. 서버 운영자가 통제할 수 있는 경계가 명확해야 실제 서버에서 오래 쓸 수 있습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.typing,
    category: "engineering",
    slugSegments: ["engineering", "typing-realtime-server-needed"],
    title: "타자방에서 race-server가 참가자 상태를 맡는 이유",
    description:
      "혼자 연습과 달리 타자방의 참여자, 준비 상태, 레이스 시작 시점을 실시간 서버가 맞추는 방식을 기록합니다.",
    summary:
      "혼자 연습은 로컬 상태로 유지하고, 여러 사람이 함께 보는 방 상태만 race-server로 분리했습니다.",
    publishedAt: TYPING_REALTIME_ARTICLE_DATE,
    updatedAt: TYPING_REALTIME_ARTICLE_DATE,
    readingMinutes: 4,
    ctaLabel: "타자연습 열기",
    ctaHref: "https://typing.yeon.world",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/typing-service-fetch.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/typing-service/use-race-room.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/race-server",
    ],
    body: [
      {
        type: "paragraph",
        text: "타자연습에는 두 가지 흐름이 있습니다. 혼자 연습하는 화면은 기본 문장이나 선택한 덱만 있으면 바로 시작할 수 있습니다. 반대로 타자방은 참가자, 방 상태, 공개 여부, 레이스 시작 시점이 계속 바뀌기 때문에 실시간 서버가 필요합니다.",
      },
      {
        type: "heading",
        title: "실시간 서버가 맡는 경계",
      },
      {
        type: "checklist",
        items: [
          "대기 중인 공개방 목록을 정리합니다.",
          "활성 상태이고 참가자가 있는 방만 공개 목록에 보여줍니다.",
          "방 참여, 준비 상태, 레이스 진행 상태를 맞춥니다.",
          "로그인 토큰이 없어도 레이스 진행 자체는 깨지지 않게 합니다.",
        ],
      },
      {
        type: "paragraph",
        text: "이 경계를 분리하면 네트워크가 불안정할 때도 혼자 연습은 기본 문장으로 유지하고, 멀티플레이 문제는 재연결과 방 상태 확인으로 좁혀서 안내할 수 있습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.card,
    category: "product",
    slugSegments: ["product", "why-card-guest-mode-matters"],
    title: "게스트 덱을 계정으로 옮길 때 사용자 선택을 남긴 이유",
    description:
      "게스트 덱을 바로 만들 수 있게 두되, 로그인 뒤 계정 저장으로 옮길 때 사용자 선택을 남긴 방식을 기록합니다.",
    summary:
      "시작은 빠르게 하고, 오래 쓸 덱은 이관 전 덱과 카드 수를 확인한 뒤 계정에 저장합니다.",
    publishedAt: CARD_GUEST_ARTICLE_DATE,
    updatedAt: CARD_GUEST_ARTICLE_DATE,
    readingMinutes: 4,
    ctaLabel: "플래시카드 열기",
    ctaHref: "https://card.yeon.world",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/use-card-service-decks-screen-state.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/card-service/components/merge-guest-dialog.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/guest-card-service-store.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "플래시카드는 생각난 내용을 바로 카드로 만들 수 있어야 합니다. 처음부터 가입을 요구하면 작은 학습 아이디어가 사라질 수 있으므로, card.yeon.world는 게스트 상태에서도 덱을 만들 수 있게 둡니다.",
      },
      {
        type: "heading",
        title: "게스트와 계정의 역할",
      },
      {
        type: "checklist",
        items: [
          "게스트 모드: 빠르게 덱과 카드를 만들어 시작합니다.",
          "계정 모드: 다른 기기에서도 같은 덱을 이어서 봅니다.",
          "이관 흐름: 로그인 후 게스트 덱이 있으면 계정에 추가할지 묻습니다.",
          "완료 안내: 이관된 덱 수와 카드 수를 사용자에게 보여줍니다.",
        ],
      },
      {
        type: "paragraph",
        text: "이 구조는 시작 장벽과 장기 저장 사이의 균형입니다. 빠르게 시작하되, 가치가 생긴 덱은 계정으로 옮길 수 있어야 합니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.community,
    category: "product",
    slugSegments: ["product", "why-community-starts-small"],
    title: "비회원 글쓰기에서 수정·삭제 확인을 남긴 이유",
    description:
      "자동 게스트 닉네임과 비밀번호를 글·댓글 수정 및 삭제 확인에 쓰는 현재 커뮤니티 경계를 기록합니다.",
    summary:
      "로그인 없이 글을 쓰더라도 작성자가 자신의 글과 댓글을 다시 관리할 수 있게 최소한의 확인 절차를 둡니다.",
    publishedAt: COMMUNITY_GUEST_ARTICLE_DATE,
    updatedAt: COMMUNITY_GUEST_ARTICLE_DATE,
    readingMinutes: 4,
    ctaLabel: "커뮤니티 열기",
    ctaHref: "https://community.yeon.world",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/community-guest-identity.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/components/community-feed-forms.tsx",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/features/community/chat-service-api.ts",
    ],
    body: [
      {
        type: "paragraph",
        text: "커뮤니티는 기능을 많이 넣는 것보다 사용자가 글을 쓰고, 댓글을 남기고, 필요하면 수정하거나 삭제할 수 있는 기본 경계가 먼저 중요합니다. 그래서 초기 community.yeon.world는 큰 SNS 기능보다 작은 피드와 게스트 작성 흐름에 집중합니다.",
      },
      {
        type: "heading",
        title: "작게 시작할 때 먼저 보는 것",
      },
      {
        type: "checklist",
        items: [
          "게스트 닉네임은 자동 생성되지만 직접 바꿀 수 있습니다.",
          "비밀번호는 글과 댓글 수정·삭제 확인에 사용됩니다.",
          "제목과 본문 길이 제한을 화면에서 명확히 보여줍니다.",
          "오류가 나면 사용자가 볼 수 있는 메시지로 남깁니다.",
        ],
      },
      {
        type: "paragraph",
        text: "커뮤니티의 다음 기능은 이 기본 경계가 안정된 뒤에 붙는 편이 낫습니다. 작은 기능도 공개성과 책임 경계가 맞아야 사용자가 신뢰하고 글을 남길 수 있습니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "product",
    slugSegments: ["product", "public-content-channel-decision"],
    title: "YEON 공개 콘텐츠 채널 분리 결정 기록",
    description:
      "support, news, blog를 각각 독립 채널로 나눈 제품 결정과 사용자가 기대하는 정보 구조를 정리했습니다.",
    summary:
      "도움말, 공식 소식, 제작 기록을 분리해 검색 유입과 운영 신뢰를 동시에 만들기로 했습니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ctaLabel: "채널 분리 공지 보기",
    ctaHref: "https://news.yeon.world/notice/public-content-network-start",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
      "/Users/osuma/coding_stuffs/yeon/docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON 공개 콘텐츠는 처음부터 글 수를 늘리기 위한 구조가 아니라, 사용자가 기대하는 답을 맞는 채널에서 찾게 하기 위한 구조입니다. 사용법은 support, 공식 변경은 news, 제작 과정은 blog로 나누는 결정을 제품 정책으로 남겼습니다.",
      },
      {
        type: "heading",
        title: "결정 기준",
      },
      {
        type: "checklist",
        items: [
          "문제를 해결하려는 사용자는 support로 바로 들어옵니다.",
          "제품 변경과 적용일을 확인하려는 사용자는 news를 봅니다.",
          "왜 그렇게 만들었는지 알고 싶은 사용자는 blog를 봅니다.",
          "같은 본문을 여러 채널에 중복 발행하지 않습니다.",
        ],
      },
      {
        type: "paragraph",
        text: "이 결정은 SEO를 위한 형식 분리가 아니라, 사용자 의도와 운영 책임을 맞추기 위한 분리입니다.",
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "engineering",
    slugSegments: ["engineering", "public-url-canonical-record"],
    title: "Yeon 공개 URL과 canonical 구조를 정리한 이유",
    description:
      "서비스 서브도메인과 공개 콘텐츠 채널이 늘어날 때 canonical, robots, sitemap 구조를 정리한 이유입니다.",
    summary:
      "공개 URL이 늘수록 검색엔진과 사용자가 볼 대표 주소를 한곳에서 관리해야 합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ctaLabel: "서비스별 공개 URL 보기",
    ctaHref: "https://support.yeon.world/account/guides/public-service-urls",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/seo.ts",
      "/Users/osuma/coding_stuffs/yeon/apps/web/src/lib/subdomain-routing.ts",
      "/Users/osuma/coding_stuffs/yeon/docs/seo/google-search-console.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON은 yeon.world 하나만 운영하지 않습니다. typing, card, community, support, news, blog, discord-ai처럼 목적이 다른 공개 URL이 늘어납니다. 이때 canonical 구조가 흔들리면 사용자가 공유한 주소와 검색엔진이 색인하는 주소가 어긋납니다.",
      },
      {
        type: "code",
        language: "txt",
        filename: "canonical-hosts.txt",
        code: "https://yeon.world\nhttps://typing.yeon.world\nhttps://card.yeon.world\nhttps://community.yeon.world\nhttps://support.yeon.world\nhttps://news.yeon.world\nhttps://blog.yeon.world\nhttps://discord-ai.yeon.world",
      },
      {
        type: "steps",
        items: [
          "서비스별 대표 host를 먼저 정합니다.",
          "지원 문서, 뉴스, 블로그는 각자의 canonical host를 갖습니다.",
          "robots.txt와 sitemap.xml은 host별로 분리합니다.",
          "admin, auth, API, draft 경로는 색인 대상에서 제외합니다.",
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "essay",
    slugSegments: ["essay", "why-ai-bot-safety-policy-first"],
    title: "NEXA에서 답변 채널과 Provider PC 전달 범위를 먼저 정한 이유",
    description:
      "Discord 채널 권한과 Provider Pool 전달 경로가 정해지기 전에는 NEXA를 안전하게 운영할 수 없는 이유를 기록합니다.",
    summary:
      "질문이 읽히는 채널, Provider PC 전달 가능성, 관리자 책임 범위를 기능 설명보다 먼저 공개했습니다.",
    publishedAt: NEXA_SAFETY_ARTICLE_DATE,
    updatedAt: NEXA_SAFETY_ARTICLE_DATE,
    readingMinutes: 4,
    ctaLabel: "NEXA 안전 정책 보기",
    ctaHref: "https://support.yeon.world/nexa/policy/admin-safety-controls",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_SAFETY_POLICY.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/PROVIDER_SAFETY_POLICY.md",
      "/Users/osuma/coding_stuffs/discord-assitant/SECURITY.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "AI 봇을 만들 때 기능 목록만 먼저 공개하면 사용자는 어디까지 안전하게 써야 하는지 알기 어렵습니다. Discord 서버에서 동작하는 NEXA는 채널 권한, Provider 전달, 개인정보, 불법 콘텐츠 대응처럼 기능 바깥의 운영 경계가 함께 필요합니다.",
      },
      {
        type: "heading",
        title: "먼저 문서화해야 하는 이유",
      },
      {
        type: "checklist",
        items: [
          "서버 관리자가 허용 채널과 역할을 정해야 합니다.",
          "Provider Pool 구조에서는 질문이 외부 Provider PC로 전송될 수 있습니다.",
          "비밀번호, API 키, 개인정보를 질문에 넣지 말아야 합니다.",
          "불법 콘텐츠와 Discord ToS 경계는 관리자 설정보다 우선합니다.",
        ],
      },
      {
        type: "paragraph",
        text: "안전 정책은 출시 후 문제가 생겼을 때 붙이는 문서가 아니라, 제품을 어디까지 책임질지 먼저 정하는 문서입니다. 그래서 NEXA의 실제 설정과 관리자 책임은 support 정책 문서에서 먼저 확인할 수 있게 연결합니다.",
      },
    ],
  },
];

const UNPUBLISHED_PUBLIC_CONTENT_ARTICLE_KEYS = new Set([
  "news:updates/nexa/discord-permission-guides",
  "news:updates/typing/support-guides",
  "news:notice/support-open",
  "news:notice/news-operation-principles",
  "news:notice/blog-operation-principles",
  "news:news/ai/discord-ai-news-interpretation",
  "news:updates/card/support-guides",
  "news:updates/community/support-guides",
  "news:notice/nexa/support-docs-start",
  "news:notice/nexa/discord-ai-sitemap-registration",
  "blog:product/why-split-support-news-blog",
  "blog:devlog/public-content-network-start",
  "blog:essay/why-support-docs-first",
  "blog:engineering/nexa-provider-pool-overview",
  "blog:engineering/search-console-sitemap-operations",
  "blog:engineering/dailyting-video-faststart",
  "blog:product/public-content-channel-decision",
  "blog:engineering/public-url-canonical-record",
]);

export const PUBLIC_CONTENT_ARTICLES: readonly PublicContentArticle[] =
  PUBLIC_CONTENT_ARTICLE_DRAFTS.filter(
    (article) =>
      !UNPUBLISHED_PUBLIC_CONTENT_ARTICLE_KEYS.has(
        `${article.channel}:${article.slugSegments.join("/")}`
      )
  );

export function getPublicContentChannelConfig(channel: PublicContentChannel) {
  return PUBLIC_CONTENT_CHANNEL_CONFIG[channel];
}

export function getPublicContentArticles(channel?: PublicContentChannel) {
  return channel
    ? PUBLIC_CONTENT_ARTICLES.filter((article) => article.channel === channel)
    : [...PUBLIC_CONTENT_ARTICLES];
}

function compareArticlesByDate(
  left: PublicContentArticle,
  right: PublicContentArticle
) {
  return right.publishedAt.localeCompare(left.publishedAt);
}

export function getPublicContentArticleBySlug(
  channel: PublicContentChannel,
  slugSegments: readonly string[]
) {
  const slug = slugSegments.join("/");

  return (
    PUBLIC_CONTENT_ARTICLES.find(
      (article) =>
        article.channel === channel && article.slugSegments.join("/") === slug
    ) ?? null
  );
}

export function getPublicContentCategoryLabel(category: string) {
  return (
    PUBLIC_CONTENT_CATEGORY_LABELS[
      category as keyof typeof PUBLIC_CONTENT_CATEGORY_LABELS
    ] ?? category
  );
}

export function getPublicContentServiceLabel(service: PublicContentService) {
  return PUBLIC_CONTENT_SERVICE_LABELS[service];
}

export function getPublicContentServicesForChannel(
  channel: PublicContentChannel
) {
  const services = new Set(
    getPublicContentArticles(channel).map((article) => article.service)
  );

  return [...services];
}

function getNewsCategoryTitle(category: string) {
  return (
    NEWS_CATEGORY_TITLES[category as keyof typeof NEWS_CATEGORY_TITLES] ??
    getPublicContentCategoryLabel(category)
  );
}

export function getPublicContentNewsTopic(article: PublicContentArticle) {
  if (
    article.channel !== PUBLIC_CONTENT_CHANNELS.news ||
    article.category !== "news"
  ) {
    return null;
  }

  return article.slugSegments[1] ?? null;
}

export function getPublicContentNewsTopicLabel(topic: string) {
  return NEWS_TOPIC_LABELS[topic as keyof typeof NEWS_TOPIC_LABELS] ?? topic;
}

function getBlogCategoryTitle(category: string) {
  return (
    BLOG_CATEGORY_TITLES[category as keyof typeof BLOG_CATEGORY_TITLES] ??
    getPublicContentCategoryLabel(category)
  );
}

function getLastModified(articles: readonly PublicContentArticle[]) {
  return (
    articles
      .map((article) => article.updatedAt)
      .sort((left, right) => right.localeCompare(left))[0] ?? ""
  );
}

function getFirstCollectionArticle(articles: readonly PublicContentArticle[]) {
  const firstArticle = articles[0];
  if (!firstArticle) {
    throw new Error("공개 콘텐츠 collection에 포함된 글이 없습니다.");
  }

  return firstArticle;
}

function getCollectionArticles(
  channel: PublicContentChannel,
  slugSegments: readonly string[]
) {
  const [firstSegment, secondSegment] = slugSegments;

  if (slugSegments.length === 0 || slugSegments.length > 2) {
    return [];
  }

  return getPublicContentArticles(channel)
    .filter((article) => {
      if (channel === PUBLIC_CONTENT_CHANNELS.support) {
        if (slugSegments.length === 1) {
          return article.service === firstSegment;
        }

        return (
          article.service === firstSegment && article.category === secondSegment
        );
      }

      if (
        channel === PUBLIC_CONTENT_CHANNELS.news &&
        firstSegment === "news" &&
        slugSegments.length === 2
      ) {
        return getPublicContentNewsTopic(article) === secondSegment;
      }

      if (slugSegments.length === 1) {
        return article.category === firstSegment;
      }

      return (
        article.category === firstSegment && article.service === secondSegment
      );
    })
    .sort(compareArticlesByDate);
}

function buildCollectionTitle({
  channel,
  slugSegments,
  articles,
}: {
  channel: PublicContentChannel;
  slugSegments: readonly string[];
  articles: readonly PublicContentArticle[];
}) {
  const [firstSegment, secondSegment] = slugSegments;
  const firstArticle = getFirstCollectionArticle(articles);

  if (channel === PUBLIC_CONTENT_CHANNELS.support) {
    const serviceLabel = getPublicContentServiceLabel(firstArticle.service);
    if (slugSegments.length === 1) {
      return `${serviceLabel} 도움말`;
    }

    return `${serviceLabel} ${getPublicContentCategoryLabel(secondSegment)}`;
  }

  if (channel === PUBLIC_CONTENT_CHANNELS.news) {
    const categoryTitle = getNewsCategoryTitle(firstSegment);
    if (slugSegments.length === 1) {
      return categoryTitle;
    }

    if (firstSegment === "news") {
      return `${getPublicContentNewsTopicLabel(secondSegment)} ${categoryTitle}`;
    }

    return `${getPublicContentServiceLabel(firstArticle.service)} ${categoryTitle}`;
  }

  const categoryTitle = getBlogCategoryTitle(firstSegment);
  if (slugSegments.length === 1) {
    return categoryTitle;
  }

  return `${getPublicContentServiceLabel(firstArticle.service)} ${categoryTitle}`;
}

function buildCollectionDescription({
  channel,
  slugSegments,
  articles,
}: {
  channel: PublicContentChannel;
  slugSegments: readonly string[];
  articles: readonly PublicContentArticle[];
}) {
  const [firstSegment, secondSegment] = slugSegments;
  const firstArticle = getFirstCollectionArticle(articles);
  const serviceLabel = getPublicContentServiceLabel(firstArticle.service);

  if (channel === PUBLIC_CONTENT_CHANNELS.support) {
    if (slugSegments.length === 1) {
      return `${serviceLabel} 사용법, 문제 해결, FAQ 문서를 한곳에 모았습니다.`;
    }

    return `${serviceLabel} ${getPublicContentCategoryLabel(secondSegment)} 문서를 모았습니다.`;
  }

  if (channel === PUBLIC_CONTENT_CHANNELS.news) {
    const categoryTitle = getNewsCategoryTitle(firstSegment);
    if (slugSegments.length === 1) {
      return `YEON ${categoryTitle} 글을 최신 발행 순서로 모았습니다.`;
    }

    if (firstSegment === "news") {
      return `${getPublicContentNewsTopicLabel(secondSegment)} 주제의 YEON ${categoryTitle} 글을 모았습니다.`;
    }

    return `${serviceLabel} ${categoryTitle} 글을 최신 발행 순서로 모았습니다.`;
  }

  const categoryTitle = getBlogCategoryTitle(firstSegment);
  if (slugSegments.length === 1) {
    return `YEON ${categoryTitle}을 최신 발행 순서로 모았습니다.`;
  }

  return `${serviceLabel} ${categoryTitle}을 최신 발행 순서로 모았습니다.`;
}

export function getPublicContentCollectionBySlug(
  channel: PublicContentChannel,
  slugSegments: readonly string[]
): PublicContentCollection | null {
  const articles = getCollectionArticles(channel, slugSegments);
  if (articles.length === 0) return null;

  return {
    channel,
    slugSegments: [...slugSegments],
    title: buildCollectionTitle({ channel, slugSegments, articles }),
    description: buildCollectionDescription({
      channel,
      slugSegments,
      articles,
    }),
    articles,
    canonicalUrl: buildPublicContentCanonicalUrl(channel, slugSegments),
    lastModified: getLastModified(articles),
  };
}

export function getPublicContentCollections(channel: PublicContentChannel) {
  const collectionSlugs = new Map<string, readonly string[]>();

  for (const article of getPublicContentArticles(channel)) {
    const candidates =
      channel === PUBLIC_CONTENT_CHANNELS.support
        ? [[article.service], [article.service, article.category]]
        : [
            [article.category],
            article.channel === PUBLIC_CONTENT_CHANNELS.news &&
            article.category === "news"
              ? [article.category, getPublicContentNewsTopic(article) ?? ""]
              : [article.category, article.service],
          ];

    for (const slugSegments of candidates) {
      if (slugSegments.some((segment) => segment.length === 0)) continue;
      collectionSlugs.set(slugSegments.join("/"), slugSegments);
    }
  }

  return [...collectionSlugs.values()]
    .map((slugSegments) =>
      getPublicContentCollectionBySlug(channel, slugSegments)
    )
    .filter((collection): collection is PublicContentCollection =>
      Boolean(collection)
    )
    .sort((left, right) =>
      left.slugSegments.join("/").localeCompare(right.slugSegments.join("/"))
    );
}

export function buildPublicContentCanonicalUrl(
  channel: PublicContentChannel,
  slugSegments: readonly string[] = []
) {
  const { host } = getPublicContentChannelConfig(channel);
  const pathname = slugSegments.length > 0 ? `/${slugSegments.join("/")}` : "/";
  return new URL(pathname, host).toString();
}

export function buildPublicContentOpenGraphImageUrl(
  channel: PublicContentChannel
) {
  const { host } = getPublicContentChannelConfig(channel);
  return new URL("/opengraph-image", host).toString();
}

export function buildPublicContentInternalHref(
  channel: PublicContentChannel,
  slugSegments: readonly string[] = []
) {
  const { internalBasePath } = getPublicContentChannelConfig(channel);
  const suffix = slugSegments.length > 0 ? `/${slugSegments.join("/")}` : "";
  return `${internalBasePath}${suffix}`;
}

/**
 * 공개 콘텐츠의 canonical URL은 SEO, RSS, 공유 미리보기에만 사용한다.
 * 화면 내 이동은 실행 중인 환경을 벗어나지 않도록 내부 경로로 바꾼다.
 */
export function resolvePublicContentNavigationHref(href: string) {
  try {
    const url = new URL(href);
    const config = Object.values(PUBLIC_CONTENT_CHANNEL_CONFIG).find(
      (candidate) => candidate.host === url.origin
    );

    if (!config) return href;

    const pathname = url.pathname === "/" ? "" : url.pathname;
    return `${config.internalBasePath}${pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
}

export function getPublicContentSitemapEntries(): PublicContentSitemapEntry[] {
  return [
    ...Object.values(PUBLIC_CONTENT_CHANNEL_CONFIG).map((config) => ({
      url: config.host,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...Object.values(PUBLIC_CONTENT_CHANNELS).flatMap((channel) =>
      getPublicContentCollections(channel).map((collection) => ({
        url: collection.canonicalUrl,
        lastModified: collection.lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
    ),
    ...PUBLIC_CONTENT_ARTICLES.map((article) => {
      const changeFrequency: PublicContentSitemapEntry["changeFrequency"] =
        article.channel === "support" ? "monthly" : "weekly";

      return {
        url: buildPublicContentCanonicalUrl(
          article.channel,
          article.slugSegments
        ),
        lastModified: article.updatedAt,
        changeFrequency,
        priority: article.channel === "support" ? 0.65 : 0.55,
      };
    }),
  ];
}
