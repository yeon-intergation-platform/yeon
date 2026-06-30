export const platformServiceAccessPolicies = {
  anonymous: "anonymous",
  authRequired: "auth-required",
  mixed: "mixed",
} as const;

export type PlatformServiceAccessPolicy =
  (typeof platformServiceAccessPolicies)[keyof typeof platformServiceAccessPolicies];

export const platformServiceStatuses = {
  live: "live",
  planned: "planned",
} as const;

export type PlatformServiceStatus =
  (typeof platformServiceStatuses)[keyof typeof platformServiceStatuses];

export type PlatformServiceDescriptor = {
  slug: string;
  href: string;
  publicHref: string;
  title: string;
  summary: string;
  audience: string;
  accessPolicy: PlatformServiceAccessPolicy;
  status: PlatformServiceStatus;
  listedInPlatformHome: boolean;
  /** 개발 중 서비스. 랜딩에서 "(개발중)"으로 표기하고 진입을 막는다. */
  inDevelopment?: boolean;
};

export const PLATFORM_SERVICES = [
  {
    slug: "counseling-service",
    href: "/counseling-service",
    publicHref: "/counseling-service",
    title: "운영 워크스페이스",
    summary:
      "원문 열람, 구조화 요약, AI 질의를 하나의 워크스페이스에서 다룹니다.",
    audience: "교육 운영자 · 멘토",
    accessPolicy: platformServiceAccessPolicies.authRequired,
    status: platformServiceStatuses.live,
    listedInPlatformHome: false,
  },
  {
    slug: "typing-service",
    href: "/typing-service",
    publicHref: "https://typing.yeon.world",
    title: "키보드 타자연습",
    summary:
      "바로 연습을 시작하고 속도와 정확도를 확인할 수 있는 타자 서비스입니다.",
    audience: "타자 연습",
    accessPolicy: platformServiceAccessPolicies.anonymous,
    status: platformServiceStatuses.live,
    listedInPlatformHome: true,
    inDevelopment: true,
  },
  {
    slug: "card-service",
    href: "/card-service",
    publicHref: "https://card.yeon.world",
    title: "플래시카드 덱",
    summary:
      "덱을 만들고 카드를 추가해 바로 복습을 시작할 수 있는 카드 학습 서비스입니다.",
    audience: "카드 학습",
    accessPolicy: platformServiceAccessPolicies.mixed,
    status: platformServiceStatuses.live,
    listedInPlatformHome: true,
  },
  {
    slug: "community",
    href: "/community",
    publicHref: "https://community.yeon.world",
    title: "커뮤니티",
    summary: "실시간 채팅과 커뮤니티 글·댓글 피드를 함께 제공합니다.",
    audience: "커뮤니티",
    accessPolicy: platformServiceAccessPolicies.mixed,
    status: platformServiceStatuses.live,
    listedInPlatformHome: true,
  },
  {
    slug: "todo-service",
    href: "/todo-service",
    publicHref: "https://todo.yeon.world",
    title: "오늘 보드",
    summary:
      "오늘 처리할 일만 고르고 지금 할 일 하나에 집중하는 개인용 데일리 보드입니다.",
    audience: "오늘 할 일",
    accessPolicy: platformServiceAccessPolicies.anonymous,
    status: platformServiceStatuses.live,
    listedInPlatformHome: true,
  },
  {
    slug: "discord-ai",
    href: "https://discord-ai.yeon.world",
    publicHref: "https://discord-ai.yeon.world",
    title: "Discord AI 어시스턴트",
    summary:
      "디스코드 서버에서 AI 응답과 자동화 흐름을 바로 사용할 수 있는 봇 서비스입니다.",
    audience: "Discord AI",
    accessPolicy: platformServiceAccessPolicies.anonymous,
    status: platformServiceStatuses.live,
    listedInPlatformHome: true,
  },
  {
    slug: "news",
    href: "https://news.yeon.world",
    publicHref: "https://news.yeon.world",
    title: "YEON 뉴스",
    summary:
      "서비스 공지, 업데이트, 업계 뉴스 해설을 한 곳에서 확인하는 공식 소식 채널입니다.",
    audience: "공지 · 업데이트",
    accessPolicy: platformServiceAccessPolicies.anonymous,
    status: platformServiceStatuses.live,
    listedInPlatformHome: true,
  },
  {
    slug: "mooddesk",
    href: "/card-service/study-desk",
    publicHref: "https://card.yeon.world/study-desk",
    title: "MoodDesk 집중 작업대",
    summary:
      "내가 고른 카드 덱을 시간에 맞춰 집중 학습 세션으로 실행하는 뽀모도로 작업대입니다.",
    audience: "카드 집중 학습",
    accessPolicy: platformServiceAccessPolicies.anonymous,
    status: platformServiceStatuses.live,
    listedInPlatformHome: true,
  },
  {
    slug: "game-service",
    href: "/game-service",
    publicHref: "https://game.yeon.world",
    title: "게임",
    summary:
      "설치 없이 브라우저에서 바로 즐기는 게임을 한곳에 모은 게임 허브입니다.",
    audience: "미니게임",
    accessPolicy: platformServiceAccessPolicies.anonymous,
    status: platformServiceStatuses.live,
    listedInPlatformHome: true,
  },
] as const satisfies readonly PlatformServiceDescriptor[];

const CANONICAL_ROOT_HOSTS = new Set(["yeon.world", "www.yeon.world"]);

function normalizeRequestHostname(hostname: string | null | undefined) {
  const firstHost = hostname?.split(",")[0]?.trim().toLowerCase();
  if (!firstHost) return "";

  if (firstHost.startsWith("[")) {
    return firstHost.slice(0, firstHost.indexOf("]") + 1);
  }

  return firstHost.split(":")[0] ?? "";
}

export function shouldUseCanonicalServicePublicHref(
  hostname: string | null | undefined
) {
  return CANONICAL_ROOT_HOSTS.has(normalizeRequestHostname(hostname));
}

export function resolvePlatformServiceEntryHref(
  service: Pick<PlatformServiceDescriptor, "href" | "publicHref">,
  hostname: string | null | undefined
) {
  return shouldUseCanonicalServicePublicHref(hostname)
    ? service.publicHref
    : service.href;
}

export function getPlatformServicesForRequest(
  hostname: string | null | undefined
): PlatformServiceDescriptor[] {
  return PLATFORM_SERVICES.filter(
    (service) => service.listedInPlatformHome
  ).map((service) => ({
    ...service,
    publicHref: resolvePlatformServiceEntryHref(service, hostname),
  }));
}

export const PLATFORM_HOME_HREF = "https://yeon.world";
export const DEFAULT_COUNSELING_SERVICE_HREF = "/counseling-service";

export function getPlatformServices() {
  return PLATFORM_SERVICES.filter((service) => service.listedInPlatformHome);
}

export function getPlatformServiceBySlug(slug: string) {
  return PLATFORM_SERVICES.find((service) => service.slug === slug) ?? null;
}

export function getPlatformServiceByPathname(pathname: string) {
  return (
    PLATFORM_SERVICES.find(
      (service) =>
        pathname === service.href || pathname.startsWith(`${service.href}/`)
    ) ?? null
  );
}

export function serviceRequiresAuthentication(
  service: Pick<PlatformServiceDescriptor, "accessPolicy"> | null | undefined
) {
  return service?.accessPolicy === platformServiceAccessPolicies.authRequired;
}
