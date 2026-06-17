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
    ctaLabel: "NEXA 설치 페이지 열기",
    ctaHref: "https://discord-ai.yeon.world/install",
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
    ctaLabel: "채널 제외 가이드 보기",
    ctaHref: "/nexa/guides/exclude-channel",
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
    ctaLabel: "응답 없음 문제 해결 보기",
    ctaHref: "/nexa/troubleshooting/bot-not-responding",
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
    ctaLabel: "다시 설치하려면 설치 페이지 열기",
    ctaHref: "https://discord-ai.yeon.world/install",
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
    title: "개인정보와 대화 데이터는 어떻게 처리되나요?",
    description:
      "NEXA 커뮤니티 AI 네트워크에서 질문이 어디로 전달될 수 있는지, 어떤 정보를 입력하지 말아야 하는지 정리했습니다.",
    summary:
      "질문은 Provider PC로 전송될 수 있으므로 민감정보를 입력하지 말고, 대화 원문은 무저장/무로깅 원칙으로 다룹니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
    readingMinutes: 5,
    sourcePaths: [
      "/Users/osuma/coding_stuffs/discord-assitant/i18n/messages.json",
      "/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_SAFETY_POLICY.md",
      "/Users/osuma/coding_stuffs/discord-assitant/README.md",
    ],
    body: [
      {
        type: "paragraph",
        text: "NEXA는 커뮤니티 AI 네트워크 구조를 사용합니다. 질문 내용은 요청을 처리하는 커뮤니티 Provider의 PC로 전송될 수 있으므로 비밀번호, API 키, 토큰, 개인정보, 비공개 문서 같은 민감정보는 입력하면 안 됩니다.",
      },
      {
        type: "heading",
        title: "대화 데이터 원칙",
      },
      {
        type: "checklist",
        items: [
          "사용자 질문과 답변 원문은 데이터베이스에 저장하지 않는 것을 원칙으로 둡니다.",
          "라우팅 핫패스에서 프롬프트와 응답 원문을 로그로 남기지 않는 것을 원칙으로 둡니다.",
          "Provider Agent는 프롬프트 원문을 로그나 파일에 저장하지 않는 안내를 갖습니다.",
          "서버 설정, 프롬프트셋, RAG 문서는 기능 제공을 위해 별도 보유 대상이 될 수 있습니다.",
        ],
      },
      {
        type: "heading",
        title: "사용자가 지켜야 할 것",
      },
      {
        type: "steps",
        items: [
          "비밀번호, API 키, 인증 토큰을 질문에 넣지 않습니다.",
          "개인 주민번호, 주소, 전화번호 같은 개인정보를 넣지 않습니다.",
          "회사 내부 문서나 비공개 자료를 그대로 붙여넣지 않습니다.",
          "민감한 내용이 필요하면 공개 가능한 범위로 요약해 질문합니다.",
        ],
      },
      {
        type: "callout",
        title: "디스코드 메시지는 별도입니다",
        text: "NEXA가 대화 원문을 보관하지 않는 원칙과 별개로, 사용자가 디스코드 채널에 남긴 메시지는 해당 디스코드 서버에 남아 있을 수 있습니다.",
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
    ctaLabel: "NEXA 업데이트 보기",
    ctaHref: "https://news.yeon.world/updates/nexa/discord-permission-guides",
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
        type: "checklist",
        items: [
          "support.yeon.world: NEXA 사용법, 문제 해결, FAQ, 정책 안내",
          "news.yeon.world: 공식 공지, 제품 업데이트, 업계 뉴스 해설",
          "blog.yeon.world: 개발기, 기술 선택, 제품 제작 과정",
          "discord-ai.yeon.world: 설치와 제품 진입점",
        ],
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
    ctaLabel: "타자연습 열기",
    ctaHref: "https://typing.yeon.world",
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
    ctaLabel: "타자연습 열기",
    ctaHref: "https://typing.yeon.world",
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
    ctaLabel: "플래시카드 열기",
    ctaHref: "https://card.yeon.world",
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
        title: "입력칸에서는 단축키가 막힙니다",
        text: "링크, 버튼, 입력칸, 선택창, textarea, contenteditable 영역에서는 단축키가 실행되지 않게 막아 두었습니다. 한국어 입력 상태에서도 물리 S 키 스킵은 동작합니다.",
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
    ctaLabel: "커뮤니티 열기",
    ctaHref: "https://community.yeon.world",
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
        ],
      },
      {
        type: "callout",
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
    ctaLabel: "커뮤니티 열기",
    ctaHref: "https://community.yeon.world",
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
      {
        type: "callout",
        title: "support 글을 반복하지 않습니다",
        text: "사용법과 오류 해결은 support에 두고, news는 변경 사실과 필요한 조치만 요약한 뒤 관련 support 문서로 연결합니다.",
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
  {
    channel: PUBLIC_CONTENT_CHANNELS.blog,
    service: PUBLIC_CONTENT_SERVICES.nexa,
    category: "product",
    slugSegments: ["product", "nexa-discord-server-operator-design"],
    title: "NEXA를 Discord 서버 운영자 관점에서 설계하는 이유",
    description:
      "NEXA가 단순 AI 채팅봇이 아니라 Discord 서버 운영자가 이해할 수 있는 권한, 정책, 안전 흐름을 먼저 다루는 이유입니다.",
    summary:
      "서버 관리자는 채널, 권한, 책임, 안전 기준을 관리해야 하므로 NEXA도 운영자 관점의 제품 구조가 필요합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
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
    title: "타자 서비스에서 실시간 서버가 필요한 이유",
    description:
      "YEON 타자연습이 혼자 연습과 별도로 race-server 기반 실시간 방 구조를 두는 이유를 정리했습니다.",
    summary:
      "혼자 연습은 로컬 문장과 덱으로 충분하지만, 방 참여와 참가자 상태는 실시간 서버가 필요합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
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
    title: "플래시카드 서비스에서 게스트 사용성을 고려한 이유",
    description:
      "card.yeon.world가 로그인 전 덱 생성과 로그인 후 계정 이관 흐름을 함께 둔 제품 판단을 정리했습니다.",
    summary:
      "학습 도구는 시작 장벽이 낮아야 하지만, 오래 쓸 덱은 계정에 안전하게 연결되어야 합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
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
    title: "커뮤니티 기능을 작게 시작하는 이유",
    description:
      "community.yeon.world가 큰 SNS보다 글, 댓글, 게스트 정체성 같은 작은 기능부터 시작하는 이유입니다.",
    summary:
      "커뮤니티는 기능 수보다 작성 신뢰, 공개성, 수정·삭제 경계가 먼저 안정되어야 합니다.",
    publishedAt: PUBLISHED_DATE,
    updatedAt: PUBLISHED_DATE,
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
