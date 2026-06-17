import type { YeonMetadataRoute } from "@yeon/ui/runtime/YeonMetadataRoute";

export const PUBLIC_CONTENT_CHANNELS = {
  support: "support",
  news: "news",
  blog: "blog",
} as const;

export type PublicContentChannel =
  (typeof PUBLIC_CONTENT_CHANNELS)[keyof typeof PUBLIC_CONTENT_CHANNELS];

export const PUBLIC_CONTENT_SERVICES = {
  nexa: "nexa",
  typing: "typing",
  card: "card",
  community: "community",
  account: "account",
} as const;

export type PublicContentService =
  (typeof PUBLIC_CONTENT_SERVICES)[keyof typeof PUBLIC_CONTENT_SERVICES];

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
      type: "callout";
      title: string;
      text: string;
    };

export type PublicContentArticle = {
  channel: PublicContentChannel;
  service: PublicContentService;
  category: string;
  slugSegments: readonly string[];
  title: string;
  description: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  ctaLabel?: string;
  ctaHref?: string;
  sourcePaths: readonly string[];
  body: readonly PublicContentBlock[];
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
    title: "YEON Support",
    description:
      "NEXA, 타자연습, 플래시카드, 커뮤니티를 바로 사용할 수 있게 돕는 공개 도움말입니다.",
    homeEyebrow: "Help center",
    homeTitle: "필요한 해결 방법을 서비스별로 찾으세요",
    homeDescription:
      "처음 시작, 권한 설정, 오류 해결, FAQ를 실제 서비스 흐름 기준으로 정리합니다.",
  },
  news: {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    host: "https://news.yeon.world",
    internalBasePath: "/news",
    label: "News",
    title: "YEON News",
    description:
      "YEON과 NEXA의 공식 공지, 제품 업데이트, 업계 뉴스 해설을 정리합니다.",
    homeEyebrow: "Official updates",
    homeTitle: "YEON의 공식 소식과 제품 변경사항",
    homeDescription:
      "공지, 업데이트, 업계 해설을 분리해 실제 사용자 영향이 보이게 기록합니다.",
  },
  blog: {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    host: "https://blog.yeon.world",
    internalBasePath: "/blog",
    label: "Blog",
    title: "YEON Blog",
    description:
      "YEON과 NEXA를 만들며 남기는 기술 글, 제품 제작기, 개발 일지입니다.",
    homeEyebrow: "Build notes",
    homeTitle: "제품을 만들며 남기는 기술과 결정의 기록",
    homeDescription:
      "개발기, 기술 선택, 제품 운영 판단을 실제 코드와 서비스 맥락에 맞춰 남깁니다.",
  },
} as const satisfies Record<
  PublicContentChannel,
  {
    channel: PublicContentChannel;
    host: string;
    internalBasePath: string;
    label: string;
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

const PUBLISHED_DATE = "2026-06-17";

export const PUBLIC_CONTENT_ARTICLES: readonly PublicContentArticle[] = [
  {
    channel: PUBLIC_CONTENT_CHANNELS.support,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "guides",
    slugSegments: ["nexa", "guides", "add-nexa-discord-bot"],
    title: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
    description:
      "디스코드 서버 관리자가 NEXA AI 봇을 추가하기 전에 확인할 권한, 설치 페이지, 테스트 순서를 정리했습니다.",
    summary:
      "서버 권한 확인부터 설치 페이지 진입, 첫 질문 테스트까지 순서대로 진행합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 4,
    ctaLabel: "NEXA 설치 페이지 열기",
    ctaHref: "https://discord-ai.yeon.world/install",
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/README.md",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/FAQ.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "NEXA는 디스코드 서버 안에서 AI 응답과 자동화 흐름을 사용할 수 있게 돕는 봇 서비스입니다. 서버에 추가하기 전에는 본인이 서버 관리자이거나 봇 초대 권한을 가진 역할인지 먼저 확인해야 합니다.",
      },
      {
        type: "heading",
        title: "추가 순서",
      },
      {
        type: "steps",
        items: [
          "디스코드에서 봇을 추가할 서버를 열고 본인 역할에 서버 관리 또는 봇 초대 권한이 있는지 확인합니다.",
          "NEXA 설치 페이지를 열어 현재 제공되는 설치 안내와 초대 흐름을 확인합니다.",
          "디스코드 권한 승인 화면이 나오면 서버 이름이 맞는지 확인합니다.",
          "요청된 권한이 봇 안내 문서의 권장 권한과 맞는지 확인한 뒤 승인합니다.",
          "서버의 테스트 채널에서 NEXA가 보이는지 확인합니다.",
          "간단한 질문을 보내 응답이 오는지 확인합니다.",
        ],
      },
      {
        type: "callout",
        title: "권한이 부족하면",
        text: "초대 화면에서 서버가 보이지 않거나 승인할 수 없다면, 디스코드 서버 소유자에게 봇 초대 권한을 요청해야 합니다.",
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
    ctaHref: "https://discord-ai.yeon.world/install",
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
        type: "callout",
        title: "채널 권한이 더 우선입니다",
        text: "서버 역할 권한이 맞아도 특정 채널에서 권한이 거부되어 있으면 NEXA가 응답하지 못할 수 있습니다.",
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
    ctaLabel: "권한 가이드 보기",
    ctaHref: "/nexa/guides/discord-bot-permissions",
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
        title: "가장 먼저 볼 지점",
        text: "한 채널에서만 응답하지 않는다면 서버 문제가 아니라 채널 권한 문제일 가능성이 큽니다.",
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
    ctaLabel: "타자연습 열기",
    ctaHref: "https://typing.yeon.world",
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
    ctaLabel: "플래시카드 열기",
    ctaHref: "https://card.yeon.world",
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
    ctaLabel: "커뮤니티 열기",
    ctaHref: "https://community.yeon.world",
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
        ],
      },
    ],
  },
  {
    channel: PUBLIC_CONTENT_CHANNELS.news,
    service: PUBLIC_CONTENT_SERVICES.account,
    category: "notice",
    slugSegments: ["notice", "public-content-network-start"],
    title: "YEON 공개 도움말, 뉴스, 블로그 채널을 분리합니다",
    description:
      "YEON은 support, news, blog를 분리해 사용법, 공식 소식, 개발 기록을 각각 운영합니다.",
    summary:
      "사용법은 support, 공식 소식은 news, 개발 기록은 blog로 나누어 운영합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 2,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/yeon/docs/seo/public-content-channel-policy.md",
      "/Users/osuma/coding_stuffs/yeon/docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "YEON은 공개 콘텐츠를 세 채널로 나누어 운영합니다. 사용자가 문제를 해결할 때는 support, 제품 변경사항을 확인할 때는 news, 제작 과정과 기술 글을 읽을 때는 blog를 사용합니다.",
      },
      {
        type: "checklist",
        items: [
          "support.yeon.world: 사용법, 튜토리얼, 문제 해결, FAQ",
          "news.yeon.world: 공식 공지, 업데이트, 업계 뉴스 해설",
          "blog.yeon.world: 개발기, 기술 글, 제품 제작기, 회고",
        ],
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
];

export function getPublicContentChannelConfig(channel: PublicContentChannel) {
  return PUBLIC_CONTENT_CHANNEL_CONFIG[channel];
}

export function getPublicContentArticles(channel?: PublicContentChannel) {
  return channel
    ? PUBLIC_CONTENT_ARTICLES.filter((article) => article.channel === channel)
    : [...PUBLIC_CONTENT_ARTICLES];
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

export function getPublicContentServicesForChannel(
  channel: PublicContentChannel
) {
  const services = new Set(
    getPublicContentArticles(channel).map((article) => article.service)
  );

  return [...services];
}

export function buildPublicContentCanonicalUrl(
  channel: PublicContentChannel,
  slugSegments: readonly string[] = []
) {
  const { host } = getPublicContentChannelConfig(channel);
  const pathname = slugSegments.length > 0 ? `/${slugSegments.join("/")}` : "/";
  return new URL(pathname, host).toString();
}

export function buildPublicContentInternalHref(
  channel: PublicContentChannel,
  slugSegments: readonly string[] = []
) {
  const { internalBasePath } = getPublicContentChannelConfig(channel);
  const suffix = slugSegments.length > 0 ? `/${slugSegments.join("/")}` : "";
  return `${internalBasePath}${suffix}`;
}

export function getPublicContentSitemapEntries(): PublicContentSitemapEntry[] {
  return [
    ...Object.values(PUBLIC_CONTENT_CHANNEL_CONFIG).map((config) => ({
      url: config.host,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
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
